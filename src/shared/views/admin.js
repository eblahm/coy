
var React = require('react');
var EpicEditorComponent = require('./epicEditor');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');
var resolved = (new $.Deferred()).resolve();
var markdownService = require('../service/markdownService');

const KEYPRESS = {ENTER: 13};
const MUST_LOAD = 'loading...';

module.exports = React.createClass({

  getInitialState() {
    return {
      commitedArticles: _.get(window, 'COY_ADMIN.articles', {}),
      articles: {},
      selectedSlug: 'slug',
      unsavedChanges: true
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

    this.EPIC_EDITOR.on('update', this.onArticleUpdate);
    this.loadArticlesFromServer();
    this.loadArticlesFromCache();
    setTimeout(() => {
      this.loadInitialActiveArticle();
    }, 0);
  },

  onArticleUpdate: function(data) {
    return this.state.unsavedChanges || this.setState({unsavedChanges: true});
  },

  loadInitialActiveArticle: function() {
    // set the editor to some random content
    var anySlug = _.keys(this.state.articles).pop();
    return anySlug && this.openArticle(anySlug);
  },

  openArticle: function(slug, event) {
    var articles = _.clone(this.state.articles);
    var editor = this.EPIC_EDITOR;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    editor.open(slug);
    this.setState({
      selectedSlug: slug,
      unsavedChanges: true
    });

    if (this.state.commitedArticles[slug]) {
      return this.loadArticleFromServer(slug);
    }
  },

  removeArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var articles = this.state.articles;

    if (!confirm(`Are you sure you want to delete ${slug}.md?`)) {
      return;
    }

    var removeFromServer = articles[slug].draft ? resolved : $.ajax({url: `/article/${slug}`, method: 'DELETE'});
    removeFromServer.then(() => {
      this.EPIC_EDITOR.remove(slug);
      this.setState({articles: _.omit(articles, slug)});
      this.loadInitialActiveArticle();
    }, (err) => {
      console.error(err);
      alert('there was an error deleting your article');
    });

  },

  flushArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    var isCommited = !!this.state.commitedArticles[slug];

    if (!confirm(`Are you sure you want to flush the unsaved changes for ${slug}.md`)) {
      return;
    }

    this.EPIC_EDITOR.importFile(slug, isCommited ? MUST_LOAD : '');
    this.openArticle(slug);
  },

  loadArticleFromServer: function(slug) {
    var self = this;
    var commitedArticles = _.clone(this.state.commitedArticles);
    var editor = this.EPIC_EDITOR;
    var cachedMarkdown = editor.getFiles(slug).content;
    var shouldLoad = cachedMarkdown === MUST_LOAD;

    $.getJSON(`/article/${slug}`)
      .then(
        (data) => {
          var markdown = markdownService.toHTML(data.markdown);
          if (cachedMarkdown === MUST_LOAD) {
            editor.importFile(slug, markdown); // overwrite existing
            self.setState({unsavedChanges: false});
          } else {
            self.setState({unsavedChanges: !(markdown === cachedMarkdown)});
          }
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
      articles[key] = {
        slug: key,
        create: data.created,
        updated: data.modified,
        markdown: data.content,
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
      selectedSlug: articleSlug,
      unsavedChanges: true
    });

    this.EPIC_EDITOR.open(articleSlug);
  },

  onNewArticleKeyPress: function(event) {
    var val = event.currentTarget.value;
    if (event.charCode === KEYPRESS.ENTER && val) {
      this.onNewArticleCreate(val);
      event.currentTarget.value = '';
    }
  },

  onSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var slug = this.state.selectedSlug;
    var markdown = this.EPIC_EDITOR.getFiles(slug).content;
    markdown = markdownService.fromHTML(markdown);
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
            title="Delete Article"
            onClick={_.curry(this.removeArticle, 3)(article.slug)}
            ></i>
          <i
            className="icon-cross_mark"
            title="Flush Unsaved Changes"
            onClick={_.curry(this.flushArticle, 3)(article.slug)}
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
        <div className="inner-form">
          <section className="title vbold">
            {_.get(this.state.articles, `[${selectedSlug}].draft`) ? `${selectedSlug}.md` : this.getArticleLink(selectedSlug)}
            {this.state.unsavedChanges ? <span className="has-unsaved-changes vll-italic">uncommited changes</span> : ''}
            </section>
          <div className="article-meta-input">
            <input id="title" name="name" type="text" style={{"display":"none"}} placeholder="Title.." value={selectedSlug}/>
          </div>

          <EpicEditorComponent id="epiceditor" />

          <footer>
            <button onClick={this.onSubmit}>Commit</button>
          </footer>
        </div>
      </form>
    </div>)
  }
});
