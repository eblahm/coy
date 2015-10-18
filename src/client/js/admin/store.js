
var Reflux = require('reflux');
var actions = require('./actions');
var _ = require('lodash');
var initialOpenArticle = () => {
  var articles = _.get(window, 'COY_ADMIN.articles', {});
  return _.get(_.values(articles), '[0]', {});
};

var state = {
  articlesOnServer: _.get(window, 'COY_ADMIN.articles', {}),
  articlesInCache: {},
  openArticle: initialOpenArticle()
};

module.exports = Reflux.createStore({

  init: function() {
    this.listenToMany(actions);
    this.trigger(state);
  },

  // LOADING STUFF
  onLoadArticlesFromServerCompleted: function(articles) {
    state.articlesOnServer = articles;
    this.trigger(state);
  },

  onLoadArticlesFromCache: function(articles) {
    state.articlesInCache = articles;
    this.trigger(state);
  },

  onEpicEditorDidMount: function() {
    this.openAny();
  },

  // OPENING STUFF
  onOpenArticle: function(slug) {
    var cached = state.articlesInCache;
    var saved = state.articlesOnServer;
    if (_.has(saved, slug) &&
        !_.trim(_.get(cached, `[${slug}].markdown`, ''))) {
      actions.openArticleFromServer(slug);
    } else {
      actions.openArticleFromCache(slug);
    }
  },

  onOpenArticleFromServerCompleted: function(slug, data) {
    state.openArticle = data;
    this.trigger(state);
  },

  onOpenArticleFromCacheCompleted: function(slug, data) {
    state.openArticle = data;
    state.articlesInCache[slug] = data;
    this.trigger(state);
  },

  openAny: function() {
    actions.openArticle(_.keys(state.articlesOnServer)[0]);
  },

  // REMOVING STUFF
  onRemoveArticleOnServerCompleted: function(slug) {
    delete state.articlesOnServer[slug];
    actions.removeArticleFromCache(slug);
    this.openAny();
  },

  onRemoveArticleFromCacheCompleted: function(slug) {
    delete state.articlesInCache[slug];
    this.trigger(state);
    this.openAny();
  },

  // updating stuff
  onArticleDidUpdateInCache: function(data) {
    state.openArticle.markdown = data.content;
    state.openArticle.updated = data.modified;
    state.articlesInCache[state.openArticle.slug].markdown = data.content;

    if (!this.isUpdating) {
      this.isUpdating = true;
      _.delay(() => {
        this.isUpdating = false;
        this.trigger(state);
      }, 1000);
    }
  },

  onSubmitFromCacheCompleted: function(slug, data) {
    state.articlesOnServer[slug] = data;
    this.trigger(state);
  }
});
