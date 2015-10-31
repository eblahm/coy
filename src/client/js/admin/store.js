
var Reflux = require('reflux');
var actions = require('./actions');
var _ = require('lodash');
var defaultArticleProps = {category: 'fragments', title: ''};
var initialOpenArticle = () => {
  var articles = _.get(window, 'COY_ADMIN.articles', {});
  return _.get(_.values(articles), '[0]', {});
};

var state = {
  articlesOnServer: _.get(window, 'COY_ADMIN.articles', {}),
  articlesInCache: {},
  openSlug: '',
  openArticle: initialOpenArticle()
};

module.exports = Reflux.createStore({

  init: function() {
    this.listenToMany(actions);
    actions.loadArticlesFromServer.completed(state.articlesOnServer);
  },

  // LOADING STUFF
  onLoadArticlesFromServerCompleted: function(articles) {
    state.articlesOnServer = articles;
    actions.openArticle(_.keys(state.articlesOnServer)[0]);
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
    actions.openArticleFromCache(slug);
  },

  onOpenArticleFromServerCompleted: function(slug, data) {
    state.openSlug = slug;
    state.articlesOnServer[slug] = data;
    this.trigger(state);
  },

  onOpenArticleFromCache: function(slug) {
    state.openSlug = slug;
    if (!_.contains(_.keys(state.articlesInCache), slug)) {
      var update = _.defaults(defaultArticleProps, {slug: slug});
      state.articlesInCache[slug] = update;
      actions.articleMetaDidUpdate(update);
    }
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
  onArticleMarkdownDidUpdate: function(slug, markdown) {
    state.articlesInCache[slug] = _.assign(state.articlesInCache[slug] || {}, {markdown: markdown});

    if (!this.isUpdating) {
      this.isUpdating = true;
      _.delay(() => {
        this.isUpdating = false;
        this.trigger(state);
      }, 1000);
    }
  },

  onArticleMetaDidUpdate: function(data) {
    state.articlesInCache[data.slug] = _.assign(state.articlesInCache[data.slug] || {}, data);
    this.trigger(state);
  },

  onSubmitFromCacheCompleted: function(slug, data) {
    state.articlesOnServer[slug] = data;
    this.trigger(state);
  }
});
