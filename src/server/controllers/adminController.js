
var articleService = require('../service/articleService');
var _ = require('lodash');
var config = require('config');

const REPO_URL = config.get('repo_url');
const CONTENT_ROOT = config.get('content_root');

module.exports = (req, res, next) => {

  articleService.getAllFullOrderByCreatedDesc().then((articles) => {

    articles = _.reduce(articles, (memo, article) => {
      article.markdown = article.content.markdown;
      delete article.content;
      memo[article.slug] = article;
      return memo;
    }, {});

    res.render('admin.html', {
      isAdmin: !!req.session.githubToken,
      articles: articles,
      repoUrl: REPO_URL,
      contentRoot: CONTENT_ROOT,
      config: config.get('blog')
    });
  }, next);

};
