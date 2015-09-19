
var path = require('path');
var fs = require('fs');

module.exports = fs.readdirSync(__dirname).reduce((memo, fname) => {
  var basename = path.basename(fname, '.js');
  if (basename !== 'index') {
    memo[basename.replace(/Controller/, '')] = require('./' + basename);
  }
  return memo;
}, {});

