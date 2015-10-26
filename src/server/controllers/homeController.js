
var React = require('react');

var contentService = require('../service/contentService');
var NotFoundError = require('../errors/NotFoundError');
var reactHome = React.createFactory(require('../../shared/views/home'));
var articleService = require('../service/articleService');
var categories = require('config').get('blog.categories');
var _ = require('lodash');

module.exports = (req, res, next) => {
  var slug = req.params.article;

  return articleService.getAllOrderByCreatedDesc()
    .then((allArticles) => {
      var selectedArticle = slug ? _.find(allArticles, (data) => data.slug === slug) : allArticles[0];
      return contentService.getHTML(selectedArticle.slug, !!req.query.flush)
        .then((html) => {
          selectedArticle.html = html;
          res.render('home.html', {
            title: selectedArticle.title,
            content: selectedArticle,
            categories: categories,
            allArticles: allArticles,
            reactMarkup: React.renderToStaticMarkup(reactHome({
              content: selectedArticle,
              html: html,
              articles: allArticles,
              categories: categories
            }))
          });
        }, (err) => next(new NotFoundError(err)));
    }, next);
};
