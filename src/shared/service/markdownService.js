
var lib = {};
var marked = require('marked');
var renderer = new marked.Renderer();

renderer.code = (code, lang) => {
  return `<pre><code class="prettyprint lang-${lang}">${code}</code></pre>`;
};

renderer.listitem = (text) => {
  var starToken = /\[s:(\d{1})(\.5)?\]/;
  if (/<li>/.test(text) || !starToken.test(text)) {
    return `<li>${text}</li>`;
  }
  var mapping = {
    '5': 'five', '4': 'four', '3': 'three', '2': 'two', '1': 'one'
  };
  var parsed = text.replace(starToken, (match, group1, group2) => {
    if (!match) { return; }
    var stars = mapping[group1] + (group2 ? '-and-half' : '');
    return `<i class="${stars}-stars" ></i>`;
  });
  return `<li>${parsed}</li>`;
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
