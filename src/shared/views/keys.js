var React = require('react');

module.exports = React.createClass({

  getDefaultProps() {
    return {
      keyPress: false,
      keyDirection: 'right'
    };
  },

  isActive: function(direction) {
    if (this.props.keyPress && direction === this.props.keyDirection) {
      return 'active';
    }
    return '';
  },

  render() {
    return <div className="arrow-keys">
      <div>
        <i className={"icon-arrow_big_up " + this.isActive('up')}></i>
      </div>
      <div>
        <i className={"icon-arrow_big_left " + this.isActive('left')}></i>
        <i className={"icon-arrow_big_down " + this.isActive('down')}></i>
        <i className={"icon-arrow_big_right " + this.isActive('right')}></i>
      </div>
    </div>
  }
});
