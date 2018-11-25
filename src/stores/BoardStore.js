import {action, computed, observable, reaction} from 'mobx';
import {
  Square,
  Row,
} from './Models';

class BoardStore {
  @observable squares = new Map();
  @observable rows = [];
  @observable width = 10;
  @observable height = 10;
  @observable totalBombs = 0;
  @observable totalSquares = 100;
  @observable bombsPlaced = false;

  /**
   * Create Board store
   */
  constructor() {
    this.generateBoard();

    reaction(
      () => {
        return this.revealed;
      },
      (squares, reaction) => {
        reaction.dispose();
        this.generateMines();
        this.generateAdjacent();
      }
    );

    reaction(
      () => {
        return this.bombsPlaced;
      },
      () => {
        // nothing
      }
    );
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

  @computed get flags() {
    let count = 0;
    this.squares.forEach((item) => {
      if (item.isFlag) {
        count++;
      }
    });

    return count;
  }

  @action generateBoard() {
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

    this.totalSquares = this.width * this.height;
    this.totalBombs = Math.ceil(this.totalSquares / 7.5);
    this.squares.replace(squares);
    this.rows = rows;
  }

  @action generateMines() {
    let bombsRemaining = this.totalBombs;
    const keys = Array.from(this.squares.keys());

    while (bombsRemaining) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const item = this.squares.get(key);

      if (!item.isRevealed && !item.isBomb) {
        item.setBomb();
        bombsRemaining--;
      }

      keys.splice(key, 1);
    }
  }

  @action generateAdjacent() {
    this.squares.forEach((item) => {
      item.calculateNeighbors();
    });
  }
}

export default BoardStore;
