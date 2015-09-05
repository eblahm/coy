var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');
var del = require('del');

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('build', ['clean'], function() {
  return gulp.src([
      'src/*.js',
      'src/**/*.js'
    ])
    .pipe(babel({
      whitelist: 'es6.arrowFunctions'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('start', function() {
  nodemon({
    script: 'dist/bin/www.js',
    ext: 'js html',
    env: {'NODE_ENV': 'development'},
    tasks: ['build'],
    nodeArgs: [
      '--debug=5858',
    ],
  });
});

gulp.task('watch', function() {
  return gulp.watch('src/**', ['build']);
});

gulp.task('default', ['build']);

