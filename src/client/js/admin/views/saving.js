var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({

  getDefaultProps() {
    return {
      renderSpeedInMillis: 100,
      dots: '...'
    };
  },

  getInitialState() {
    return {
      intervalId: 0,
      position: 0,
    };
  },

  componentDidMount() {
    var i = 0;
    var size = this.props.dots.length;
    var intervalId = window.setInterval(() => {
      var position = (i++ % size);
      this.setState({position: position});
    }, this.props.renderSpeedInMillis);

    this.setState({intervalId: intervalId});
  },

  componentWillUnmount() {
    if (this.state.intervalId) {
      window.clearInterval(this.state.intervalId);
    }
  },

  render() {
    return (
      <span className="saving-animation">
        Saving.
        {_.times(this.state.position, (i) => {
          return <span>.</span>
        })}
      </span>)
  }
});
