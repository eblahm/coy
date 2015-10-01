

$(() => {
  new EpicEditor({
    basePath: '/lib/epiceditor/epiceditor',
    theme: {
      editor: '../../../../css/editor-theme.css',
      preview: '../../../../css/editor-preview-theme.css',
      base: '../../../../css/editor-base-theme.css'
    }
  }).load();

});
