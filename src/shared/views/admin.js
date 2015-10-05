
var React = require('react');
var EpicEditorComponent = require('./epicEditor');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');
var MUST_LOAD = 'loading...';

const KEYPRESS = {ENTER: 13};

module.exports = React.createClass({

  getInitialState() {
    return {
      commitedArticles: _.get(window, 'COY_ADMIN.articles', {}),
      articles: {},
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

    this.loadArticlesFromServer();
    this.loadArticlesFromCache();
    setTimeout(() => {
      this.loadInitialActiveArticle();
    }, 0);
  },

  loadInitialActiveArticle: function() {
    // set the editor to some random content
    var anySlug = _.keys(this.state.articles).pop();
    return anySlug && this.openArticle(anySlug);
  },

  openArticle: function(slug, event) {
    var articles = _.clone(this.state.articles);
    var editor = this.EPIC_EDITOR;
    var self = this;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (editor.getFiles(slug).content === MUST_LOAD) {
      this.getArticleFromServer(slug).then((data) => {
        editor.importFile(slug, data.markdown);
        articles[slug].unsavedChanges = false;
        self.setState({articles: articles});
      });
    }
    editor.open(slug);
    self.setState({selectedSlug: slug});

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

  getArticleFromServer: function(slug) {
    return $.getJSON(`/article/${slug}`)
      .then(
        (data) => {
          data.markdown = data.markdown.replace(/\r/g, '');
          return data;
        }
      );
  },

  loadArticlesFromServer: function() {
    var editor = this.EPIC_EDITOR;
    _.each(this.state.commitedArticles, (article, slug) => {
      if (!this.EPIC_EDITOR.getFiles(slug)) {
        editor.importFile(slug, MUST_LOAD);
      }
    });
  },

  loadArticlesFromCache: function() {
    var cachedData = this.EPIC_EDITOR.getFiles();

    var cachedArticles = _.reduce(cachedData, (articles, data, key) => {
      if (key === 'epiceditor') { return articles; }
      var commitedArticle = this.state.commitedArticles[key];
      var isClean = _.get(commitedArticle, 'markdown') === data.content.replace(/\r/g, '');
      articles[key] = {
        slug: key,
        create: data.created,
        updated: data.modified,
        markdown: data.content,
        unsavedChanges: !isClean,
        draft: !commitedArticle
      };

      return articles;
    }, _.clone(this.state.articles));
    this.setState({articles: cachedArticles});
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

  onSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var slug = this.state.selectedSlug;
    var markdown = this.EPIC_EDITOR.getFiles(slug).content;
    var self = this;
    $.ajax({
      url: '/article',
      method: 'POST',
      data: {
        content: markdown,
        slug: slug
      },
      dataType: 'json'
    }).then((data) => {
      var articles = _.clone(self.state.articles);
      articles[slug] = data;
      articles[slug].draft = false;
      self.setState({articles: articles});
    }, (err) => {
      alert('sorry there was an error commiting your article');
    });
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
      <form className="edit-form-container">
        <section className="title vbold">{_.get(this.state.articles, `[${selectedSlug}].draft`) ? `${selectedSlug}.md` : this.getArticleLink(selectedSlug)}</section>
        <div className="article-meta-input">
          <input id="title" name="name" type="text" style={{"display":"none"}} placeholder="Title.." value={selectedSlug}/>
        </div>

        <EpicEditorComponent id="epiceditor" />

        <footer>
          <button onClick={this.onSubmit}>Commit</button>
        </footer>
      </form>
    </div>)
  }
});
