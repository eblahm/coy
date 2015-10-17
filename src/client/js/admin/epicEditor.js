
var _ = require('lodash');

var actions = require('./actions');

var markdownService = require('../../../shared/service/markdownService');
var editor;

var transformCachedFiles = (files) => {
  return _.reduce(files, (articles, data, key) => {
    if (key === 'epiceditor') { return articles; }
    articles[key] = {
      slug: key,
      created: data.created,
      updated: data.modified,
      markdown: data.content
    };
    return articles;
  }, {});
};

actions.epicEditorCanMount.listen(() => {
  editor = new window.EpicEditor({
    basePath: '/lib/epiceditor/epiceditor',
    focusOnLoad: true,
    autogrow: true,
    parser: markdownService.parse,
    textarea: document.getElementById('markdown-content'),
    theme: {
      editor: '../../../../css/editor-theme.css',
      preview: '../../../../css/editor-preview-theme.css',
      base: '../../../../css/editor-base-theme.css'
    }
  }).load();
  var articles = transformCachedFiles(editor.getFiles());
  actions.loadArticlesFromCache(articles);
});

actions.openArticleFromCache.listen(function(slug) {
  editor.open(slug);
  var articles = transformCachedFiles(editor.getFiles());
  actions.loadArticlesFromCache(articles);
  this.completed(articles[slug]);
});

actions.submit.listen(function(slug) {
  var article = transformCachedFiles(editor.getFiles(slug))[0];
  actions.submitFromCache(slug, article.markdown);
});
