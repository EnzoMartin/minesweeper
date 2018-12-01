import uuidV4 from 'uuid/v4';
import {action, reaction, computed, observable} from 'mobx';

class Square {
  @observable isRevealed = false;
  @observable isFlag = false;
  @observable isBomb = false;
  @observable adjacentBombs = 0;
  @observable neighbors = new Map();

  /**
   * Create a new Square
   * @param {Object} data
   * @param {Number|String} data.x
   * @param {Number|String} data.y
   * @param {Boolean} [data.isBomb]
   * @param {Boolean} [data.isRevealed]
   * @param {Boolean} [data.isFlag]
   * @param {Map<Square>} others
   */
  constructor(data = {}, others) {
    this.others = others;
    this.x = parseInt(data.x, 10);
    this.y = parseInt(data.y, 10);
    this.id = `${this.y}-${this.x}`;

    this.isBomb = data.isBomb || this.isBomb;
    this.isRevealed = data.isRevealed || this.isRevealed;
    this.isFlag = data.isFlag || this.isFlag;

    // Listens to neighbors to determine whether to reveal itself if an empty neighbor square is clicked or revealed
    this.reactionDisposer = reaction(
      () => {
        let shouldReveal = false;
        this.neighbors.forEach((item) => {
          if (!item.isBomb && item.isRevealed && !item.adjacentBombs) {
            shouldReveal = true;
          }
        });
        return shouldReveal;
      },
      (shouldReveal, reaction) => {
        if (shouldReveal) {
          this.isFlag = false;
          this.reveal();
          reaction.dispose();
        }
      },
      {delay: 75}
    );
  }

  /**
   * Returns whether the square should be saved in the save game object
   * @returns {Boolean}
   */
  @computed get shouldSave() {
    return this.isFlag || this.isBomb || this.isRevealed;
  }

  /**
   * Return a reduced JSON object
   * @returns {{id: String, isRevealed: Boolean, isBomb: Boolean, isFlag: Boolean}}
   */
  @computed get toJSON() {
    return {
      id: this.id,
      isRevealed: this.isRevealed,
      isBomb: this.isBomb,
      isFlag: this.isFlag,
    };
  }

  /**
   * Set square to be revealed
   */
  @action reveal() {
    if (!this.isFlag && !this.isRevealed) {
      this.isRevealed = true;
      this.reactionDisposer();
    }
  }

  /**
   * Set square as a bomb
   */
  @action setBomb() {
    this.isBomb = true;
    this.reactionDisposer();
  }

  /**
   * Toggle whether the square is marked with a flag
   */
  @action toggleFlag() {
    if (!this.isRevealed) {
      this.isFlag = !this.isFlag;
    }
  }

  /**
   * Calculate the square's neighbors and bombs unless the square is a bomb
   */
  @action calculateNeighbors() {
    if (!this.isBomb) {
      let adjacentBombs = 0;
      let yStart = this.y - 1;

      const yStop = this.y + 1;
      const xStop = this.x + 1;

      while (yStart <= yStop) {
        let xStart = this.x - 1;
        while (xStart <= xStop) {
          const neighborKey = `${yStart}-${xStart}`;
          const neighbor = this.others.get(neighborKey);

          if (neighbor) {
            this.neighbors.set(neighborKey, neighbor);

            if (neighbor.isBomb) {
              adjacentBombs++;
            }
          }

          xStart++;
        }

        yStart++;
      }

      this.adjacentBombs = adjacentBombs;
    }
  }
}

class Row {
  @observable squares = [];

  /**
   * Create a new Row
   * @param {Object} data
   * @param {Array<Square>} data.squares
   * @param {Number} data.y
   */
  constructor(data = {}) {
    this.id = uuidV4();
    this.squares = data.squares || [];
    this.y = data.y;
  }

  /**
   * Add a square to the row
   * @param {Square} item
   */
  @action addSquare(item) {
    this.squares.push(item);
  }
}

class Score {
  /**
   * Create a new score entry
   * @param {Object} data
   * @param {Number} data.flagsPlaced
   * @param {Number} data.clicks
   * @param {Number} data.timer
   * @param {Number} data.revealedBombs
   * @param {Number} data.width
   * @param {Number} data.height
   * @param {String} [data.timestamp]
   */
  constructor(data) {
    this.flagsPlaced = data.flagsPlaced;
    this.timer = data.timer;
    this.revealedBombs = data.revealedBombs;
    this.width = data.width;
    this.clicks = data.clicks;
    this.height = data.height;
    this.timestamp = data.timestamp || (new Date()).toISOString();
  }

}

export {
  Square,
  Score,
  Row,
};
