import React, {Component} from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';

import Square from './Square';

@observer
class BoardRow extends Component {
  render() {
    return (
      <tr>
        {this.props.item.map((item) => {
          return <Square key={item.id} {...this.props} item={item} />;
        })}
      </tr>
    );
  }
}

BoardRow.propTypes = {
  remainingFlags: PropTypes.number,
  item: PropTypes.array,
  isOver: PropTypes.bool,
};

export default BoardRow;
