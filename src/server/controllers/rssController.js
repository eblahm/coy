
var RSS = require('rss');
var config = require('config');
var rssConfig = config.get('rss');
var protocol = config.get('ssl') ? 'https' : 'http';
var moment = require('moment');
var articleService = require('../service/articleService');
var _ = require('lodash');

// cache the xml to send to clients
var rssDateFormat = (momentObj) => {
  return momentObj.utc().format('ddd, DD MMM YYYY HH:mm:ss GMT');
};

module.exports = (req, res, next) => {
  var lastMonday = moment().day(-1);
  articleService.getAllFullOrderByCreatedDesc().then((articles) => {
    var lastBuild = moment(articles[0].created);

    var feed = new RSS({
      title: rssConfig.title,
      description: rssConfig.description,
      feed_url: `${protocol}://${req.hostname}${req.path}`,
      site_url: `${protocol}://${req.hostname}`,
      image_url: rssConfig.image_url,
      language: rssConfig.language,
      pubDate: rssDateFormat(lastMonday),
      lastBuildDate: rssDateFormat(lastBuild)
    });

    _.each(articles, (item) => {
      if (!_.contains(rssConfig.included_categories, item.category)) {
        return;
      }
      feed.item({
        title: item.title,
        description: item.content.html,
        url: `${protocol}://${req.hostname}/${item.slug}`,
        author: 'Matthew Halbe', // TODO: get this content into article meta
        date: item.created
      });
    });

    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml()).end();
  }, next);
};
