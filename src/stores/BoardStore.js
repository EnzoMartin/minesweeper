import {action, computed, observable, reaction} from 'mobx';

import {
  Square,
  Score,
  Row,
} from './Models';
import {STORAGE} from '../constants';

class BoardStore {
  bombsPerSquares = 7.5;

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
    const previousGame = localStorage.getItem(STORAGE.game);

    if (typeof previousGame === 'string') {
      try {
        // Load the saved game
        const previousGame = JSON.parse(localStorage.getItem(STORAGE.game));
        this.timer = parseInt(localStorage.getItem(STORAGE.timer) || 0, 10);

        // Build Map of Squares in format used throughout the store
        const squares = new Map();
        previousGame.squares.forEach((item) => {
          const coordinates = item.id.split('-');
          item.y = coordinates[0];
          item.x = coordinates[1];

          squares.set(item.id, item);
        });

        this.generateExistingBoard(previousGame.width, previousGame.height, previousGame.clicks, squares);
      } catch (err) {
        // No previous valid save game, start a new game
        console.error('Failed to load save game', err);
        this.generateBoard();
      }
    } else {
      this.generateBoard();
    }


    try {
      // Restore the high scores list to the store
      const scores = JSON.parse(localStorage.getItem(STORAGE.scores) || '[]');
      this.highScores = scores.map((item) => {
        return new Score(item);
      });
    } catch (err) {
      // No high scores or invalid data
      console.error('Failed to get high scores', err);
    }

    // Reaction checking for the game ending to trigger deleting the save game and saving the player score
    reaction(
      () => {
        return this.gameOver;
      },
      (gameOver) => {
        if (gameOver) {
          this.isPaused = true;
          localStorage.removeItem(STORAGE.game);
          console.log('Finished! Score:', this.score);

          this.highScores.push(new Score({
            flagsPlaced: this.flagsPlacedCount,
            clicks: this.clicks,
            timer: this.timer,
            revealedBombs: this.revealedBombsCount,
            width: this.width,
            height: this.height,
          }));
        }
      }
    );

    // Reaction to save the high scores when a new score is added
    reaction(
      () => {
        return this.highScores.length;
      },
      () => {
        localStorage.setItem(STORAGE.scores, JSON.stringify(this.highScores));
      }
    );

    // Reaction checking for whether to start or stop the timer
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

    // Reaction to check whether the player has revealed all necessary squares to win
    reaction(
      () => {
        return (this.squaresRevealedCount + this.totalBombsCount) === this.squares.size;
      },
      (isOver) => {
        if (isOver) {
          this.gameOver = true;
        }
      },
      {delay: 100}
    );

    // Reaction for auto-saving the game state to the save game "file"
    reaction(
      () => {
        return this.squaresRevealedCount + this.clicks;
      },
      (count) => {
        if (count) {
          this.saveToLocalStorage();
        }
      }
    );

    // Reaction to end the game if player hits too many bombs
    reaction(
      () => {
        return Math.round(this.revealedBombsCount / this.totalBombsCount * 100);
      },
      (percentage) => {
        if (percentage >= 35) {
          this.gameOver = true;
          console.error('Game Over!');
        }
      }
    );
  }

  /**
   * Get the timer elapse time array in the format of [minutes, seconds, milliseconds]
   * @returns {Array<Number>}
   */
  @computed get timeElapsed() {
    let minutes = Math.floor(this.timer / 60000);
    let seconds = ((this.timer % 60000) / 1000).toFixed(0);
    let milliseconds = ((this.timer % 1000) / 10).toFixed(0);

    milliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return [minutes, seconds, milliseconds];
  }

  /**
   * Get the "3BV" score of the player
   * @returns {Number}
   */
  @computed get score() {
    return this.clicks > this.minimumClicks ? this.minimumClicks + (this.minimumClicks - this.clicks) : this.minimumClicks;
  }

  /**
   * Get whether the game has started and is on-going
   * @returns {Boolean}
   */
  @computed get hasStarted() {
    return this.timer > 0 && !this.gameOver;
  }

  /**
   * Get the total amount of squares on the board
   * @returns {number}
   */
  @computed get totalSquaresCount() {
    return this.height * this.width;
  }

  /**
   * Get the total amount of bombs on the board
   * @returns {Number}
   */
  @computed get totalBombsCount() {
    return Math.ceil(this.totalSquaresCount / this.bombsPerSquares);
  }

  /**
   * Get the count of bombs revealed
   * @returns {Number}
   */
  @computed get revealedBombsCount() {
    let count = 0;

    this.bombs.forEach((item) => {
      if (item.isRevealed) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get the count of remaining unrevealed bombs
   * @returns {Number}
   */
  @computed get remainingBombsCount() {
    return this.totalBombsCount - this.revealedBombsCount;
  }

  /**
   * Get the count of remaining flags that can be placed
   * @returns {Number}
   */
  @computed get remainingFlagsCount() {
    return this.totalBombsCount - this.flagsPlacedCount;
  }

  /**
   * Get the count of squares revealed
   * @returns {Number}
   */
  @computed get squaresRevealedCount() {
    let count = 0;

    this.squares.forEach((item) => {
      if (item.isRevealed) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get the count of bombs flagged
   * @returns {Number}
   */
  @computed get bombsFlaggedCount() {
    let count = 0;
    this.bombs.forEach((item) => {
      if (item.isFlag) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get the count of flags placed
   * @returns {Number}
   */
  @computed get flagsPlacedCount() {
    let count = 0;
    this.squares.forEach((item) => {
      if (item.isFlag) {
        count++;
      }
    });

    return count;
  }

  /**
   * Returns the current board status with just the squares that should be saved
   * @returns {{width: Number, height: Number, clicks: Number, squares: Array<Object>}}
   */
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

  /**
   * Persist the current game state to a save "file"
   */
  saveToLocalStorage = () => {
    localStorage.setItem(STORAGE.game, JSON.stringify(this.getSaveState));
  };

  /**
   * Reset the timer
   */
  @action resetTimer() {
    this.timer = 0;
  }

  /**
   * Start the timer interval
   */
  @action startTimer() {
    this.timerInterval = setInterval(() => {
      this.timer += 10;
      localStorage.setItem(STORAGE.timer, this.timer);
    }, 10);
  }

  /**
   * Stop and clear the timer interval
   */
  @action stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Toggle the pause state
   * @param isPaused
   */
  @action togglePause(isPaused) {
    this.isPaused = isPaused;
  }

  /**
   * Increment the player click count
   */
  @action incrementClicks() {
    this.clicks++;
  }

  /**
   * Generate a board from the provided squares map from a save game
   * @param {Number} width
   * @param {Number} height
   * @param {Number} clicks
   * @param {Map<Square>} previousSquares
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

  /**
   * Reset the player properties for a new game and deletes any saved game
   */
  @action resetPlayer() {
    this.resetTimer();
    this.isPaused = true;
    this.gameOver = false;
    this.clicks = 0;
    localStorage.removeItem(STORAGE.game);
  }

  /**
   * Generate a new board with the default or provided dimensions
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

    // Waits for first click before adding bombs to ensure player never clicks a bomb on first click
    this.firstClickDispose = reaction(
      () => {
        return this.squaresRevealedCount;
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

  /**
   * Generates the bombs to place on the board
   */
  @action generateBomb() {
    let bombsRemaining = this.totalBombsCount;
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
