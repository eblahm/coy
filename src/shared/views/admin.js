
var React = require('react');
var EpicEditorComponent = require('./epicEditor');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');

module.exports = React.createClass({

  getInitialState() {
    var articles = _.get(window, 'COY_ADMIN.articles', {});
    return {
      articles: articles,
      selectedArticle: {}
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

    // set the editor to some random content
    var anyKey = _.keys(this.state.articles).pop();
    return anyKey && this.setMarkdownContentForArticle(anyKey);
  },

  setMarkdownContentForArticle: function(articleSlug) {
    var self = this;
    $.getJSON(`/article/${articleSlug}`)
      .then(
        (data) => {
          var cachedData = self.EPIC_EDITOR.getFiles(data.slug);
          if (!_.get(cachedData, 'content', '').trim()) {
            self.EPIC_EDITOR.importFile(data.slug, data.markdown.replace(/\r/g, ''));
          }
          self.EPIC_EDITOR.open(data.slug);
          self.setState({selectedArticle: data});
        },
        (err) => console.error(err)
      );
  },

  render() {
    var selectedArticle = this.state.selectedArticle;

    return (
    <div className="admin-container">
      <div className="files-sidebar">
        <section className="title vbold">Articles</section>
        <ul>
          {_.map(this.state.articles, (article, name) => {
            return <li
                key={name}
                onClick={_.curry(this.setMarkdownContentForArticle, 3)(name)}
                className={cx({active: name === selectedArticle.slug})}
              >
                {name}
              </li>
          })}
        </ul>
      </div>
      <form className="edit-form-container" method="post" action="/article">
        <section className="title vbold">Markdown Editor</section>
        <div className="article-meta-input">
          <input id="title" name="name" type="text" style={{"display":"none"}} placeholder="Title.." value={selectedArticle.slug}/>
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
