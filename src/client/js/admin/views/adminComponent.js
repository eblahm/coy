
var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var cx = require('classnames');
var $ = require('jquery');
var bluebird = require('bluebird');

var DisabledComponent = require('./disableUpdateComponent');
var Saving = require('./saving');
var browserCache = require('../service/browserCacheService');
var store = require('../store');
var actions = require('../actions');

const KEYPRESS = {ENTER: 13};

module.exports = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
    Reflux.connect(store)
  ],

  getInitialState() {
    return {
      articlesOnServer: {},
      articlesInCache: {},
      openSlug: {},
      unsavedChanges: true,
      isSaving: false
    };
  },

  getDefaultProps() {
    return {
      repoUrl: _.get(window, 'COY_ADMIN.REPO_URL'),
      contentRoot: _.get(window, 'COY_ADMIN.CONTENT_ROOT', 'eblahm/coy'),
      categories: _.get(window, 'COY_ADMIN.BLOG_CONFIG.categories', '')
    };
  },

  componentDidMount() {
    actions.epicEditorCanMount();
    this.listenTo(actions.submit.completed, this.onSubmitCompleted);
    this.listenTo(actions.submit.failed, this.onSubmitFailed);
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

  getOpenArticleData: function() {
    var openArticle = this.state.articlesInCache[this.state.openSlug];
    if (!openArticle) {
      return {};
    }
    return _.clone(openArticle);
  },

  onMetaChange: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var openArticle = this.getOpenArticleData();
    var currentTarget = event.currentTarget;
    var name = currentTarget.getAttribute('name');
    var val = currentTarget.value;
    if (this.state.openSlug && name) {
      openArticle[name] = val;
      actions.articleMetaDidUpdate(openArticle, true);
    }
  },

  onSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();
    actions.submit(this.getOpenArticleData());
    this.setState({saving: true});
  },

  onSubmitCompleted: function() {
    this.setState({saving: false});
  },

  onSubmitFailed: function() {
    this.setState({saving: false});
  },

  sidebarItem: function(article) {
    if (!article) { return; }
    return (
      <li
        key={article.slug}
        onClick={_.curry(this.openArticle, 3)(article.slug)}
        className={cx({active: article.slug === this.state.openSlug})}
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
    var fields = ['category', 'title', 'markdown'];
    var onServer = _.get(this.state.articlesOnServer, `[${this.state.openSlug}]`, {})
    onServer = _.pick(onServer, fields);
    var inCache = _.pick(this.getOpenArticleData(), fields);
    return _.isEqual(onServer, inCache);
  },

  getSavedStatus: function() {
    if (this.state.saving) {
      return <Saving renderSpeedInMillis={300} />
    }
    if (!this.isOriginalMarkdown()) {
      return <span className="has-unsaved-changes vll-italic">uncommited changes</span>
    }
  },

  render() {
    var openSlug = this.state.openSlug;
    var openArticle = this.state.articlesInCache[openSlug];
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
            {_.contains(draftKeys, openSlug) ? `${openSlug}.md` : this.getArticleLink(openSlug)}
            {this.getSavedStatus()}
          </section>
          <div className="article-meta-input">
            <input
              name="slug"
              type="text"
              style={{"display":"none"}}
              placeholder="slug.."
              value={openSlug}/>
            <input
              name="title"
              type="text"
              placeholder="Title.."
              value={_.get(openArticle, 'title', '')}
              onChange={this.onMetaChange}
              />
            <select
                name="category"
                value={_.get(openArticle, 'category', '')}
                onChange={this.onMetaChange}
              >
              {_.map(this.props.categories, (category) => {
                return <option value={category}>{category}</option>
              })}
            </select>
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
