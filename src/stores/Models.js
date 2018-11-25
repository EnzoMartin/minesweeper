import uuidV4 from 'uuid/v4';
import {action, reaction, observable} from 'mobx';

class Square {
  @observable isRevealed = false;
  @observable isFlag = false;
  @observable isBomb = false;
  @observable adjacentBombs = 0;
  @observable neighbors = new Map();

  /**
   * Create a new Square
   * @param {Object} data
   * @param {Map} others
   */
  constructor(data = {}, others) {
    this.id = uuidV4();
    this.others = others;
    this.x = data.x;
    this.y = data.y;

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
          this.isRevealed = true;
          reaction.dispose();
        }
      },
      {delay: 75}
    );
  }

  /**
   * Calculate the square's neighbors and bombs
   */
  @action calculateNeighbors() {
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

  /**
   * Set square to be revealed
   */
  @action reveal() {
    if (!this.isFlag) {
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
    this.isFlag = !this.isFlag;
  }
}

class Row {
  @observable squares = [];

  /**
   * Create a new Row
   * @param {Object} data
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

export {
  Square,
  Row,
};
