
var contentService = require('./contentService');
var _ = require('lodash');
var sortCreatedDesc = (data) => -1 * new Date(data.created).getTime();

var lib = {};

lib.getAllOrderByCreatedDesc = () => {
  return contentService
    .getMeta()
    .then(_)
    .call('map', (obj, key) => {
      return _.assign({slug: key}, obj);
    })
    .call('sortBy', sortCreatedDesc)
    .call('value');
};

lib.getAllFullOrderByCreatedDesc = () => {
  return contentService
    .getMeta()
    .then(_)
    .call('map', (obj, key) => {
      return _.assign({slug: key}, obj);
    })
    .call('sortBy', sortCreatedDesc)
    .call('value')
    .map((obj) => {
      return contentService.getHTML(obj.slug).then((data) => {
        return _.assign(obj, data);
      });
    });
};

module.exports = lib;
