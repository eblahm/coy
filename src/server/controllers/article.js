
var router = require('express').Router();
var github = require('../service/github');
var assert = require('assert');
var _ = require('lodash');
var contentService = require('../content');
var bluebird = require('bluebird');

var PROJECT_RELATIVE_CONTENT_ROOT = 'src/server/content';

router.post('', (req, res, next) => {
  var content = req.body.content;
  var slug = req.body.name;

  assert.ok(content, 'must provide article content');
  assert.ok(slug, 'must provide a name');
  assert.ok(req.session.githubToken, 'must be logged in');
  assert(!_.contains(req.body.name, '..'), 'file name must not contain ".." ');

  var repo = github.repo('eblahm/coy', req.session.githubToken);
  console.log('attempting to make commit %j', req.body);

  contentService.getMeta().then((articleMeta) => {
    var nowISOString = new Date().toISOString();
    articleMeta[slug] = {
      created: articleMeta.created || nowISOString,
      updated: nowISOString
    };
    return repo.commit([
        {fname: `${PROJECT_RELATIVE_CONTENT_ROOT}/${slug}.md`, content: content},
        {fname: `${PROJECT_RELATIVE_CONTENT_ROOT}/meta.json`, content: JSON.stringify(articleMeta, undefined, 2)},
      ], `update ${slug}.md`)
    .then(() => {
      return bluebird.all([
        contentService.updateMeta(articleMeta),
        contentService.setContent(slug, content)
      ]);
    });
  })
  .then(() => {
    res.redirect('/');
  }, next);

});

module.exports = router;

