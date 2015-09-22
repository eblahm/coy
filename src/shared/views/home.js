
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

  onIconClick: function() {
    this.setState({
      displaySidebar: !this.state.displaySidebar
    });
  },

  render() {
    return (
      <div className="flex-container">

        <Sidebar
          className={cx({
            hidden: !this.state.displaySidebar,
            sidebar: true
          })}
          />

        <section className="content-container">
          <nav>
            <div
              onClick={this.onIconClick}
              className="coy-icon"
              >Coy
            </div>
          </nav>

          <div className="article-container">
            <article
              dangerouslySetInnerHTML={{__html: this.props.content.html}}
            />
          </div>
        </section>
      </div>
    )
  }
});
