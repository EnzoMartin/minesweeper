import uuidV4 from 'uuid/v4';
import {action, computed, observable, reaction} from 'mobx';

class Square {
  @observable x = '';
  @observable y = '';

  /**
   * Create a new Square
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = uuidV4();
    this.x = data.x;
    this.y = data.y;
  }
}

export {Square};
