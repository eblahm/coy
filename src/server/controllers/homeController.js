
var React = require('react');

var contentService = require('../service/contentService');
var NotFoundError = require('../errors/NotFoundError');
var reactHome = React.createFactory(require('../../shared/views/home'));
var articleService = require('../service/articleService');

module.exports = (req, res, next) => {
  var slug = req.params.article;

  return articleService.getAllOrderByCreatedDesc()
    .then((allArticles) => {
      slug = slug || allArticles[0].slug;
      return contentService.getContent(slug, !!req.query.flush)
        .then((content) => {
          res.render('home.html', {
            content: content,
            allArticles: allArticles,
            reactMarkup: React.renderToStaticMarkup(reactHome({content: content}))
          });
        }, (err) => next(new NotFoundError(err)));
    }, next);
};
