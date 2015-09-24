
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
var babelify = require('babelify');
var less = require('gulp-less');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var cleancss = new LessPluginCleanCSS({advanced: true});
var autoprefix = new LessPluginAutoPrefix({browsers: ['last 2 versions']});
var runSequence = require('run-sequence');
var _ = require('lodash');
var path = require('path');

var BABEL_TRANFORMS = [
  'es6.arrowFunctions',
  'es6.parameters',
  'es6.spread',
  'react',
  'strict'
].join(',');

var SERVER_SIDE_JS = [
  'src/**/*.js',
  'src/*.js',
  '!src/client/*.js',
  '!src/client/**/*.js'
];

var CLIENT_SIDE_JS = [
  'src/**/*.js',
  'src/*.js',
  '!src/server/*.js',
  '!src/server/**/*.js'
];

var CLIENT_SIDE_LESS = [
  'src/client/less/**/*.less'
];

var STATIC_FILES = _.map([
  'html', 'md', 'json', 'woff',
  'ttf', 'eot', 'svg'
], function(ext) {
  return 'src/**/*.' + ext;
});

var CLIENT_SIDE_APPS = [
  './src/client/adminStart.js',
  './src/client/homeStart.js'
];

gulp.task('clean', function(done) {
  del(['dist'], done);
});

gulp.task('bundle', function () {
  return _.map(CLIENT_SIDE_APPS, function(file) {
    return browserify(file, {debug: true})
      .transform(babelify.configure({whitelist: BABEL_TRANFORMS}))
      .bundle()
      .on('error', gutil.log)
      .pipe(source(path.parse(file).base))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      // .pipe(uglify())
      .on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/client'));
  });
});

gulp.task('less', function() {

  return gulp.src(CLIENT_SIDE_LESS)
    .pipe(less({
      plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest('./dist/client/css'))
    .on('error', gutil.log);
});

gulp.task('copy', function() {
  return gulp.src(STATIC_FILES)
    .pipe(gulp.dest('dist'));
});

gulp.task('buildServer', ['copy'], function() {
  return gulp.src(SERVER_SIDE_JS)
    .pipe(babel({whitelist: BABEL_TRANFORMS}))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

gulp.task('nodemon', ['buildServer', 'buildClient', 'watchClient'], function() {
  return nodemon({
    script: 'dist/server/bin/www.js',
    watch: SERVER_SIDE_JS.concat(STATIC_FILES),
    ext: 'html js json',
    env: {'NODE_ENV': 'development'},
    tasks: ['buildServer'],
    nodeArgs: [
      '--debug=5858',
    ],
  })
  .on('error', gutil.log);
});

gulp.task('watchClient', function() {
  gulp.watch(CLIENT_SIDE_JS, ['bundle']).on('error', gutil.log);
  gulp.watch(CLIENT_SIDE_LESS, ['less']).on('error', gutil.log);
});

gulp.task('start', function(callback) {
  return runSequence('clean', ['nodemon']);
});

gulp.task('start', ['nodemon']);
gulp.task('buildClient', ['less', 'bundle']);
gulp.task('default', ['buildServer', 'buildClient']);

