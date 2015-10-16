
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
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

lib.toHTML = (markdownText) => {
  return markdownText.replace(/\r/g, '');
};

lib.fromHTML = (markdownText) => {
  return markdownText.replace(/\&nbsp;/g, ' ');
};

module.exports = lib;
