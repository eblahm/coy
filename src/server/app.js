
var express = require('express');
var inspect = require('util').inspect;
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var RedisStore = require('connect-redis')(session);
var config = require('config');
var logger = require('morgan');
var compression = require('compression');

var cache = require('./service/cache');
var controllers = require('./controllers');
var _ = require('lodash');

var app = express();

// what configuration should be exposed to the html templates
app.locals.config = _.pick(config, ['google_analytics_id']);

app.use(session({
  secret: config.get('session_secret'),
  store: new RedisStore({client: cache})
}));

require('./middleware/templating')(app);

app.use(logger('dev'));
app.use(compression());
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', controllers.home);
app.get('/admin', controllers.admin);
app.use('/github', controllers.auth);
app.use('/article', controllers.article);
app.get('/rss', controllers.rss);
app.get('/icons', (req, res) => res.render('icons.html'));

app.get('/:article', controllers.home);

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
