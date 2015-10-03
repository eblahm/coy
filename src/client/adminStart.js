
new EpicEditor({
  basePath: '/lib/epiceditor/epiceditor',
  focusOnLoad: true,
  autogrow: true,
  parser: require('../shared/service/markdownService').parse,
  textarea: document.getElementById('markdown-content'),
  theme: {
    editor: '../../../../css/editor-theme.css',
    preview: '../../../../css/editor-preview-theme.css',
    base: '../../../../css/editor-base-theme.css'
  }
}).load();

