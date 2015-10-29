
var React = require('react');
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
  getInitialState() {
    return {
      displayLeftSidebar: false,
      displayRightSidebar: false,
      content: this.props.content,
      keyPress: false,
      keyDirection: 'right'
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
    window.addEventListener('keydown', (event) => {
      var keyCode = event.keyCode;
      switch (keyCode) {
        case LEFT_ARROW:
          return this.keyDown('left');
        case DOWN_ARROW:
          return this.keyDown('down');
        case RIGHT_ARROW:
          return this.keyDown('right');
        case UP_ARROW:
          return this.keyDown('up');
        default:
          return;
      }
    });
    window.addEventListener('keyup', (event) => {
      var keyCode = event.keyCode;
      switch (keyCode) {
        case LEFT_ARROW:
          return this.keyUp('left');
        case DOWN_ARROW:
          return this.keyUp('down');
        case RIGHT_ARROW:
          return this.keyUp('right');
        case UP_ARROW:
          return this.keyUp('up');
        default:
          return;
      }
    });
  },

  keyDown: function(direction) {
    this.setState({keyPress: true, keyDirection: direction});
  },

  keyUp: function(direction) {
    this.setState({keyPress: false, keyDirection: direction});
  },

  componentDidUpdate() {
    document.title = this.state.content.title;
    this.onPathChange();
  },

  onPathChange() {
    var slug = _.get(this.props, 'params.slug');
    if (slug && slug !== this.state.content.slug && !this.opening) {
      this.open(slug);
    }
  },

  navigateNext: function() {
    var articles = this.props.articles;
    var nextIndex = (this.getCurrentIndex() + 1) % articles.length;
    var slug = _.get(articles, `[${nextIndex}].slug`);

    if (slug && !this.opening) {
      this.open(slug);
    }
  },

  getCurrentIndex: function() {
    return _.reduce(this.props.articles, (memo, data, i) => {
      return this.state.content.slug === data.slug ? i : memo;
    }, 0);
  },

  open: function(slug) {
    this.opening = true;
    $.getJSON(`/article/${slug}`)
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

  getArticlesByCategory: function(category) {
    var groupedArticles = _.groupBy(this.props.articles, 'category');
    return _.get(groupedArticles, `.${category}`, []);
  },

  getIndexOfCategory: function() {
    return _.reduce(this.getArticlesByCategory(this.state.content.category), (memo, data, i) => {
      return this.state.content.slug === data.slug ? i : memo;
    }, 0) + 1;
  },

  getSizeOfCategory: function() {
    return this.getArticlesByCategory(this.state.content.category).length;
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
            {this.getIndexOfCategory()} of {this.getSizeOfCategory()} {this.state.content.category}
          </div>
          <div className="article-container">
            <article
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
