
var path = require('path');

const TEMPLATE_ROOT = path.join(__dirname, '..', 'views');

module.exports = (app) => {
  var env = require('nunjucks')
    .configure(TEMPLATE_ROOT, {
      express: app
    });

  env.addFilter('stringify', (obj) => JSON.stringify(obj, undefined, 2));

};

