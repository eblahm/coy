
var router = require('express').Router();
var github = require('../service/github');
var assert = require('assert');
var _ = require('lodash');

router.post('', (req, res, next) => {
  assert.ok(req.body.content, 'must provide article content');
  assert.ok(req.body.name, 'must provide a name');
  assert.ok(req.session.githubToken, 'must be logged in');

  if (_.contains(req.body.name, '..')) { next(new Error('file name must not contain ".." ')); }

  var fname = `src/content/${req.body.name}.md`;
  var repo = github.repo('eblahm/coy', req.session.githubToken);

  console.log('attempting to make commit %j', req.body);

  repo.commit(fname, req.body.content, `update ${req.body.name}.md`, (err, data) => {
    if (err) { return next(err); }
    res.json(data).end();
  });

});

module.exports = router;
