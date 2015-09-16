
var meta = require('./meta.json');
var cache = require('../service/cache');
var path = require('path');
var parseMarkdown = require('megamark');
var fs = require('fs');
var _ = require('lodash');

var MARKDOWN_EXT = '.md';
var META_KEY = 'meta-json';

exports.updateMeta = (val) => {
  return cache.hmsetAsync(META_KEY, val);
};

exports.getMeta = () => {
  return cache.getAsync(META_KEY).then(
      (data) => data || _.clone(meta),
      (err) => {
        console.error(err);
        return _.clone(meta);
      }
    );
};

exports.getContent = (key) => {
  var load = () => {
    var fullPath = path.join(__dirname, key, MARKDOWN_EXT);
    return exports.setContent(key, fs.readFileSync(fullPath));
  };
  return cache.getAsync(key).then(
      (content) => content || load(),
      (err) => load()
    );
};

exports.setContent = (key, markdownContent) => {
  var html = parseMarkdown(markdownContent);
  return cache.setAsync(key, html).then(
    () => html,
    (err) => {
      console.error(err);
      return html;
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
