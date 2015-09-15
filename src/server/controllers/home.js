
var contentService = require('../content');

module.exports = (req, res, next) => {
  var article = req.params.article;
  if (article) {
    return contentService.getContent(article).then((content) => {
      res.render('index.html', {content: content});
    }, next);
  }
  res.render('index.html', {content: ''});
};
