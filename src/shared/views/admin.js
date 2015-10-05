
var React = require('react');
var EpicEditorComponent = require('./epicEditor');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');

const KEYPRESS = {ENTER: 13};

module.exports = React.createClass({

  getInitialState() {
    var articlesFromServer = _.get(window, 'COY_ADMIN.articles', {});
    return {
      articles: articlesFromServer,
      selectedSlug: {}
    };
  },

  getDefaultProps() {
    return {
      repoUrl: _.get(window, 'COY_ADMIN.REPO_URL'),
      contentRoot: _.get(window, 'COY_ADMIN.CONTENT_ROOT', 'eblahm/coy')
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

    this.loadDirtyArticles();
    this.loadInitialActiveArticle();
  },

  loadInitialActiveArticle: function() {
    // set the editor to some random content
    var anySlug = _.keys(this.state.articles).pop();
    return anySlug && this.openArticle(anySlug);
  },

  openArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.EPIC_EDITOR.open(slug);
    this.setState({selectedSlug: slug});
    this.setMarkdownContentForArticle(slug);
  },

  removeArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.EPIC_EDITOR.remove(slug);
    this.setState({articles: _.omit(this.state.articles, slug)});
    this.loadInitialActiveArticle();
  },

  setMarkdownContentForArticle: function(articleSlug) {
    var editor = this.EPIC_EDITOR;
    var cachedData = editor.getFiles(articleSlug);

    if (_.get(cachedData, 'content')) {
      return;
    }

    $.getJSON(`/article/${articleSlug}`)
      .then(
        (data) => editor.importFile(data.slug, data.markdown.replace(/\r/g, ''))
      );
  },

  loadDirtyArticles: function() {
    var cachedData = this.EPIC_EDITOR.getFiles();

    var combinedArticles = _.reduce(cachedData, (articles, data, key) => {
      if (key === 'epiceditor') { return articles; }
      if (articles[key]) {
        articles[key].draft = false;
        return articles;
      }
      articles[key] = {
        slug: key,
        create: data.created,
        updated: data.modified,
        draft: true
      };
      return articles;
    }, _.clone(this.state.articles));
    this.setState({articles: combinedArticles});
  },

  onNewArticleCreate: function(articleSlug) {
    var articles = this.state.articles;
    var newArticle = {
      slug: articleSlug,
      draft: true
    };

    this.setState({
      articles: _.assign(articles, {[articleSlug]: newArticle}),
      selectedSlug: articleSlug
    });

    this.EPIC_EDITOR.open(articleSlug);

  },


  onNewArticleKeyPress: function(event) {
    var val = event.currentTarget.value;
    if (event.charCode === KEYPRESS.ENTER && val) {
      this.onNewArticleCreate(val);
    }
  },

  sidebarItem: function(article) {
    return (
      <li
        key={article.slug}
        onClick={_.curry(this.openArticle, 3)(article.slug)}
        className={cx({active: article.slug === this.state.selectedSlug})}
      >
        <span className="name">{article.slug}</span>
        <span className="toolbar">
          <i
            className="icon-trash_can"
            onClick={_.curry(this.removeArticle, 3)(article.slug)}
            ></i>
        </span>
      </li>
    );
  },

  getArticleLink: function(slug) {
    var fileName = `${slug}.md`;
    return <a
        href={`${this.props.repoUrl}/blob/master/${this.props.contentRoot}/${fileName}`}
      >
        {fileName}
      </a>
  },

  render() {
    var selectedSlug = this.state.selectedSlug;

    return (
    <div className="admin-container">
      <div className="files-sidebar">
        <section className="title vbold">Commited</section>
        <ul>
          {_.chain(this.state.articles)
            .filter((article) => !article.draft)
            .map(this.sidebarItem).value()}
        </ul>
        <section className="title vbold">Drafts</section>
        <ul>
          {_.chain(this.state.articles)
            .filter((article) => article.draft)
            .map(this.sidebarItem).value()}
          <li className="new-article">
            <input
              type="text"
              placeholder="add article..."
              onKeyPress={this.onNewArticleKeyPress}
            />
          </li>
        </ul>
      </div>
      <form className="edit-form-container" method="post" action="/article">
        <section className="title vbold">{_.get(this.state.articles, `[${selectedSlug}].draft`) ? `${selectedSlug}.md` : this.getArticleLink(selectedSlug)}</section>
        <div className="article-meta-input">
          <input id="title" name="name" type="text" style={{"display":"none"}} placeholder="Title.." value={selectedSlug}/>
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
