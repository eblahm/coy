
var contentService = require('./contentService');
var _ = require('lodash');

var lib = {};

lib.getAllOrderByCreatedDesc = () => {
  return contentService
    .getMeta()
    .then(_)
    .call('map', (obj, key) => {
      obj.slug = key;
      return obj;
    })
    .call('sortBy', (data) => -1 * new Date(data.updated).getTime())
    .call('value');
};

module.exports = lib;
