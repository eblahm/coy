
var meta = require('./meta.json');
var cache = require('../service/cache');
var path = require('path');
var parseMarkdown = require('megamark');
var fs = require('fs');
var _ = require('lodash');

var MARKDOWN_EXT = '.md';
var META_KEY = 'meta-json';

exports.updateMeta = (update) => {
  return cache.hmsetAsync(META_KEY, update);
};

exports.getMeta = () => {
  return cache.hgetallAsync(META_KEY).then(
      (data) => data || _.clone(meta),
      (err) => {
        console.error(err);
        return _.clone(meta);
      }
    );
};

exports.getContent = (key) => {
  var load = () => {
    var fullPath = path.join(__dirname, key + MARKDOWN_EXT);
    return exports.setContent(key, fs.readFileSync(fullPath), meta[key]);
  };
  return cache.hgetallAsync(key).then(
      (content) => content || load(),
      (err) => load()
    ).catch((err) => load());
};

exports.setContent = (key, markdownContent, articleMeta) => {
  var html = parseMarkdown(markdownContent);
  var data = _.assign({
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
