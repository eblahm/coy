
module.exports = (req, res, next) => {

  res.render('admin.html', {
    isAdmin: !!req.session.githubToken
  });

};
