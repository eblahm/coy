
var contentService = require('./contentService');
var _ = require('lodash');
var sortCreatedDesc = (data) => -1 * new Date(data.created).getTime();

var lib = {};

lib.getAllOrderByCreatedDesc = () => {
  return contentService
    .getMeta()
    .then(_)
    .call('map', (obj, key) => {
      obj.slug = key;
      return obj;
    })
    .call('sortBy', sortCreatedDesc)
    .call('value');
};

lib.getAllFullOrderByCreatedDesc = () => {
  return contentService
    .getMeta()
    .then(_)
    .call('map', (obj, key) => {
      obj.slug = key;
      return obj;
    })
    .call('sortBy', sortCreatedDesc)
    .call('value')
    .map(function(obj) {
      return contentService.getContent(obj.slug).then((content) => {
        obj.content = content;
        return obj;
      });
    });
};

module.exports = lib;
