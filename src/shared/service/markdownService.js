
var lib = {};
var marked = require('marked');

lib.parse = marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

module.exports = lib;
