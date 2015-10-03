
var contentService = require('../service/contentService');

module.exports = (req, res, next) => {

  contentService.getMeta().then((data) => {
    res.render('admin.html', {
      isAdmin: !!req.session.githubToken,
      articles: data
    });
  }, next);

};
