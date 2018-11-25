import React, {Component} from 'react';
import {observer} from 'mobx-react';

import Square from './Square';

@observer
class BoardRow extends Component {
  render() {
    return (
      <tr>
        {this.props.item.map((item) => {
          return <Square key={item.id} item={item} />;
        })}
      </tr>
    );
  }
}

export default BoardRow;
