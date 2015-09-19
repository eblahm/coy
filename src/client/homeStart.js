
var React = require('react');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Home = require('../shared/views/home');


React.render((
  <Router
    history={createBrowserHistory()}>
    <Route path="/" component={Home}></Route>
  </Router>
), document.getElementById('react-container'));


