
var React = require('react');
var Sidebar = require('./sidebar');

module.exports = React.createClass({

  getInitialState: () => {
    return {
      articleHtml: ''
    };
  },

  getDefaultProps: () => {
    return {
      path: '',
      content: {}
    };
  },

  render() {
    var articleHtml = this.props.articleHtml;
    return (
      <div className="react-container">

        <Sidebar />

        <section class="content-container">
          <nav>
            <div class="coy-icon">Coy</div>
          </nav>

          <article
            dangerouslySetInnerHTML={{__html: articleHtml}}
          />
        </section>
      </div>
    )
  }
});
