
var router = require('express').Router();
var github = require('../service/github');

router.post('', (req, res, next) => {
  var repo = github.repo('eblahm/coy', req.session.githubToken);
  console.log('attempting to make commit %j', req.body);
  repo.commit('test.txt', req.body.content, 'test commit', (err, data) => {
    if (err) { return next(err); }
    res.json(data).end();
  });
});

module.exports = router;
