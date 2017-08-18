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

gulp.task('build-js', ['build-css'], () => {
    return gulp.src("src/js/*.js")
        .pipe(jsmin())
        .pipe(concat("compressed.js"))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build-css', ['clean'], () => {
    return gulp.src("src/css/*.css")
        .pipe(cssmin())
        .pipe(rename({
            basename: "compressed",
            extname: ".css"
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build-html', ['build-js'], () => {
    console.log("hi");
    return gulp.src("src/index.html")
        .pipe(replace("{{js}}", "<script>" + fs.readFileSync("dist/compressed.js") + "</script>"))
        .pipe(replace("{{css}}", "<style>" + fs.readFileSync("dist/compressed.css") + "</style>"))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('clean:prebuild', ['build-html'],() => {
    return del(['dist/compressed.css', 'dist/compressed.js']);
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