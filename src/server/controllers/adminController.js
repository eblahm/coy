
var contentService = require('../service/contentService');
var _ = require('lodash');

module.exports = (req, res, next) => {

  contentService.getMeta().then((data) => {

    _.each(data, (articleData, key) => data[key].slug = key);

    res.render('admin.html', {
      isAdmin: !!req.session.githubToken,
      articles: data
    });
  }, next);

};
