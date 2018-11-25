import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';

import Board from './containers/Board';

import {ROUTES} from './constants';

export const routes = [
  {path: ROUTES.home, exact: true, name: 'Game', component: Board},
];

class Router extends Component {
  render() {
    return (
      <Switch>
        {routes.map((route) => {
          return <Route key={route.path} {...route} />;
        })}
      </Switch>
    );
  }
}

export default Router;
