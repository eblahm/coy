
var lib = {};
var marked = require('marked');
var renderer = new marked.Renderer();

renderer.code = (code, lang) => {
  return `<pre><code class="prettyprint lang-${lang}">${code}</code></pre>`;
};

lib.parse = marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

module.exports = lib;
