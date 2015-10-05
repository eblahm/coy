
var meta = require('../content/meta.json');
var cache = require('./cache');
var path = require('path');
var markdownService = require('../../shared/service/markdownService');
var fs = require('fs');
var _ = require('lodash');

var MARKDOWN_EXT = '.md';
var META_KEY = 'meta-json';

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

exports.getContent = (key) => {
  var load = () => {
    var fullPath = path.join(__dirname, '../content/', key + MARKDOWN_EXT);
    return exports.setContent(key, fs.readFileSync(fullPath).toString(), meta[key]);
  };
  return cache.hgetallAsync(key).then(
      (content) => content || load(),
      (err) => load()
    );
};

exports.setContent = (key, markdownContent, articleMeta) => {
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
