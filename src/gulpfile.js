var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber');

var Browsersync = require('browser-sync').create();
var reload      = Browsersync.reload;

gulp.task('styles', function() {
  return gulp.src('./static/less/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(minifycss())
    .pipe(gulp.dest('../public/styles'))
    .pipe(reload({stream: true}))
    .pipe(notify({ message: 'styles task complete' }));
});

gulp.task('scripts_vendor',function(){
    return gulp.src('./static/vendor/*.js')
      .pipe(plumber())
      .pipe(gulp.dest('../public/vendor/'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('../public/vendor/'))
      .pipe(reload({stream: true}))
      .pipe(notify({ message: 'scripts task complete' }));
});

gulp.task('scripts_main',function(){
    return gulp.src('./static/script/*.js')
      .pipe(plumber())
      .pipe(concat('main.js'))
      .pipe(gulp.dest('../public/scripts/'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('../public/scripts/'))
      .pipe(reload({stream: true}))
      .pipe(notify({ message: 'scripts task complete' }));
});


gulp.task('browser-sync',['styles','scripts_vendor','scripts_main'], function() {
    Browsersync.init({
        proxy: "localhost:5000",
        baseDir:"./"
    });
    gulp.watch('./static/less/*.less', ['styles']);
    gulp.watch('../views/**/*.ejs').on('change', reload);
    gulp.watch('./static/vendor/*.js',['scripts_vendor']).on('change', reload);
    gulp.watch('./static/script/*.js',['scripts_main']).on('change', reload);
    gulp.watch(['../public/**/*.jpg','../public/**/*.png']).on('change', reload);
});

gulp.task('default', ['browser-sync']);
