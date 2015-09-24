var React = require('react');

module.exports = React.createClass({

  render: function() {
    return (
      <section {...this.props}>
        <div className="inner-sidebar">
          <h1>About Me</h1>
          <p>
            Hi! My name is Matthew Halbe.  I'm a web developer working at Webs Inc.
            I have two kids, August and Liesel, and a wonderful wife, Dory.
          </p>
          <p>
            I spent 6 years as an enlisted soldier in the Army before coming out to the DC
            area for school and work.
          </p>
          <p>
            My main interests are web development, US-Iran Relations and documentary films.
          </p>
          <div className="social-links">
            <ul>
              <li><a href="mailto:matthew.c.halbe@gmail.com"><i className="icon-mail"></i></a></li>
              <li><a href="https://github.com/eblahm"><i className="icon-git"></i></a></li>
              <li><a href="https://www.linkedin.com/pub/matthew-halbe/2b/a37/911"><i className="icon-linked_in"></i></a></li>
              <li><a href="https://twitter.com/_yonant"><i className="icon-twitter"></i></a></li>
            </ul>
          </div>
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
