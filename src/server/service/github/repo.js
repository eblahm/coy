
var githubDb = require('js-github/mixins/github-db');
var createTree = require('js-git/mixins/create-tree');
var memcache = require('js-git/mixins/mem-cache');
var readCombiner = require('js-git/mixins/read-combiner');
var formats = require('js-git/mixins/formats');
var modes = require('js-git/lib/modes');
var _ = require('lodash');
var run = require('gen-run');
var bluebird = require('bluebird');

var commitGenerator = function* (repoObj, user, updates, message, ref = 'refs/heads/master') {

  console.log(`loading git ref:${ref}`);
  var headHash = yield repoObj.readRef(ref);

  console.log(`loading commit for hash:${headHash}`);
  var commit = yield repoObj.loadAs('commit', headHash);

  console.log('loading tree for commit:%j', commit);
  var tree = yield repoObj.loadAs('tree', commit.tree);


  // Build the updates array
  updates = _.map(updates, (update) => {
    var mode = _.get(tree, `[${update.fname}].mode`, modes.file);
    var jsGitUpdate = {};
    jsGitUpdate.path = update.fname;
    jsGitUpdate.mode = update.rm ? undefined : mode;
    jsGitUpdate.content = update.rm ? undefined : update.content;
    return jsGitUpdate;
  });

  updates.base = commit.tree;

  // Create the new file and the updated tree.
  console.log('attempting to create the updated tree %j', updates);
  var treeHash = yield repoObj.createTree(updates);

  console.log(`attempting to update the commit the updated tree:${treeHash}`);
  var commitHash = yield repoObj.saveAs('commit', {
    tree: treeHash,
    author: {
      name: user.name,
      email: user.email
    },
    parent: headHash,
    message: message
  });

  console.log(`attempting to update the ref:${ref} to commit:${commitHash}`);
  yield repoObj.updateRef(ref, commitHash);
};

var repos = {};

module.exports = (repoName, session) => {
  var service = {};
  var repoObj = {};

  if (!repos[repoName]) {
    githubDb(repoObj, repoName, session.githubToken);
    createTree(repoObj);
    memcache(repoObj);
    readCombiner(repoObj);
    formats(repoObj);
    repos[repoName] = repoObj;
  }

  service.commit = (...args) => {
    return new Promise((resolve, reject) => {
      run(commitGenerator(repos[repoName], session.user, ...args), (err) => {
        return err ? reject(err) : resolve();
      });
    });
  };

  return _.assign(service, bluebird.promisifyAll(repoObj));

};
