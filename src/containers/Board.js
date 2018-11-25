import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';

import {
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';

@inject('boardStore')
@observer
class Board extends Component {
  render() {
    return (
      <div className='animated fadeIn'>
        <Card>
          <CardHeader>
            {'Board'}
          </CardHeader>
          <CardBody>
            {'Hello'}
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default Board;
