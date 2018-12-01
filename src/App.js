import React, {Component} from 'react';
import {Provider} from 'mobx-react';
import {Route, BrowserRouter, Switch} from 'react-router-dom';

import BoardStore from './stores/BoardStore';

import DefaultLayout from './layouts/DefaultLayout';

import './scss/style.scss';

const stores = {boardStore: new BoardStore()};

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <BrowserRouter>
          <Switch>
            <Route path='/' component={DefaultLayout} />
          </Switch>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
