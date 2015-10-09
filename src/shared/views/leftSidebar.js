var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

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
            <h2>Fragments</h2>
            <ul>
              {_.map(this.props.articles, (data) => {
                return (
                  <li className={cx({active: this.props.activeSlug === data.slug})}>
                    <a href={`/${data.slug}`}>{data.slug}</a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </section>
    )
  }
});
