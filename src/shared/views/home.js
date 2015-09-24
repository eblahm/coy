
var React = require('react');
var Sidebar = require('./sidebar');
var _ = require('lodash');
var content;
try {
  content = _.get(window, 'COY_PROPS.content');
} catch(err) {
  content = {};
}
var cx = require('classnames');

module.exports = React.createClass({
  getInitialState() {
    return {
      displaySidebar: false
    };
  },

  getDefaultProps() {
    return {
      content: content
    };
  },

  onRightNavHover: function() {
    this.setState({displaySidebar: true});
  },

  onSidebarLeave: function() {
    this.setState({displaySidebar: false});
  },

  render() {
    return (
      <div className="flex-container">

        <section
          className={cx({
            "show-sidebar": this.state.displaySidebar,
            "content-container": true
          })}
        >
          <nav
            onMouseOver={this.onRightNavHover}
          />

          <div className="article-container">
            <article
              dangerouslySetInnerHTML={{__html: this.props.content.html}}
            />
          </div>
        </section>

        <Sidebar
          className="sidebar"
          onMouseLeave={this.onSidebarLeave}
          />
      </div>
    )
  }
});
