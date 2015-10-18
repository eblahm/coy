var React = require('react');

module.exports = React.createClass({

  shouldComponentUpdate() {
    return false;
  },

  render() {
    return <div {...this.props} />
  }

});
