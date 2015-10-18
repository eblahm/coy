
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

var resetCacheState = () => {
  var articles = transformCachedFiles(editor.getFiles());
  actions.loadArticlesFromCache(articles);
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
  }).load(actions.epicEditorDidMount);
  editor.on('update', actions.articleDidUpdateInCache);
  resetCacheState();
});

actions.removeArticleFromCache.listen(function(slug) {
  editor.remove(slug);
  this.completed(slug);
});

actions.openArticleFromCache.listen(function(slug) {
  if (!editor.getFiles(slug)) {
    editor.importFile(slug, '');
  }
  editor.open(slug);
  var data = editor.getFiles(slug);
  this.completed(slug, {
    slug: slug,
    created: data.created,
    updated: data.modified,
    markdown: data.content
  });
});

actions.openArticleFromServer.completed.listen(function(slug, data) {
  editor.importFile(slug, data.markdown);
  resetCacheState();
});

actions.submit.listen(function(slug) {
  var data = editor.getFiles(slug);
  actions.submitFromCache(slug, data.content);
});