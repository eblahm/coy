
var _ = require('lodash');

var actions = require('./actions');

var markdownService = require('../../../shared/service/markdownService');
var editor;
var imports = [];

var resetCacheState = () => {
  _.each(editor.getFiles(), (data, slug) => {
    if (slug === 'epiceditor' || !_.trim(data.content)) {
      return;
    }
    var content = markdownService.fromHTML(data.content);
    actions.articleMarkdownDidUpdate(slug, content);
  });
};

var importIfNeccessary = (article) => {
  if (!editor.getFiles(article.slug)) {
    editor.importFile(article.slug, article.markdown);
  }
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
  editor.on('update', (data) => {
    var content = markdownService.fromHTML(data.content);
    actions.articleMarkdownDidUpdate(editor.settings.file.name, content);
  });
  while (imports.length) {
    importIfNeccessary(imports.pop());
  }
  resetCacheState();
});

actions.removeArticleFromCache.listen(function(slug) {
  editor.remove(slug);
  this.completed(slug);
});

actions.openArticleFromCache.listen(function(slug) {
  editor.open(slug);
});

actions.openArticleFromServer.completed.listen(function(slug, data) {
  editor.importFile(slug, data.markdown);
  editor.open(slug);
});

actions.loadArticlesFromServer.completed.listen((articles) => {
  articles = _.values(articles);
  if (editor) {
    _.each(articles, importIfNeccessary);
  } else {
    imports = articles;
  }
});

actions.submit.preEmit(function(data) {
  var editorData = editor.getFiles(data.slug);
  var markdown = markdownService.fromHTML(editorData.content);
  return _.assign(data, {markdown: markdown});
});
