
var router = require('express').Router();
var github = require('../service/github');
var assert = require('assert');
var _ = require('lodash');
var bluebird = require('bluebird');
var fs = require('fs');
var writeFileAsync = bluebird.promisify(fs.writeFile);
var path = require('path');

var ROOT = path.resolve(__dirname, '../../../');

router.post('', (req, res, next) => {
  assert.ok(req.body.content, 'must provide article content');
  assert.ok(req.body.name, 'must provide a name');
  assert.ok(req.session.githubToken, 'must be logged in');
  assert(!_.contains(req.body.name, '..'), 'file name must not contain ".." ');

  var content = req.body.content;
  var fname = `src/content/${req.body.name}.md`;
  var repo = github.repo('eblahm/coy', req.session.githubToken);

  console.log('attempting to make commit %j', req.body);

  repo.commit(fname, content, `update ${req.body.name}.md`)
    .then(() => writeFileAsync(path.join(ROOT, fname), content))
    .then(() => {
      res.redirect('/');
    }, next);

});

module.exports = router;

