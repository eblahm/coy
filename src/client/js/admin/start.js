
var React = require('react');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Admin = require('../../../shared/views/admin');
require('./epicEditor');

React.render((
  <Router
    history={createBrowserHistory()}>
    <Route path="/admin" component={Admin}></Route>
  </Router>
), document.getElementById('react-container'));


