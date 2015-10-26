
var router = require('express').Router();
var github = require('../service/github');
var assert = require('assert');
var _ = require('lodash');
var contentService = require('../service/contentService');
var NotFoundError = require('../errors/NotFoundError');
var config = require('config');

const CONTENT_ROOT = config.get('content_root');
const GITHUB_REPO_ID = config.get('repo');
const OMITTED_META = ['slug', 'markdown', 'html'];

var isLoggedIn = (req, res, next) => {
  assert.ok(req.session.githubToken, 'must be logged in');
  next();
};

router.post('', isLoggedIn, (req, res, next) => {
  var markdown = req.body.markdown;
  var slug = req.body.slug;

  assert.ok(markdown, 'must provide article content');
  assert.ok(slug, 'must provide a name');
  assert(!_.contains(req.body.name, '..'), 'file name must not contain ".." ');

  var repo = github.repo(GITHUB_REPO_ID, req.session);
  console.log('attempting to make commit %j', req.body);

  contentService.getMeta().then((articleMeta) => {
    articleMeta = _.reduce(articleMeta, (memo, data, key) => {
      memo[key] = _.omit(data, OMITTED_META);
      return memo;
    }, {});

    var nowISOString = new Date().toISOString();
    articleMeta[slug] = _.assign(
      _.omit(req.body, OMITTED_META),
      {
        created: _.get(articleMeta, `[${slug}].created`, nowISOString),
        updated: nowISOString
      }
    );

    return repo.commit([
        {
          fname: `${CONTENT_ROOT}/${slug}.md`,
          content: markdown
        },
        {
          fname: `${CONTENT_ROOT}/meta.json`,
          content: JSON.stringify(articleMeta, undefined, 2)
        },
      ], `update ${slug}.md`)
    .then(() => contentService.updateMeta(articleMeta))
    .then(() => contentService.setHTML(slug, markdown))
    .then((data) => res.json(data).end(), next);
  });

});

router.delete('/:slug', isLoggedIn, (req, res, next) => {
  var slug = req.params.slug;
  assert.ok(slug, 'must provide a slug');

  contentService.getMeta().then((articleMeta) => {

    assert.ok(articleMeta[slug], 'slug doesn\'t exists');
    articleMeta = _.omit(articleMeta, slug);

    var repo = github.repo(GITHUB_REPO_ID, req.session);
    console.log('attempting to delete article (slug:%s)', slug);

    return repo.commit([
        {
          fname: `${CONTENT_ROOT}/${slug}.md`,
          rm: true
        },
        {
          fname: `${CONTENT_ROOT}/meta.json`,
          content: JSON.stringify(articleMeta, undefined, 2)
        },
      ], `delete ${slug}.md`)
    .then(() => contentService.updateMeta(articleMeta))
    .then(() => res.status(200).end(), next);
  });
});

router.get('/:slug', (req, res, next) => {
  var slug = req.params.slug;
  assert.ok(slug);

  contentService.getHTML(slug).then(
    (html) => html ? res.json({html: html}).end() : new NotFoundError(),
    (err) => next(err)
  );
});

module.exports = router;

