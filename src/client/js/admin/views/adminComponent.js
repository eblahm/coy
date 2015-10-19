
var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');
var bluebird = require('bluebird');

var DisabledComponent = require('./disableUpdateComponent');
var markdownService = require('../../../../shared/service/markdownService');
var browserCache = require('../service/browserCacheService');
var store = require('../store');
var actions = require('../actions');

const KEYPRESS = {ENTER: 13};

module.exports = React.createClass({
  mixins: [Reflux.connect(store)],

  getInitialState() {
    return {
      articlesOnServer: {},
      articlesInCache: {},
      openArticle: {},
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
    actions.epicEditorCanMount();
  },

  openArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    actions.openArticle(slug);
  },

  removeArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!confirm(`Are you sure you want to delete ${slug}.md?`)) {
      return;
    }
    if (this.state.articlesOnServer[slug]) {
      actions.removeArticleOnServer(slug);
    } else {
      actions.removeArticleFromCache(slug);
    }
  },

  flushArticle: function(slug, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!confirm(`Are you sure you want to flush the unsaved changes for ${slug}.md`)) {
      return;
    }
    actions.removeArticleFromCache(slug);
  },

  onNewArticleCreate: function(articleSlug) {
    actions.openArticleFromCache(_.kebabCase(articleSlug));
  },

  onNewArticleKeyPress: function(event) {
    var val = event.currentTarget.value;
    if (event.charCode === KEYPRESS.ENTER && val) {
      this.onNewArticleCreate(val);
      event.currentTarget.value = '';
    }
  },

  onMetaChange: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var openArticle = _.clone(this.state.openArticle);
    var currentTarget = event.currentTarget;
    var slug = this.selectedSlug();
    var name = currentTarget.getAttribute('name');
    var val = currentTarget.value;
    if (slug && name) {
      openArticle[name] = val;
      browserCache.setMetaProp(slug, name, val);
      this.setState({openArticle: openArticle});
    }
  },

  onSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();
    actions.submit(this.state.openArticle);
  },

  selectedSlug: function() {
    return _.get(this.state.openArticle, 'slug');
  },

  sidebarItem: function(article) {
    if (!article) { return; }
    var selectedSlug = this.selectedSlug();
    return (
      <li
        key={article.slug}
        onClick={_.curry(this.openArticle, 3)(article.slug)}
        className={cx({active: article.slug === selectedSlug})}
      >
        <span className="name">/{article.slug}</span>
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

  isOriginalMarkdown: function() {
    var selectedSlug = this.selectedSlug();
    var originalMarkdown = browserCache.getOriginalMarkdown(selectedSlug);
    var activeMarkdown = this.state.openArticle.markdown;
    if (!originalMarkdown) return false;
    if (!activeMarkdown) return true;
    return originalMarkdown === markdownService.fromHTML(activeMarkdown);
  },

  render() {
    var openArticle = this.state.openArticle;
    var selectedSlug = this.selectedSlug();
    var articlesOnServer = this.state.articlesOnServer;
    var articlesInCache = this.state.articlesInCache;
    var draftKeys = _.difference(_.keys(articlesInCache), _.keys(articlesOnServer));

    return (
    <div className="admin-container">
      <div className="files-sidebar">
        <section className="title vbold">Commited</section>
        <ul>
          {_.map(articlesOnServer, this.sidebarItem)}
        </ul>
        <section className="title vbold">Drafts</section>
        <ul>
          {_.map(draftKeys, (key) => {
            return this.sidebarItem(articlesInCache[key]);
          })}
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
            {_.contains(draftKeys, selectedSlug) ? `${selectedSlug}.md` : this.getArticleLink(selectedSlug)}
            {this.isOriginalMarkdown() ? '' : <span className="has-unsaved-changes vll-italic">uncommited changes</span>}
          </section>
          <div className="article-meta-input">
            <input
              name="slug"
              type="text"
              style={{"display":"none"}}
              placeholder="slug.."
              value={selectedSlug}/>
            <input
              name="title"
              type="text"
              placeholder="Title.."
              value={_.get(openArticle, 'title', '')}
              onChange={this.onMetaChange}
              />
          </div>

          <DisabledComponent id="epiceditor" />

          <footer>
            <button onClick={this.onSubmit}>Commit</button>
          </footer>
        </div>
      </form>
    </div>)
  }
});
