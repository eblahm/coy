
var config = require('config');
var client = require('redis').createClient(config.get('redis.port'), config.get('redis.url'), {})
var bluebird = require('bluebird');

module.exports = bluebird.promisifyAll(client);
