"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var del = require("del");
var run = require("run-sequence");
var server = require("browser-sync").create();

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,jpg,jpeg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function() {
  return gulp.src("source/img/**/*.{png,jpg,jpeg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream()); // в ходе лекции куда-то потерялось
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/!(icon-*.svg)",
      "source/js/**"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    done)
});
