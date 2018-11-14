// npm i express body-parse socket.io jsonwebtoken mongodb mongoose extend gulp gulp-sass wordpress-hash-node jsonwebtoken nodemon --save-dev
var gulp = require('gulp'),
    scss = require('gulp-sass');

gulp.task('scss', function () {
    return gulp.src(['public/scss/**/*.scss'])
        .pipe(scss())
        .pipe(gulp.dest('public/css'))
});


gulp.task('watch', function () {
    gulp.watch(['public/scss/**/*.scss'], ['scss']);
});