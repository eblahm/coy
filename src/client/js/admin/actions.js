
var Reflux = require('reflux');
var $ = require('jquery');
var markdownService = require('../../../shared/service/markdownService');

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
  'articleDidUpdateInCache': {},

  'submit': {},
  'submitFromCache': {children: ['completed','failed']},
});

actions.openArticleFromServer.listen(function(slug) {
  $.getJSON(`/article/${slug}`)
  .then(
    (data) => {
      window.localStorage.setItem(`original-${slug}`, data.markdown);
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

actions.submitFromCache.listen(function(slug, markdown) {
  markdown = markdownService.fromHTML(markdown);
  $.ajax({
    url: '/article',
    method: 'POST',
    dataType: 'json',
    data: {
      content: markdown,
      slug: slug
    }
  }).then(
    (data) => {
      window.localStorage.setItem(`original-${slug}`, data.markdown);
      this.completed(slug, data);
    },
    (err) => this.failed(err)
  );
});

module.exports = actions;
