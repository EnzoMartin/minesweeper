import 'react-app-polyfill/ie11';
import './polyfill';

import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
