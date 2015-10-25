
var React = require('react');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createBrowserHistory = require('history/lib/createBrowserHistory');
var _ = require('lodash');

var HomeComponent = require('../../../shared/views/home');
var Home = React.createClass({
  render() {
    return <HomeComponent
      {...this.props}
      content={_.get(window, 'COY_PROPS.content', {})}
      articles={_.get(window, 'COY_PROPS.articles', [])}
      categories={_.get(window, 'COY_PROPS.categories', [])}
    />
  }
});

React.render((
  <Router
    history={createBrowserHistory()}>
    <Route path="/" component={Home}>
      <Route path="/:slug" component={Home}></Route>
    </Route>
  </Router>
), document.getElementById('react-container'));


