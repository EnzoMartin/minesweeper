import {Square} from './../../../src/stores/Models';

describe('Models', () => {
  it('Creates a Square', () => {
    expect(typeof new Square()).to.equal('object');
  });
});
