
var meta = require('../../content/meta.json');

exports.update = (key, val) => {
  meta[key] = val;
};

exports.get = (key) => {
  if (key) {
    return meta[key];
  } else {
    return meta;
  }
};
