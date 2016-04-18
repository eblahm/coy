
var React = require('react');
var History = require('react-router').History;
var RightSidebar = require('./rightSidebar.js');
var LeftSidebar = require('./leftSidebar.js');
var Keys = require('./keys');
var _ = require('lodash');
var $ = require('jquery');
var cx = require('classnames');

const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const UP_ARROW = 38;
const DOWN_ARROW = 40;

module.exports = React.createClass({

  mixins: [History],

  getInitialState() {
    return {
      displayLeftSidebar: false,
      displayRightSidebar: false,
      content: this.props.content,
      keyPress: false,
      keyDirection: ''
    };
  },

  getDefaultProps() {
    return {
      articles: [],
      content: {},
      categories: {}
    };
  },

  componentDidMount() {
    this.onPathChange();
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
  },

  isDirectionPad: function(keyCode) {
    return _.contains([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW], keyCode);
  },

  keyDown: function(event) {
    var keyCode = event.keyCode;
    if (!this.isDirectionPad(keyCode)) {
      return;
    }

    var groupedArticles = _.groupBy(this.props.articles, 'category');
    var categories = _.keys(groupedArticles);
    var categoryIndex = categories.indexOf(this.state.content.category);
    var indexWithinCategory = this.getIndexWithinCategory();
    var articlesWithinCategory = this.getArticlesWithinCategory();
    var nextIndex;
    var slug;
    var direction;
    if (keyCode === RIGHT_ARROW) {
      nextIndex = (indexWithinCategory + 1) % articlesWithinCategory.length;
      slug = articlesWithinCategory[nextIndex].slug;
      direction = 'right';
    }
    if (keyCode === LEFT_ARROW) {
      nextIndex = (articlesWithinCategory.length + (indexWithinCategory - 1)) % articlesWithinCategory.length;
      slug = articlesWithinCategory[nextIndex].slug;
      direction = 'left';
    }
    if (keyCode === UP_ARROW) {
      nextIndex = (categoryIndex + 1) % categories.length;
      articlesWithinCategory = groupedArticles[categories[nextIndex]];
      slug = articlesWithinCategory[0].slug;
      direction = 'up';
    }
    if (keyCode === DOWN_ARROW) {
      nextIndex = (categories.length + (categoryIndex - 1)) % categories.length;
      articlesWithinCategory = groupedArticles[categories[nextIndex]];
      slug = articlesWithinCategory[0].slug;
      direction = 'down';
    }
    var update = {keyPress: true, keyDirection: direction};
    this.opening = true;
    this.history.pushState(`/${slug}`);
    $.getJSON(`/article/${slug}`).then(data => {
      this.setState(update);
      setTimeout(() => {
        this.setState({content: data}, () => {
          setTimeout(() => {
            this.setState({keyDirection: ''});
            this.opening = false;
          }, 500);
        });
      }, 500);
    });
  },

  keyUp: function(event) {
    var keyCode = event.keyCode;
    if (this.isDirectionPad(keyCode)) {
      this.setState({keyPress: false});
    }
  },

  componentDidUpdate() {
    document.title = this.state.content.title;
    this.onPathChange();
  },

  onPathChange() {
    if (this.opening) { return; }
    var slug = _.get(this.props, 'params.slug');
    if (slug && slug !== this.state.content.slug) {
      this.open(slug);
    }
  },

  open: function(slug) {
    if (this.opening) { return; }
    this.opening = true;
    return $.getJSON(`/article/${slug}`)
      .then((data) => {
        this.opening = false;
        this.setState({content: data});
      });
  },

  onNavHover: function(event) {
    var side = /left-sidebar/.test(event.currentTarget.className) ? 'Left' : 'Right';
    this.setState({
      [`display${side}Sidebar`]: true
    });
  },

  onSidebarLeave: function(event) {
    var side = /left-sidebar/.test(event.currentTarget.className) ? 'Left' : 'Right';
    this.setState({
      [`display${side}Sidebar`]: false
    });
  },

  getArticlesWithinCategory: function() {
    var groupedArticles = _.groupBy(this.props.articles, 'category');
    return _.get(groupedArticles, `.${this.state.content.category}`, []);
  },

  getIndexWithinCategory: function() {
    var articlesInCategory = this.getArticlesWithinCategory();
    return _.reduce(articlesInCategory, (memo, data, i) => {
      return this.state.content.slug === data.slug ? i : memo;
    }, 0);
  },

  getIndexOfCategory: function() {
    return _.reduce(this.getArticlesWithinCategory(), (memo, data, i) => {
      return this.state.content.slug === data.slug ? i : memo;
    }, 0) + 1;
  },

  bodyWidth: function() {
    if (typeof document !== 'undefined') {
      return document.body.offsetWidth;
    }
    return 1400;
  },

  bodyHeight: function() {
    if (typeof document !== 'undefined') {
      return document.body.offsetHeight;
    }
    return 600;
  },

  render() {
    return (
      <div
        className="flex-container"
      >
        <nav
          className={cx({
            "active": this.state.displayLeftSidebar,
            "enable-left-sidebar": true,
            "secret-nav": true
          })}
          onMouseOver={this.onNavHover}
        />

        <LeftSidebar
          className="sidebar left-sidebar"
          articles={this.props.articles}
          activeSlug={this.state.content.slug}
          onMouseLeave={this.onSidebarLeave}
          categories={this.props.categories}
        />


        <section
          className={cx({
            "show-right-sidebar": this.state.displayRightSidebar,
            "show-left-sidebar": this.state.displayLeftSidebar,
            "content-container": true
          })}
        >
          <div className="num-of-section vmediumi">
            {this.getIndexOfCategory()} of {this.getArticlesWithinCategory().length} {this.state.content.category}
          </div>
          <div className="article-container">
            <article
              style={{
                transformOrigin: '50% 50% ' +
                  (_.contains(['left', 'right'], this.state.keyDirection)
                    ? `${this.bodyWidth() / 2.01}px`
                    : `${this.bodyHeight() / 2.01}px`)
              }}
              className={`${this.state.content.slug} spin-${this.state.keyDirection}`}
              dangerouslySetInnerHTML={{__html: this.state.content.html}}
            />
          </div>
          <Keys
            keyPress={this.state.keyPress}
            keyDirection={this.state.keyDirection}
            />
        </section>

        <RightSidebar
          className="sidebar right-sidebar"
          onMouseLeave={this.onSidebarLeave}
          />
        <nav
          className={cx({
            "active": this.state.displayRightSidebar,
            "enable-right-sidebar": true,
            "secret-nav": true
          })}
          onMouseOver={this.onNavHover}
        />

      </div>
    )
  }
});
