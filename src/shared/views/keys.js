var React = require('react');

module.exports = React.createClass({

  getInitialState() {
    return {};
  },

  render() {
    return <div className="arrow-keys">
      <div>
        <i className="icon-arrow_big_up"></i>
      </div>
      <div>
        <i className="icon-arrow_big_left"></i>
        <i className="icon-arrow_big_down"></i>
        <i className="icon-arrow_big_right"></i>
      </div>
    </div>
  }
});
