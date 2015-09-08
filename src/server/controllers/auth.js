
var router = require('express').Router();
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));
var config = require('config');
var assert = require('assert');
var qs = require('querystring');
var crypto = require('crypto');

router.get('/login', (req, res, next) => {

  req.session.githubState = crypto.createHash('md5').update(Math.random().toString()).digest('hex');

  var authParams = qs.stringify({
    client_id: config.get('github.client_id'),
    redirect_uri: config.get('github.redirect_uri'),
    state: req.session.githubState,
    scope: config.get('github.scope')
  });

  res.redirect('https://github.com/login/oauth/authorize?' + authParams);

});

router.get('/callback', (req, res, next) => {

  assert.equal(req.session.githubState, req.query.state);

  request({
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    body: {
      client_id: config.get('github.client_id'),
      client_secret: config.get('github.client_secret'),
      redirect_uri: config.get('github.redirect_uri'),
      code: req.query.code,
      state: req.query.state
    },
    json: true
  }).spread((resp, body) => {
    assert.equal(body.scope, config.get('github.scope'));
    req.session.githubToken = body.access_token;
    res.redirect('/admin');
  })
  .catch((err) => {
    console.error(err.stack);
    res.status(401).send('unauthorized').end();
  });

});

module.exports = router;
