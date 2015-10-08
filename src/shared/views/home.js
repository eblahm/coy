
var React = require('react');
var RightSidebar = require('./rightSidebar.js');
var LeftSidebar = require('./leftSidebar.js');
var _ = require('lodash');
var $ = require('jquery');

var content;
var articles;
try {
  content = _.get(window, 'COY_PROPS.content');
  articles = _.get(window, 'COY_PROPS.articles');
} catch(err) {
  content = {};
  articles = [];
}
var cx = require('classnames');

module.exports = React.createClass({
  getInitialState() {
    return {
      page: 0,
      displayLeftSidebar: false,
      displayRightSidebar: false,
      content: content
    };
  },

  getDefaultProps() {
    return {
      articles: articles
    };
  },

  componentDidMount() {
  },

  navigateNext: function() {
    var articles = this.props.articles;
    var page = this.state.page;
    var index = page % articles.length;
    var slug = _.get(articles, `[${index}].slug`);
    if (!slug) { return; }
    $.getJSON(`/article/${slug}`).then((content) => {
      this.setState({
        content: content,
        page: page + 1
      });
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

  render() {
    return (
      <div
        className="flex-container"
        onClick={this.navigateNext}
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
          onMouseOut={this.onSidebarLeave}
        />


        <section
          className={cx({
            "show-right-sidebar": this.state.displayRightSidebar,
            "show-left-sidebar": this.state.displayLeftSidebar,
            "content-container": true
          })}
        >
          <div className="article-container">
            <article
              dangerouslySetInnerHTML={{__html: this.state.content.html}}
            />
          </div>
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
