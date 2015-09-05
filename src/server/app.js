
var koa = require('koa');
var app = koa();
var nunjucks = require('nunjucks').configure('views', {});

app.use(function *(next) {
  this.render = (...args) => {
    this.body = nunjucks.render.apply(nunjucks, args);
  };
  yield next;
});

app.use(function *() {
  this.render('index.html', {});
});

module.exports = app;
