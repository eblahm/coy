
var router = require('express').Router();
var github = require('../service/github');
var assert = require('assert');
var _ = require('lodash');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var path = require('path');
var contentService = require('../content');

var ROOT = path.resolve(__dirname, '../../../');

router.post('', (req, res, next) => {
  var content = req.body.content;
  var slug = req.body.name;

  assert.ok(content, 'must provide article content');
  assert.ok(slug, 'must provide a name');
  assert.ok(req.session.githubToken, 'must be logged in');
  assert(!_.contains(req.body.name, '..'), 'file name must not contain ".." ');

  var fname = `src/server/content/${slug}.md`;
  var fullPath = path.join(ROOT, fname);

  var metaFname = 'src/server/content/meta.json';
  var fullMetaPath = path.join(ROOT, metaFname);

  var nowISOString = new Date().toISOString();
  var articleMeta = contentService.getMeta(slug) || {};
  contentService.updateMeta(slug, {
    created: articleMeta.created || nowISOString,
    updated: nowISOString
  });
  var metaContent = JSON.stringify(contentService.getMeta(), undefined, 2);

  var repo = github.repo('eblahm/coy', req.session.githubToken);
  console.log('attempting to make commit %j', req.body);
  repo.commit([
    {fname: fname, content: content},
    {fname: metaFname, content: metaContent},
  ], `update ${slug}.md`)
    .then(() => {
      return bluebird.all([
        fs.writeFileAsync(fullPath, content),
        fs.writeFileAsync(fullMetaPath, metaContent)
      ]);
    })
    .then(() => {
      res.redirect('/');
    }, next);

});

module.exports = router;

