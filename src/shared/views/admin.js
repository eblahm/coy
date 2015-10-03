
var React = require('react');
var EpicEditorComponent = require('./epicEditor');
var _ = require('lodash');
var cx = require('classnames');

module.exports = React.createClass({

  getInitialState() {
    var articles = _.get(window, 'COY_ADMIN.articles', {});
    return {
      articles: articles,
      selectedArticle: _.keys(articles).pop()
    };
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

  onSidbarItemClick: function(selectedArticle) {
    this.setState({selectedArticle: selectedArticle});
  },

  render() {
    return (
    <div className="admin-container">
      <div className="files-sidebar">
        <section className="title vbold">Articles</section>
        <ul>
          {_.map(this.state.articles, (article, name) => {
            return <li
                key={name}
                onClick={_.curry(this.onSidbarItemClick, 3)(name)}
                className={cx({active: name == this.state.selectedArticle})}
              >
                {name}
              </li>
          })}
        </ul>
      </div>
      <form className="edit-form-container" method="post" action="/article">
        <section className="title vbold">Markdown Editor</section>
        <div className="article-meta-input">
          <input id="title" name="name" type="text" style={{"display":"none"}} placeholder="Title.." value={this.state.selectedArticle}/>
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
