var React = require('react');
var SocialLinks = require('./socialLinks');

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
          <SocialLinks />
        </div>
      </section>
    )
  }
});
