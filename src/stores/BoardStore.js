import {action, computed, observable, reaction} from 'mobx';
import {
  Square,
  Row,
} from './Models';

class BoardStore {
  // Score modifiers
  pointsForCorrectFlag = 10;
  pointsForExplodingMine = -45;
  minesPerSquares = 7.5;

  // Board data
  @observable squares = new Map();
  @observable bombs = new Map();
  @observable rows = [];

  // Board settings
  @observable width = 10;
  @observable height = 10;
  @observable gameOver = false;

  // Timer handling
  @observable timer = 0;
  @observable isPaused = true;

  /**
   * Create Board store
   */
  constructor() {
    this.generateBoard();

    reaction(
      () => {
        return this.gameOver;
      },
      (gameOver) => {
        if (gameOver) {
          this.isPaused = true;
          console.log('Finished! Score:', this.score);
        }
      }
    );

    reaction(
      () => {
        return this.isPaused;
      },
      (isPaused) => {
        if (isPaused) {
          this.stopTimer();
        } else {
          this.startTimer();
        }
      }
    );

    reaction(
      () => {
        let count = 0;

        this.squares.forEach((item) => {
          if (item.isRevealed || (item.isFlag && item.isBomb)) {
            count++;
          }
        });

        return count === this.squares.size;
      },
      (finished) => {
        if (finished) {
          this.gameOver = true;
        }
      }
    );

    reaction(
      () => {
        return Math.round(this.revealedBombs / this.totalBombs * 100);
      },
      (percentage) => {
        if (percentage >= 35) {
          this.gameOver = true;
          console.error('Game Over!');
        }
      }
    );
  }

  @computed get timeElapsed() {
    let minutes = Math.floor(this.timer / 60000);
    let seconds = ((this.timer % 60000) / 1000).toFixed(0);
    let milliseconds = ((this.timer % 1000) / 10).toFixed(0);

    milliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return [minutes, seconds, milliseconds];
  }

  @computed get score() {
    return this.revealedBombs * this.pointsForExplodingMine + this.bombsFlagged * this.pointsForCorrectFlag;
  }

  @computed get totalSquares() {
    return this.height * this.width;
  }

  @computed get totalBombs() {
    return Math.ceil(this.totalSquares / this.minesPerSquares);
  }

  @computed get revealedBombs() {
    let count = 0;

    this.bombs.forEach((item) => {
      if (item.isRevealed) {
        count++;
      }
    });

    return count;
  }

  @computed get hasStarted() {
    return this.timer > 0;
  }

  @computed get remainingBombs() {
    return this.totalBombs - this.revealedBombs;
  }

  @computed get remainingFlags() {
    return this.totalBombs - this.flags;
  }

  @computed get revealed() {
    let count = 0;

    this.squares.forEach((item) => {
      if (item.isRevealed) {
        count++;
      }
    });

    return count;
  }

  @computed get bombsFlagged() {
    let count = 0;
    this.bombs.forEach((item) => {
      if (item.isFlag) {
        count++;
      }
    });

    return count;
  }

  @computed get flags() {
    let count = 0;
    this.squares.forEach((item) => {
      if (item.isFlag) {
        count++;
      }
    });

    return count;
  }

  @action resetTimer() {
    this.timer = 0;
  }

  @action startTimer() {
    this.timerInterval = setInterval(() => {
      this.timer += 10;
    }, 10);
  }

  @action stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  @action generateBoard(width, height) {
    if (this.firstClickDispose) {
      this.firstClickDispose();
    }

    this.width = width || this.width;
    this.height = height || this.height;

    const rows = [];
    const squares = new Map();
    let y = 0;

    while (y < this.height) {
      let x = 0;
      const row = new Row({y});

      while (x < this.width) {
        const square = new Square({y, x}, this.squares);
        squares.set(`${y}-${x}`, square);
        row.addSquare(square);
        x++;
      }

      rows.push(row);
      y++;
    }

    this.firstClickDispose = reaction(
      () => {
        return this.revealed;
      },
      (squares, reaction) => {
        reaction.dispose();
        this.generateMines();
        this.generateAdjacent();
        this.isPaused = false;
      }
    );

    this.resetTimer();
    this.isPaused = true;
    this.gameOver = false;
    this.squares.replace(squares);
    this.rows = rows;
  }

  @action generateMines() {
    let bombsRemaining = this.totalBombs;
    const bombs = new Map();
    const keys = Array.from(this.squares.keys());

    while (bombsRemaining) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const item = this.squares.get(key);

      if (!item.isRevealed && !item.isBomb) {
        item.setBomb();
        bombs.set(key, item);
        bombsRemaining--;
      }

      keys.splice(key, 1);
    }

    this.bombs.replace(bombs);
  }

  @action generateAdjacent() {
    this.squares.forEach((item) => {
      item.calculateNeighbors();
    });
  }
}

export default BoardStore;
