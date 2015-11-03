var React = require('react');

module.exports = React.createClass({
  render() {
    return (
      <div className="social-links">
        <ul>
          <li><a href="mailto:matthew.c.halbe@gmail.com"><i className="icon-mail"></i></a></li>
          <li><a href="https://github.com/eblahm"><i className="icon-git"></i></a></li>
          <li><a href="https://www.linkedin.com/pub/matthew-halbe/2b/a37/911"><i className="icon-linked_in"></i></a></li>
          <li><a href="https://twitter.com/_yonant"><i className="icon-twitter"></i></a></li>
        </ul>
      </div>)
  }
});
