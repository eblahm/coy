
var path = require('path');
var nunjucks = require('nunjucks');

const TEMPLATE_ROOT = path.join(__dirname, '..', 'views');

module.exports = (app) => {
  var env = nunjucks.configure(TEMPLATE_ROOT, {express: app});

  env.addFilter('stringify', (obj) => JSON.stringify(obj, undefined, 2));

};

