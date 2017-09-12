var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  nodemon = require('gulp-nodemon'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  uglifyJS = require('gulp-uglifyjs'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  autoprefixer = require('gulp-autoprefixer');

gulp.task('browser-sync', ['nodemon'], function () {
  browserSync({
    proxy: "localhost:3000",
    port: 5000,
    notify: true
  });
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'app.js',
    ignore: [
      'gulpfile.js',
      'node_modules/'
    ]
  })

    .on('start', function () {
      if (!called) {
        called = true;
        cb();
      }
    })

    .on('restart', function () {
      setTimeout(function () {
        reload({ stream: false });
      }, 1000);
    });
});

gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7']))
    .pipe(gulp.dest('app/css'))
});

gulp.task('scripts', function () {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/libs/ajax/dist/ajax.min.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglifyJS())
    .pipe(gulp.dest('app/js'))
});

gulp.task('css-libs', ['sass'], function () {
  return gulp.src('app/css/libs.css')
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/css'));
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
  var buildCss = gulp.src([
    'app/css/main.css',
    'app/css/libs.min.css'
  ])
    .pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'));

  var buildHtml = gulp.src('app/*.hbs')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(){
  return del.sync('dist');
});

gulp.task('cler', function(){
  return cache.clearAll();
});

gulp.task('img', function(){
  return gulp.src('app/img/**/*')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  })))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('default', ['browser-sync', 'css-libs', 'scripts'], function () {
  gulp.watch('app/sass/*.sass', ['sass']);
  gulp.watch(['app/*.hbs', 'app/sass/*.sass'], reload);
});