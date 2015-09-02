var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('default', function() {
  console.log('hello');
});

gulp.task('start', function () {
  nodemon({
    script: 'bin/www.js',
    ext: 'js html',
    env: {'NODE_ENV': 'development'},
    nodeArgs: ['--debug=5858', '--harmony_rest_parameters'],
  });
});
