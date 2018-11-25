import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import classnames from 'classnames';

import {
  faBomb,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';
import {
  faPauseCircle,
  faPlayCircle,
} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';

import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
} from 'reactstrap';

import BoardRow from '../components/BoardRow';

@inject('boardStore')
@observer
class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {size: this.props.boardStore.width};
  }

  handlePause = () => {
    this.props.boardStore.isPaused = true;
  };

  handleResume = () => {
    this.props.boardStore.isPaused = false;
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.boardStore.generateBoard(this.state.size, this.state.size);
  };

  handleChange = (event) => {
    this.setState({size: event.target.value});
  };

  render() {
    const {
      width,
      totalBombs,
      remainingBombs,
      remainingFlags,
      flags,
      timeElapsed,
      isPaused,
      hasStarted,
      rows,
    } = this.props.boardStore;

    return (
      <div className='animated fadeIn pt-4'>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                {'Settings'}
                <span className='float-right'>
                  {`Elapsed: ${timeElapsed[0]}:${timeElapsed[1]}:${timeElapsed[2]}`}
                </span>
              </CardHeader>
              <CardBody>
                <form onSubmit={this.handleSubmit}>
                  <Row>
                    <Col>
                      <InputGroup>
                        <InputGroupAddon addonType='prepend'>
                          {'Grid Size'}
                        </InputGroupAddon>
                        <Input
                          type='number'
                          required
                          min='10'
                          id='size'
                          name='size'
                          onChange={this.handleChange}
                          value={this.state.size}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <Button block color='success' type='submit'>
                        {'New Game'}
                      </Button>
                    </Col>
                  </Row>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className='pb-4' />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardHeader id='board-header'>
                <Row>
                  <Col>
                    {'Board'}
                  </Col>
                  <Col className={classnames('text-center', {'d-none': !hasStarted})}>
                    <Button onClick={this.handlePause} size='sm'>
                      <Icon icon={faPauseCircle} />
                      {' Pause'}
                    </Button>
                  </Col>
                  <Col>
                    <div className='float-right'>
                      <Icon icon={faBomb} />
                      {` ${remainingBombs} | `}
                      <span className={remainingFlags < 1 ? 'text-danger' : null}>
                        <Icon icon={faFlag} />
                        {` ${flags}/${totalBombs}`}
                      </span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Table className='board position-relative'>
                  <thead>
                    <tr className={classnames({'d-none': !isPaused || !hasStarted})}>
                      <th id='pause-overlay' className='position-absolute' colSpan={width} onClick={this.handleResume}>
                        <div className='h-100 d-flex justify-content-center align-items-center'>
                          <Button color='success'>
                            <Icon icon={faPlayCircle} />
                            {' Resume'}
                          </Button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => {
                      return <BoardRow key={item.id} item={item.squares} remainingFlags={remainingFlags} />;
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Board;
