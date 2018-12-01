import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {observer} from 'mobx-react';
import classnames from 'classnames';

import {faBomb, faFlag} from '@fortawesome/free-solid-svg-icons';

@observer
class Square extends Component {
  handleReveal = (event) => {
    event.preventDefault();
    if (!this.props.isOver) {
      this.props.item.reveal();
    }
  };

  handleFlag = (event) => {
    event.preventDefault();
    if (!this.props.isOver && (this.props.remainingFlags > 0 || this.props.item.isFlag)) {
      this.props.item.toggleFlag();
    }
  };

  render() {
    const {item} = this.props;
    const {
      isBomb,
      isFlag,
      isRevealed,
      adjacentBombs,
    } = item;

    const classes = classnames('square', {
      flag: isFlag,
      revealed: isRevealed,
      [`bombs-${adjacentBombs}`]: isRevealed,
    });

    return (
      <td className={classes} onClick={this.handleReveal} onContextMenu={this.handleFlag}>
        {isRevealed ? (
          <div>
            {isBomb ? <Icon icon={faBomb} /> : (
              <Fragment>
                {adjacentBombs ? adjacentBombs : null}
              </Fragment>
            )}
          </div>
        ) : (
          <button type='button'>
            {isFlag ? <Icon icon={faFlag} /> : null}
          </button>
        )}
      </td>
    );
  }
}

Square.propTypes = {
  remainingFlags: PropTypes.number,
  item: PropTypes.object,
  isOver: PropTypes.bool,
};

export default Square;
