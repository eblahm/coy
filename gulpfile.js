
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

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('bundle', ['clean'], function () {
  return browserify([
      './src/client/admin.js',
      './src/client/home.js'
    ], {debug: true})
    .transform(babelify)
    .bundle()
    .pipe(source('*.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/client'));
});

gulp.task('less', ['bundle'], function() {
  var lessPath = 'src/client/less/**/*.less';

  return gulp.src(lessPath)
    .pipe(less({
      plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest('./dist/client/css'));
});

gulp.task('copy', ['less'], function() {
  return gulp.src([
      'src/**/*.html',
      'src/**/*.md',
      'src/**/*.json'
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

gulp.task('default', ['build']);

