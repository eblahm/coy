
var _ = require('lodash');
var actions = require('../actions');

var lib = {};

lib.getMeta = (slug) => {
  var data = window.localStorage.getItem(slug);
  if (!data) {
    return {};
  }
  return JSON.parse(data);
};

lib.setMeta = (slug, obj) => {
  window.localStorage.setItem(slug, JSON.stringify(obj));
};

lib.setMetaProp = (slug, key, val) => {
  if (!slug) { throw new Error('invalid slug browserCache:setMetaProp'); }
  var data = _.assign(lib.getMeta(slug), {[key]: val});
  lib.setMeta(slug, data);
};

actions.articleMetaDidUpdate.listen((data) => {
  lib.setMeta(data.slug, data);
});

actions.loadArticlesFromServer.completed.listen((articles) => {
  _.each(articles, (article) => {
    var dataFromCache = lib.getMeta(article.slug);
    var completeData;

    if (!_.keys(dataFromCache).length) {
      console.log('setting inital data in the browser cache');
      completeData = article;
    } else {
      completeData =  _.assign(article, dataFromCache);
    }
    actions.articleMetaDidUpdate(article);
  });
});

module.exports = lib;
