const {injectBabelPlugin} = require('react-app-rewired');

module.exports = (config) => {
  config = injectBabelPlugin(['@babel/plugin-proposal-class-properties', {loose: true}], config);
  config = injectBabelPlugin(['@babel/plugin-proposal-decorators', {legacy: true}], config);

  return config;
};

