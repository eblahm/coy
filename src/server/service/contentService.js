
var path = require('path');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var _ = require('lodash');

var markdownService = require('../../shared/service/markdownService');
var cache = require('./cache');
var meta = require('../content/meta.json');
var NotFoundError = require('../errors/NotFoundError');

const HEAD = require('../../../build.json').HEAD.substring(0, 6);
const MARKDOWN_EXT = '.md';
const META_KEY = HEAD + '-meta-json';

exports.updateMeta = (update) => {
  return cache.setAsync(META_KEY, JSON.stringify(update));
};

exports.getMeta = () => {
  return cache.getAsync(META_KEY).then(
      (data) => data ? JSON.parse(data) : _.clone(meta),
      (err) => {
        console.error(err.stack);
        return _.clone(meta);
      }
    );
};

exports.getHTML = (slug, flush) => {
  if (!slug) {
      return bluebird.reject(new NotFoundError());
  }
  var cacheKey = `${HEAD}-${slug}-html`;
  var load = () => {
    console.log(`couldn't find ${cacheKey} in cache, falling back on filesystem`);
    var fullPath = path.join(__dirname, '../content/', slug + MARKDOWN_EXT);
    return fs.readFileAsync(fullPath).then(
      (data) => {
        console.log('attempting to set cache from data on filesystem');
        return exports.setHTML(slug, data.toString());
      },
      (err) => bluebird.reject(new NotFoundError(err))
    );
  };
  if (flush) {
    return load();
  }
  console.log('getting cached data (key:%s) (slug:%s)', cacheKey, slug);
  return exports.getMeta()
    .then((meta) => {
      if (!meta[slug]) {
        return bluebird.reject(new NotFoundError());
      }
      return cache.getAsync(cacheKey)
        .then(
          (html) => {
            return html || load();
          },
          (err) => {
            console.error(err.stack);
            return load();
          }
        );
    });
};

exports.setHTML = (slug, markdownContent) => {
  var cacheKey = `${HEAD}-${slug}-html`;
  var html = markdownService.parse(markdownContent);

  console.log('setting data in cache key:%s', cacheKey);

  return cache.setAsync(cacheKey, html).then(
    () => html,
    (err) => {
      console.error(err.stack);
      return html;
    }
  );

};

// refresh the cache on startup
bluebird.map(_.keys(meta), (slug) => exports.getHTML(slug));
