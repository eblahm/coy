
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
      if (!selectedArticle) {
        return next(new NotFoundError());
      }
      return contentService.getHTML(selectedArticle.slug, !!req.query.flush)
        .then((data) => {
          selectedArticle = _.assign(_.clone(selectedArticle), data);
          res.render('home.html', {
            title: selectedArticle.title,
            content: selectedArticle,
            categories: categories,
            allArticles: allArticles,
            reactMarkup: React.renderToStaticMarkup(reactHome({
              content: selectedArticle,
              articles: allArticles,
              categories: categories
            }))
          });
        });
    }, next);
};
