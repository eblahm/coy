

var githubDb = require('js-github/mixins/github-db');
var createTree = require('js-git/mixins/create-tree');
var memcache = require('js-git/mixins/mem-cache');
var readCombiner = require('js-git/mixins/read-combiner');
var formats = require('js-git/mixins/formats');
var modes = require('js-git/lib/modes');
var _ = require('lodash');
var run = require('gen-run');
var bluebird = require('bluebird');

var commitGenerator = function* (repoObj, updates, message, ref = 'refs/heads/master') {

  console.log(`loading git ref:${ref}`);
  var headHash = yield repoObj.readRef(ref);

  console.log(`loading commit for hash:${headHash}`);
  var commit = yield repoObj.loadAs('commit', headHash);

  console.log('loading tree for commit:%j', commit);
  var tree = yield repoObj.loadAs('tree', commit.tree);

  // fallback indicates new file

  // Build the updates array
  updates = _.map(updates, function(update) {
    var mode = _.get(tree, `[${update.fname}].mode`, modes.file);
    return {
      path: update.fname,
      mode: mode,
      content: update.content
    };
  });

  updates.base = commit.tree;

  // Create the new file and the updated tree.
  console.log('attempting to create the updated tree %j', updates);
  var treeHash = yield repoObj.createTree(updates);

  console.log(`attempting to update the commit the updated tree:${treeHash}`);
  var commitHash = yield repoObj.saveAs('commit', {
    tree: treeHash,
    author: {
      name: 'Matthew Halbe',
      email: 'matthew@webs.com'
    },
    parent: headHash,
    message: message
  });

  console.log(`attempting to update the ref:${ref} to commit:${commitHash}`);
  yield repoObj.updateRef(ref, commitHash);
};

var githubService = {};

githubService.repo = (repName, githubToken) => {
  var service = {};
  var repoObj = {};

  githubDb(repoObj, repName, githubToken);
  createTree(repoObj);
  memcache(repoObj);
  readCombiner(repoObj);
  formats(repoObj);

  service.commit = (...args) => {
    return new Promise((resolve, reject) => {
      run(commitGenerator(repoObj, ...args), (err) => {
        return err ? reject(err) : resolve();
      });
    });
  };

  return _.assign(service, bluebird.promisifyAll(repoObj));

};

module.exports = githubService;
