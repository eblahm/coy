
var path = require('path');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var _ = require('lodash');

var markdownService = require('../../shared/service/markdownService');
var cache = require('./cache');
var meta = require('../content/meta.json');
var NotFoundError = require('../errors/NotFoundError');

const HEAD = require('../../../build.json').HEAD;
const MARKDOWN_EXT = '.md';
const META_KEY = HEAD + '-meta-json';

exports.updateMeta = (update) => {
  return cache.setAsync(META_KEY, JSON.stringify(update));
};

exports.getMeta = () => {
  return cache.getAsync(META_KEY).then(
      (data) => data ? JSON.parse(data) : _.clone(meta),
      (err) => {
        console.error(err);
        return _.clone(meta);
      }
    );
};

exports.getContent = (key, flush) => {
  if (!key) {
      return bluebird.reject(new NotFoundError());
  }
  key = `${HEAD}-key`;
  var load = () => {
    var fullPath = path.join(__dirname, '../content/', key + MARKDOWN_EXT);
    return fs.readFileAsync(fullPath).then(
      (data) => {
        return exports.setContent(key, data.toString(), meta[key]);
      },
      (err) => bluebird.reject(new NotFoundError(err))
    );
  };
  if (flush) {
    return load();
  }
  return cache.hgetallAsync(key).then(
      (content) => content || load(),
      (err) => load()
    );
};

exports.setContent = (key, markdownContent, articleMeta) => {
  key = `${HEAD}-key`;
  var html = markdownService.parse(markdownContent);
  var data = _.assign({
    slug: key,
    html: html,
    markdown: markdownContent
  }, articleMeta);

  return cache.hmsetAsync(key, data).then(
    () => data,
    (err) => {
      console.error(err);
      return data;
    }
  );

};

// refresh the cache on startup
_.each(fs.readdirSync(__dirname), (fname) => {
  var parsedfname = path.parse(fname);
  if (parsedfname.ext === MARKDOWN_EXT) {
    exports.getContent(parsedfname.name);
  }
});
