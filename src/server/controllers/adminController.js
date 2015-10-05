
var contentService = require('../service/contentService');
var _ = require('lodash');
var config = require('config');

const REPO_URL = config.get('repo_url');
const CONTENT_ROOT = config.get('content_root');

module.exports = (req, res, next) => {

  contentService.getMeta().then((data) => {

    _.each(data, (articleData, key) => data[key].slug = key);

    res.render('admin.html', {
      isAdmin: !!req.session.githubToken,
      articles: data,
      repoUrl: REPO_URL,
      contentRoot: CONTENT_ROOT
    });
  }, next);

};
