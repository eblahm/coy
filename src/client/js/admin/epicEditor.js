
var _ = require('lodash');

var actions = require('./actions');

var markdownService = require('../../../shared/service/markdownService');
var browserCache = require('./service/browserCacheService');
var editor;

var transformCachedFiles = (files) => {
  return _.reduce(files, (articles, data, slug) => {
    if (slug === 'epiceditor' || !_.trim(data.content)) {
      return articles;
    }
    var meta = browserCache.getMeta(slug);
    articles[slug] = _.assign(meta, {
      slug: slug,
      markdown: data.content
    });
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
  // there is bug in editor.remove()
  editor.importFile(slug, '');
  this.completed(slug);
});

actions.openArticleFromCache.listen(function(slug) {
  editor.open(slug);
  var data = editor.getFiles(slug);
  if (!data) { return; }
  this.completed(slug, _.assign(browserCache.getMeta(slug), {
    slug: slug,
    markdown: data.content
  }));
});

actions.openArticleFromServer.completed.listen(function(slug, data) {
  editor.importFile(slug, data.markdown);
  browserCache.setMeta(slug, data);
  resetCacheState();
});

actions.submit.preEmit(function(data) {
  var editorData = editor.getFiles(data.slug);
  return _.assign(data, {markdown: editorData.content});
});
