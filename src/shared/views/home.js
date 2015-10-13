
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
    this.onPathChange();
  },

  componentDidUpdate() {
    this.onPathChange();
  },

  onPathChange() {
    var slug = _.get(this.props, 'params.slug');
    if (slug !== this.state.content.slug) {
      this.open(slug);
    }
  },

  navigateNext: function() {
    var articles = this.props.articles;
    var nextIndex = (this.getCurrentIndex() + 1) % articles.length;
    var slug = _.get(articles, `[${nextIndex}].slug`);

    if (slug) {
      this.open(slug);
    }
  },

  getCurrentIndex: function() {
    return _.reduce(this.props.articles, (memo, data, i) => {
      return this.state.content.slug === data.slug ? i : memo;
    }, 0);
  },

  open: function(slug) {
    $.getJSON(`/article/${slug}`)
      .then((data) => this.setState({content: data}));
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
