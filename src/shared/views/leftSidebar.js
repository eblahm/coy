var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Link = require('react-router').Link;

module.exports = React.createClass({
  getDefaultProps() {
    return {
      categoryOrder: [],
      isServer: typeof window === 'undefined',
      articles: [],
      categoryExplainers: {
        'fragments': '...Just thoughts that come to mind, not fully formed enough to be blog posts.  Or maybe just a quote or picture or some other media...'
      }
    };
  },

  render: function() {
    var groups = _.groupBy(this.props.articles, 'category');
    var categoryOrder = this.props.categoryOrder;
    if (!this.props.categoryOrder.length) {
      categoryOrder = _.keys(groups);
    }
    return (
      <section {...this.props}>
        <div className="inner-sidebar">

          <nav>
          {_.map(categoryOrder, (category) => {
            return <div key={category}>
              <h2 className={`${_.kebabCase(category)}-content content-type-title`}>{_.capitalize(category)}</h2>
              <p>{this.props.categoryExplainers[category]}</p>
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
