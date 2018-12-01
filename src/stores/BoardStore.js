import {action, computed, observable, reaction} from 'mobx';
import {
  Square,
  Score,
  Row,
} from './Models';

class BoardStore {
  minesPerSquares = 7.5;

  // Board data
  @observable squares = new Map();
  @observable bombs = new Map();
  @observable rows = [];
  @observable highScores = [];
  @observable clicks = 0;
  @observable minimumClicks = 0;

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
    const previousGame = localStorage.getItem('game');

    if (typeof previousGame === 'string') {
      try {
        const previousGame = JSON.parse(localStorage.getItem('game'));
        this.timer = parseInt(localStorage.getItem('timer') || 0, 10);

        const squares = new Map();
        previousGame.squares.forEach((item) => {
          const coordinates = item.id.split('-');
          item.y = coordinates[0];
          item.x = coordinates[1];

          squares.set(item.id, item);
        });

        this.generateExistingBoard(previousGame.width, previousGame.height, previousGame.clicks, squares);
      } catch (err) {
        // No previous valid save game
        console.error('Failed to load save game', err);
        this.generateBoard();
      }
    } else {
      this.generateBoard();
    }


    try {
      const scores = JSON.parse(localStorage.getItem('scores') || '[]');
      this.highScores = scores.map((item) => {
        return new Score(item);
      });
    } catch (err) {
      // No high scores or invalid data
      console.error('Failed to get high scores', err);
    }

    reaction(
      () => {
        return this.gameOver;
      },
      (gameOver) => {
        if (gameOver) {
          this.isPaused = true;
          localStorage.removeItem('game');
          console.log('Finished! Score:', this.score);

          this.highScores.push(new Score({
            flagsPlaced: this.flags,
            clicks: this.clicks,
            timer: this.timer,
            revealedBombs: this.revealedBombs,
            width: this.width,
            height: this.height,
          }));
        }
      }
    );

    reaction(
      () => {
        return this.highScores.length;
      },
      () => {
        localStorage.setItem('scores', JSON.stringify(this.highScores));
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
        return this.squaresTriggered === this.squares.size;
      },
      (isOver) => {
        if (isOver) {
          this.gameOver = true;
        }
      },
      {delay: 100}
    );

    reaction(
      () => {
        return this.revealed + this.clicks;
      },
      (count) => {
        if (count) {
          this.saveToLocalStorage();
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

  @computed get squaresTriggered() {
    let count = 0;

    this.squares.forEach((item) => {
      if (item.isRevealed || item.isBomb) {
        count++;
      }
    });

    return count;
  }

  @computed get score() {
    return this.clicks > this.minimumClicks ? this.minimumClicks + (this.minimumClicks - this.clicks) : this.minimumClicks;
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
    return this.timer > 0 && !this.gameOver;
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

  @computed get getSaveState() {
    const squares = [];

    if (!this.gameOver) {
      this.squares.forEach((item) => {
        if (item.shouldSave) {
          squares.push(item.toJSON);
        }
      });
    }

    return {
      width: this.width,
      height: this.height,
      clicks: this.clicks,
      squares,
    };
  }

  saveToLocalStorage = () => {
    localStorage.setItem('game', JSON.stringify(this.getSaveState));
  };

  @action resetTimer() {
    this.timer = 0;
  }

  @action startTimer() {
    this.timerInterval = setInterval(() => {
      this.timer += 10;
      localStorage.setItem('timer', this.timer);
    }, 10);
  }

  @action stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Generate a board from the provided squares map
   * @param {Number} width
   * @param {Number} height
   * @param {Number} clicks
   * @param {Map} previousSquares
   */
  @action generateExistingBoard(width, height, clicks, previousSquares) {
    this.width = width;
    this.height = height;
    this.isPaused = true;
    this.clicks = clicks;

    const bombs = new Map();
    const rows = [];
    const squares = new Map();
    let y = 0;

    while (y < this.height) {
      let x = 0;
      const row = new Row({y});

      while (x < this.width) {
        const previousSquare = previousSquares.get(`${y}-${x}`);
        const square = new Square(previousSquare || {y, x}, this.squares);
        squares.set(square.id, square);
        row.addSquare(square);

        if (square.isBomb) {
          bombs.set(square.id, square);
        }

        x++;
      }

      rows.push(row);
      y++;
    }

    this.squares.replace(squares);
    this.rows.replace(rows);
    this.bombs.replace(bombs);

    this.generateAdjacent();
    this.countMinimumClicks();
  }

  @action resetPlayer() {
    this.resetTimer();
    this.isPaused = true;
    this.gameOver = false;
    this.clicks = 0;
    localStorage.removeItem('game');
  }

  /**
   * Generate a new board
   * @param {Number} [width]
   * @param {Number} [height]
   */
  @action generateBoard(width, height) {
    this.resetPlayer();
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
        squares.set(square.id, square);
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
        this.generateBomb();
        this.generateAdjacent();
        this.countMinimumClicks();
        this.isPaused = false;
      }
    );

    this.squares.replace(squares);
    this.rows.replace(rows);
  }

  @action generateBomb() {
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

  /**
   * Count the minimum clicks needed to win
   */
  @action countMinimumClicks() {
    this.minimumClicks = 0;
    this.squares.forEach((item) => {
      if (!item.processed) {
        if (!item.isBomb && !item.adjacentBombs) {
          item.processed = true;

          this.minimumClicks++;
          this.countFloodFill(item);
        }
      }
    });

    this.squares.forEach((item) => {
      if (!item.processed) {
        item.processed = true;

        if (item.adjacentBombs) {
          this.minimumClicks++;
        }
      }
    });
  }

  /**
   * Recursive processing of neighbors for a given square
   * @param {Square} item
   */
  countFloodFill(item) {
    item.neighbors.forEach((neighbor) => {
      if (!neighbor.processed) {
        neighbor.processed = true;

        if (!neighbor.isBomb && !neighbor.adjacentBombs) {
          this.countFloodFill(neighbor);
        }
      }
    });
  }
}

export default BoardStore;
