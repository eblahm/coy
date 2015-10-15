
var _ = require('lodash');
var bluebird = require('bluebird');
var request = bluebird.promisify(require('request'));
var config = require('config');

const API_URL = config.get('github.api_url');

module.exports = (authToken, opts) => {
  opts.url = API_URL + opts.url;
  console.log('calling ' + opts.url);
  opts = _.assign({
    headers: {
      'User-Agent': 'eblahm',
      'Authorization': `token ${authToken}`
    },
    json: true
  }, opts);
  return request(opts).get(1);
};
