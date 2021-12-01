const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const babelify = require('babelify')
const browserSync = require('browser-sync').create()
const terser = require('gulp-terser')

// SETTINGS
const cfg = {
  scripts: {
    src: './assets/js/**/*.js',
    dist: './public/assets/js/',
    filename: 'bundle.js',
    entrypoint: './assets/js/main.js',
  },
  styles: {
    src: './assets/scss/**/*.scss',
    dist: './public/assets/css/',
  },
  img: {
    src: './assets/img/**/*',
    dist: './public/assets/img/',
  },
  html: {
    src: './public/index.html',
  },
}

// SCRIPTS
const BUILD_JS = () => {
  return browserify({ entries: cfg.scripts.entrypoint, debug: true })
    .transform("babelify")
    .bundle()
    .pipe(source(cfg.scripts.filename))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(cfg.scripts.dist))
    .pipe(browserSync.stream())
}

// STYLES
const BUILD_SASS = () => {
  return gulp.src(cfg.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', function(err) {
      console.error(err.message)
      browserSync.notify(err.message, 3000)
      this.emit('end')
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cfg.styles.dist))
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(cfg.styles.dist))
    .pipe(browserSync.stream())
}

// COPY IMAGES
const BUILD_IMG = () => {
  return gulp.src(cfg.img.src)
    .pipe(gulp.dest(cfg.img.dist))
    .pipe(browserSync.stream())
}

// BROWSER SYNC
const BROWSER_SYNC_SERVE = cb => {
  browserSync.init({
    server: {
      baseDir: "./public/",
    }
  })

  cb()
}

// BROWSER SYNC RELOAD
const BROWSER_SYNC_RELOAD = cb => {
  browserSync.reload()

  cb()
}

// WATCHER
const WATCH_TASK = () => {
  gulp.watch([cfg.html.src], BROWSER_SYNC_RELOAD)
  gulp.watch([cfg.scripts.src, cfg.styles.src, cfg.img.src],
    gulp.series(
      gulp.parallel(BUILD_JS, BUILD_SASS, BUILD_IMG, BROWSER_SYNC_RELOAD)
    ))
}

exports.default = gulp.series(
  gulp.parallel(BUILD_JS, BUILD_SASS, BUILD_IMG),
  BROWSER_SYNC_SERVE,
  WATCH_TASK
)