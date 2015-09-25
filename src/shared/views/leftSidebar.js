var React = require('react');

module.exports = React.createClass({

  render: function() {
    return (
      <section {...this.props}>
        <div className="inner-sidebar">
          <nav>
            <ul>
              <li><a href="/articles">Articles</a></li>
              <li><a href="/thoughts">Thoughts</a></li>
              <li><a href="/resume">Thoughts</a></li>
            </ul>
          </nav>
        </div>
      </section>
    )
  }
});
