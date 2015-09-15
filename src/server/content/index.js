
var meta = require('./meta.json');
var cache = require('../service/cache');
var path = require('path');
var parseMarkdown = require('megamark');
var fs = require('fs');
var _ = require('lodash');

var refreshCache = (fname) => {
  var ext = '.md';
  var basename = path.basename(fname, ext);
  var markdown = fs.readFileSync(path.join(__dirname, fname));
  var html = parseMarkdown(markdown);
  cache.setAsync(basename, html).catch((err) => console.error(err));
  return html;
};

_.each(fs.readdirSync(__dirname), (fname) => {
  if (path.extname(fname) === '.md') {
    refreshCache(fname);
  }
});

exports.updateMeta = (key, val) => {
  meta[key] = val;
};

exports.getMeta = (key) => {
  if (key) {
    return meta[key];
  } else {
    return meta;
  }
};

exports.getContent = (key) => {
  return cache.getAsync(key).then((content) => {
    return content || refreshCache(key + '.md');
  }, (err) => {
    return refreshCache(key + '.md');
  });
};
