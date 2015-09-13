
var woofmark = require('woofmark');
var hello = require('./hello');
var React = require('react');

woofmark(document.getElementById('editor'), {});

React.render(React.createElement(hello, {}), document.getElementById('react-container'));
