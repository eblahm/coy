
var lib = {};
var marked = require('marked');
var renderer = new marked.Renderer();

renderer.code = (code, lang) => {
  return `<code class="prettyprint lang-${lang}">${code}</code>`;
};

lib.parse = marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

module.exports = lib;
