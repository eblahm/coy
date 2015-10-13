var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Link = require('react-router').Link;

module.exports = React.createClass({
  getDefaultProps() {
    return {
      articles: []
    };
  },

  render: function() {
    return (
      <section {...this.props}>
        <div className="inner-sidebar">
          <nav>
            <h2 className="content-type-title">Fragments</h2>
            <p>...Just thoughts that come to mind, not fully formed enough to be blog
            posts.  Or maybe just a quote or picture or some other media...</p>
            <ul>
              {_.map(this.props.articles, (data) => {
                return (
                  <li className={cx({active: this.props.activeSlug === data.slug})}>
                    <Link to={`/${data.slug}`} state={{displayLeftSidebar: true}}>{data.slug}</Link>
                  </li>
                )
              })}
            </ul>

            <h2 className="content-type-title other-content">Other Content</h2>
            <ul>
                <li className={cx({active: false})}>
                  <a href="/resume">Resume</a>
                </li>
            </ul>

          </nav>
        </div>
      </section>
    )
  }
});
