const gulp = require("gulp");
const concat = require('gulp-concat');
// const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const del = require('del');
const zip = require('gulp-zip');
const jsmin = require('gulp-babel-minify');

const fs = require("fs");

gulp.task('build-assets', ['clean'], () => {
    return gulp.src("src/assets/*")
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-main-js', ['build-css'], () => {
    return gulp.src("src/js/main.js")
        .pipe(jsmin())
        .pipe(concat("main.min.js"))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build-components-js', ['build-main-js'], () => {
    return gulp.src("src/js/components.js")
        .pipe(jsmin())
        .pipe(concat("components.min.js"))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build-css', ['build-assets'], () => {
    return gulp.src("src/css/*.css")
        .pipe(cssmin())
        .pipe(rename({
            basename: "compressed",
            extname: ".css"
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build-html', ['build-components-js'], () => {
    console.log("hi");
    return gulp.src("src/index.html")
        .pipe(replace("{{main}}", "<script>" + fs.readFileSync("dist/main.min.js") + "</script>"))
        .pipe(replace("{{components}}", "<script>" + fs.readFileSync("dist/components.min.js") + "</script>"))
        .pipe(replace("{{css}}", "<style>" + fs.readFileSync("dist/compressed.css") + "</style>"))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('clean:prebuild', ['build-html'],() => {
    return del(['dist/*.css', 'dist/*.js']);
});

gulp.task('clean', () => {
    return del(['dist', 'zip']);
});

gulp.task('build-zip', ['clean:prebuild'], () => {
    return gulp.src("dist/*")
        .pipe(zip('build.zip'))
        .pipe(gulp.dest("zip/"));
});

gulp.task('build', ['build-zip'], () => {
    let stats = fs.statSync("zip/build.zip");
    console.log(stats.size + "/13312 bytes");
});

gulp.task('watch', () => {
    gulp.watch(["src/*", "src/js/*", "src/css/*"], ["build"]);
});