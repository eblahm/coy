
var React = require('react');
var Sidebar = require('./sidebar');
var _ = require('lodash');
var content;
try {
  content = _.get(window, 'COY_PROPS.content');
} catch(err) {
  content = {};
}

module.exports = React.createClass({

  getDefaultProps() {
    return {
      content: content
    };
  },

  render() {
    return (
      <div className="react-container">

        <Sidebar />

        <section className="content-container">
          <nav>
            <div className="coy-icon">Coy</div>
          </nav>

          <article
            dangerouslySetInnerHTML={{__html: this.props.content.html}}
          />
        </section>
      </div>
    )
  }
});
