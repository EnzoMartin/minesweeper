import React, {Component} from 'react';
import {Container} from 'reactstrap';

import Navigation from './../Navigation';
import Router from './../Router';

class DefaultLayout extends Component {
  render() {
    return (
      <div className='app'>
        <Navigation />
        <div className='app-body'>
          <main className='main'>
            <div className='modal-overlay' />
            <Container fluid className='main-content'>
              <Router />
            </Container>
          </main>
        </div>
      </div>
    );
  }
}

export default DefaultLayout;
