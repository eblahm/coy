

var githubDb = require('js-github/mixins/github-db');
var createTree = require('js-git/mixins/create-tree');
var memcache = require('js-git/mixins/mem-cache');
var readCombiner = require('js-git/mixins/read-combiner');
var formats = require('js-git/mixins/formats');
var modes = require('js-git/lib/modes');
var _ = require('lodash');
var run = require('gen-run');

var githubService = {};
var commitGenerator = function* (repoObj, fname, content, message, ref = 'refs/heads/master') {

  console.log('loading git ref:%s', ref);
  var headHash = yield repoObj.readRef(ref);

  console.log('loading commit for hash:%s', headHash);
  var commit = yield repoObj.loadAs('commit', headHash);

  console.log('loading tree for commit:%j', commit);
  var tree = yield repoObj.loadAs('tree', commit.tree);

  // fallback indicates new file
  var mode = _.get(tree, '[fname].mode', modes.file);

  // Build the updates array
  var updates = [
    {
      path: fname,
      mode: mode,
      content: content
    }
  ];

  updates.base = commit.tree;

  // Create the new file and the updated tree.
  console.log('attempting to create the updated tree %j', updates);
  var treeHash = yield repoObj.createTree(updates);

  console.log('attempting to update the commit the updated tree:%s', treeHash);
  var commitHash = yield repoObj.saveAs('commit', {
    tree: treeHash,
    author: {
      name: 'Matthew Halbe',
      email: 'matthew@webs.com'
    },
    parent: headHash,
    message: message
  });

  console.log('attempting to update the ref:%s to commit:%s', ref, commitHash);
  yield repoObj.updateRef(ref, commitHash);
};

githubService.repo = (repName, githubToken) => {
  var service = {};
  var repoObj = {};
  githubDb(repoObj, repName, githubToken);
  createTree(repoObj);
  memcache(repoObj);
  readCombiner(repoObj);
  formats(repoObj);

  service.commit = (fname, content, message, callback) => {
    run(commitGenerator(repoObj, fname, content, message), callback);
  };

  return service;
};

module.exports = githubService;
