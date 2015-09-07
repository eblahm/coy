
var express = require('express');
var inspect = require('util').inspect;
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);
var config = require('config');

var controllers = require('./controllers');
var _ = require('lodash');

var app = express();

app.use(session({
  secret: config.get('session_secret'),
  store: new MongoStore({url: config.get('database_url')})
}));

require('nunjucks')
  .configure(path.join(__dirname, 'views'), {express: app});

app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', controllers.home);
app.use('/github', controllers.auth);
app.use('/article', controllers.article);

// error handler
app.use((err, req, res, next) => {
  var message = _.get(err, 'message', inspect(err));
  var stack = _.get(err, 'stack');
  var status = _.get(err, 'status', 500);

  // the stack trace will do,
  // otherwise fallback on message,
  // otherwise fallback on a stringified object
  console.error(stack || message);

  res.status(status).send(message).end();
});

module.exports = app;
