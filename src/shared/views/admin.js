
var React = require('react');
var EpicEditorComponent = require('./epicEditor');

module.exports = React.createClass({

  getInitialState() {
    return {};
  },

  componentDidMount() {
    this.EPIC_EDITOR = new EpicEditor({
      basePath: '/lib/epiceditor/epiceditor',
      focusOnLoad: true,
      autogrow: true,
      parser: require('../service/markdownService').parse,
      textarea: document.getElementById('markdown-content'),
      theme: {
        editor: '../../../../css/editor-theme.css',
        preview: '../../../../css/editor-preview-theme.css',
        base: '../../../../css/editor-base-theme.css'
      }
    }).load();
  },


  render: function(){
  return (
  <div className="admin-container">
    <div className="files-sidebar">
      <ul>
        <li><button>Hello</button></li>
      </ul>
    </div>
    <form className="edit-form-container" method="post" action="/article">
      <div className="article-meta-input">
        <input id="title" name="name" type="text" placeholder="Title.."/>
        <input id="slug" type="text" placeholder="Slug.."/>
        <textarea id="markdown-content" name="content" style={{"display":"none"}}></textarea>
      </div>

      <EpicEditorComponent id="epiceditor" />

      <footer>
        <input type="submit" value="Submit"></input>
      </footer>
    </form>
  </div>)
  }
});
