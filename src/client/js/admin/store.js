
var Reflux = require('reflux');
var actions = require('./actions');
var _ = require('lodash');

var state = {
  articlesOnServer: _.get(window, 'COY_ADMIN.articles', {}),
  articlesInCache: {},
  openArticle: {}
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

  // OPENING STUFF
  onOpenArticle: function(slug) {
    var cachedContent = _.get(state.articlesOnServer, `[${slug}].markdown`);
    var savedContent = _.get(state.articlesOnServer, `[${slug}].markdown`);
    if (savedContent && !_.trim(cachedContent)) {
      actions.openArticleFromServer(slug);
    } else {
      actions.openArticleFromCache(slug);
    }
  },

  onOpenArticleFromServerCompleted: function(data) {
    state.onOpenArticle = data;
    this.trigger(state);
  },

  onOpenArticleFromCacheCompleted: function(data) {
    state.openArticle = data;
    this.trigger(state);
  },

  // REMOVING STUFF
  onRemoveArticleOnServerCompleted: function(slug) {
    delete state.articlesOnServer[slug];
    actions.removeArticleFromCache(slug);
  },

  onRemoveArticleFromCacheCompleted: function(slug) {
    delete state.articlesInCache[slug];
    this.trigger(state);
  },

  // updating stuff
  onArticleDidUpdateInCache: function(data) {
    state.openArticle.markdown = data;
  },

  onSubmitFromCacheCompleted: function(slug, data) {
    state.articlesOnServer[slug] = data;
    this.trigger(state);
  }
});
