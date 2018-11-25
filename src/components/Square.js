import React, {Component} from 'react';
import {observer} from 'mobx-react';
import classnames from 'classnames';

@observer
class Square extends Component {
  handleClick = (event) => {
    event.preventDefault();
    this.props.item.reveal();
  };

  render() {
    const {item} = this.props;
    const classes = classnames('square', {
      flag: item.isFlag,
      bomb: item.isBomb,
      revealed: item.isRevealed,
      [`bombs-${item.adjacentBombs}`]: item.isRevealed,
    });

    return (
      <td className={classes}>
        {item.isRevealed ? (
          <div>
            {item.adjacentBombs ? item.adjacentBombs : ''}
          </div>
        ) : (
          <button type='button' onClick={this.handleClick}>
            {'?'}
          </button>
        )}
      </td>
    );
  }
}

export default Square;
