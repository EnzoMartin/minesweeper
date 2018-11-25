import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';

import {
  Card,
  CardBody,
  CardHeader,
  Table,
} from 'reactstrap';

import BoardRow from '../components/BoardRow';

@inject('boardStore')
@observer
class Board extends Component {
  render() {
    const {
      width,
      height,
      totalBombs,
      flags,
      rows,
    } = this.props.boardStore;

    return (
      <div className='animated fadeIn'>
        <Card>
          <CardHeader>
            {`Board - ${width} x ${height}, total bombs: ${totalBombs}, flags: ${flags}`}
          </CardHeader>
          <CardBody>
            <Table className='board'>
              <tbody>
                {rows.map((item) => {
                  return <BoardRow key={item.id} item={item.squares} />;
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default Board;
