var React = require('react');

module.exports = React.createClass({

  render: function() {
    return (
      <section {...this.props}>
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
            <li><a href="mailto:matthew.c.halbe@gmail.com"><i className="fa fa-envelope-o"></i></a></li>
            <li><a href="https://github.com/eblahm"><i className="fa fa-github"></i></a></li>
            <li><a href="https://www.linkedin.com/pub/matthew-halbe/2b/a37/911"><i className="fa fa-linkedin-square"></i></a></li>
            <li><a href="https://twitter.com/_yonant"><i className="fa fa-twitter-square"></i></a></li>
          </ul>
        </div>
        <nav>
          <ul>
            <li><a href="/articles">Articles</a></li>
            <li><a href="/thoughts">Thoughts</a></li>
            <li><a href="/resume">Thoughts</a></li>
          </ul>
        </nav>
      </section>
    )
  }
});
