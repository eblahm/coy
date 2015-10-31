
var _ = require('lodash');
var actions = require('../actions');

const KEY_PREFIX = 'COY_META_CACHE';

var lib = {};

lib.getMeta = (slug) => {
  var data = window.localStorage.getItem(KEY_PREFIX + slug);
  if (!data) {
    return {};
  }
  return JSON.parse(data);
};

lib.setMeta = (slug, obj) => {
  window.localStorage.setItem(KEY_PREFIX + slug, JSON.stringify(obj));
};

lib.setMetaProp = (slug, key, val) => {
  if (!slug) { throw new Error('invalid slug browserCache:setMetaProp'); }
  var data = _.assign(lib.getMeta(slug), {[key]: val});
  lib.setMeta(slug, data);
};

actions.articleMetaDidUpdate.listen((data) => {
  lib.setMeta(data.slug, data);
});

actions.removeArticleFromCache.completed.listen((slug) => {
  window.localStorage.removeItem(KEY_PREFIX + slug);
});

actions.loadArticlesFromServer.completed.listen((articles) => {
  _.each(articles, (article) => {
    var dataFromCache = lib.getMeta(article.slug);
    var completeData;

    if (!_.keys(dataFromCache).length) {
      console.log('setting inital data in the browser cache');
      completeData = article;
    } else {
      completeData =  _.defaults(article, dataFromCache);
    }
    actions.articleMetaDidUpdate(article);
  });

  _.times(window.localStorage.length, (i) => {
    var key = window.localStorage.key(i);
    var slug = key.replace(new RegExp(KEY_PREFIX), '');
    if (key === slug) { // all our keys have the key prefix, if not bail
      return;
    }
    actions.articleMetaDidUpdate(_.assign(lib.getMeta(slug), {slug: slug}));
  });

});

module.exports = lib;
