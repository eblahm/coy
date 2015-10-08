
var React = require('react');

var reject = require('bluebird').reject;
var contentService = require('../service/contentService');
var NotFoundError = require('../errors/NotFoundError');
var reactHome = React.createFactory(require('../../shared/views/home'));
var articleService = require('../service/articleService');

module.exports = (req, res, next) => {
  var slug = req.params.article;

  return articleService.getAllOrderByCreatedDesc()
    .then((allArticles) => {
      return contentService.getContent(slug || allArticles[0].slug)
        .then((content) => {
          res.render('home.html', {
            content: content,
            allArticles: allArticles,
            reactMarkup: React.renderToStaticMarkup(reactHome({content: content}))
          });
        }, (err) => reject(new NotFoundError(err)));
    }, next);
};
