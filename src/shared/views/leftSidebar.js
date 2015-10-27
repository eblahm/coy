var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Link = require('react-router').Link;

module.exports = React.createClass({
  getDefaultProps() {
    return {
      categories: {},
      isServer: typeof window === 'undefined',
      articles: []
    };
  },

  render: function() {
    var groups = _.groupBy(this.props.articles, 'category');

    return (
      <section {...this.props}>
        <div className="inner-sidebar">

          <nav>
          {_.map(this.props.categories, (description, category) => {
            return <div key={category}>
              <h2 className={`${_.kebabCase(category)}-content content-type-title`}>{_.capitalize(category)}</h2>
              <p>{description}</p>
              <ul>
                {_.map(groups[category], (data) => {
                  return (
                    <li key={data.slug} className={cx({active: this.props.activeSlug === data.slug})}>
                    {this.props.isServer ?
                      <a href={`/${data.slug}`}>{data.slug}</a> :
                      <Link to={`/${data.slug}`} state={{displayLeftSidebar: true}}>{data.slug}</Link>}
                    </li>
                  )
                })}
              </ul>
            </div>
          })}
          </nav>
        </div>
      </section>
    )
  }
});
