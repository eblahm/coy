
var bluebird = require('bluebird');
var _ = require('lodash');

var contentService = require('../content');
var NotFoundError = require('../errors/NotFoundError');

var sortByLastCreatedDesc = (data) => {
  return -1 * new Date(data.updated).getTime();
};

module.exports = (req, res, next) => {
  var article = req.params.article;

  var getSlug = () => {
    if (article) {
      return bluebird.resolve(article);
    }
    return contentService
      .getMeta()
      .then(_)
      .call('map', (obj, key) => {
        obj.slug = key;
        return obj;
      })
      .call('sortBy', sortByLastCreatedDesc)
      .call('value').get(0).get('slug');
  };

  return getSlug()
    .then((slug) => {
      contentService.getContent(slug).then((content) => {
          res.render('home.html', {content: content, title: slug});
        }, (err) => {
          console.error(err.stack);
          return next(new NotFoundError());
        });
    }).catch(next);
};