
var Reflux = require('reflux');
var $ = require('jquery');

var actions = Reflux.createActions({
  'epicEditorCanMount': {},
  'epicEditorDidMount': {},

  'openArticle': {},

  'openArticleFromServer': {children: ['completed','failed']},
  'loadArticlesFromServer': {children: ['completed','failed']},
  'removeArticleOnServer': {children: ['completed','failed']},

  'openArticleFromCache': {children: ['completed','failed']},
  'loadArticlesFromCache': {},
  'removeArticleFromCache': {children: ['completed','failed']},
  'articleMarkdownDidUpdate': {},
  'articleMetaDidUpdate': {},

  'submit': {children: ['completed','failed']},
});

actions.openArticleFromServer.listen(function(slug) {
  $.getJSON(`/article/${slug}`)
  .then(
    (data) => {
      this.completed(slug, data);
    },
    (err) => this.failed(err)
  );
});

actions.removeArticleOnServer.listen(function(slug) {
  return $.ajax({
    url: `/article/${slug}`,
    method: 'DELETE'
  }).then(
    () => this.completed(slug),
    (err) => this.failed(err)
  );
});

actions.submit.listen(function(data) {
  $.ajax({
    url: '/article',
    method: 'POST',
    dataType: 'json',
    data: data
  }).then(
    (data) => {
      this.completed(data.slug, data);
    },
    (err) => this.failed(err)
  );
});

module.exports = actions;
