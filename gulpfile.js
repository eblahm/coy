var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');
var del = require('del');

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('bundle', ['clean'], function () {
  return browserify({
      entries: './src/client/start.js',
      debug: true
    })
    .bundle()
    .pipe(source('start.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/client'));
});

gulp.task('copy', ['bundle'], function() {
  return gulp.src([
      'src/**/*.html',
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['copy'], function() {
  return gulp.src([
      'src/server/*.js',
      'src/server/**/*.js'
    ])
    .pipe(babel({
      whitelist: [
        'es6.arrowFunctions',
        'es6.parameters',
        'strict,es6.spread'
      ].join(',')
    }))
    .pipe(gulp.dest('dist/server'));
});

gulp.task('start', ['build'], function() {
  nodemon({
    script: 'dist/server/bin/www.js',
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

