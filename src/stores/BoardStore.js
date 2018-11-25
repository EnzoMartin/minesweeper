import {action, computed, observable, reaction} from 'mobx';

class BoardStore {
  @observable squares = new Map();
  @observable rows = new Map();

  /**
   * Create Board store
   */
  constructor() {
    // Nothing
  }
}

export default BoardStore;
