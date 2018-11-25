import 'react-app-polyfill/ie11';
import './polyfill';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
