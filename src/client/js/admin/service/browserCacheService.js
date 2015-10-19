
var _ = require('lodash');

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

lib.setOriginalMarkdown = (slug, markdown) => {
  window.localStorage.setItem(`original-${slug}`, markdown);
};

lib.getOriginalMarkdown = (slug, markdown) => {
  return window.localStorage.getItem(`original-${slug}`);
};

module.exports = lib;
