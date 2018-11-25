import React, {Component, Fragment} from 'react';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {observer} from 'mobx-react';
import classnames from 'classnames';

import {faBomb, faFlag} from '@fortawesome/free-solid-svg-icons';

@observer
class Square extends Component {
  handleReveal = (event) => {
    event.preventDefault();
    this.props.item.reveal();
  };

  handleFlag = (event) => {
    event.preventDefault();
    if (this.props.remainingFlags > 0 || this.props.item.isFlag) {
      this.props.item.toggleFlag();
    }
  };

  render() {
    const {item} = this.props;
    const classes = classnames('square', {
      flag: item.isFlag,
      bomb: item.isBomb, // TODO: Remove when done testing
      revealed: item.isRevealed,
      [`bombs-${item.adjacentBombs}`]: item.isRevealed,
    });

    return (
      <td className={classes}>
        {item.isRevealed ? (
          <div>
            {item.isBomb ? <Icon icon={faBomb} /> : (
              <Fragment>
                {item.adjacentBombs ? item.adjacentBombs : null}
              </Fragment>
            )}
          </div>
        ) : (
          <button type='button' onClick={this.handleReveal} onContextMenu={this.handleFlag}>
            {item.isFlag ? <Icon icon={faFlag} /> : '?'}
          </button>
        )}
      </td>
    );
  }
}

export default Square;
