const path         = require('path');
const gulp         = require('gulp');
const nunjucks     = require('gulp-nunjucks');
const fn           = require('gulp-fn');
const jsonfile     = require('jsonfile');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const webpack      = require('webpack-stream');
const named        = require('vinyl-named');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');

gulp.task('pages', done =>
	gulp.src('src/models/**/*.json')
		.pipe(fn(file => {
			const data = JSON.parse(file.contents.toString());
			
			const sep = file.basename.split('.');
			const template = sep[sep.length - 2];

			if (template) {
				gulp.parallel(
					done => {
						gulp.src(`src/views/**/${template}.njk`)
							.pipe(nunjucks.compile(data))
							.pipe(rename({ extname: '.html' }))
							.pipe(gulp.dest('dist'))
						
						done();
					}
				)();
			}
		}))
);

gulp.task('styles', done =>
	gulp.src(['src/styles/**/*.scss', '!src/styles/deps/**.*.scss'])
		.pipe(sass({
			outputStyle: 'expanded'
		}).on('error', sass.logError))

		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
		
		.pipe(gulp.dest('dist/css'))
);

gulp.task('scripts', done =>
	gulp.src(['src/scripts/**/*.js', '!src/scripts/deps/**/*.js'])
		.pipe(named())
		.pipe(webpack({
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: { presets: ['@babel/preset-env'] }
						}
					}
				]
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'))
);

gulp.task('dev', gulp.parallel('pages', () => {
	gulp.watch(['src/models/**/*.json', 'src/views/**/*.njk'], gulp.parallel('pages'));
	gulp.watch(['src/styles/**/*.scss', 'src/styles/**/*.css'], gulp.parallel('styles'));
	gulp.watch('src/scripts/**/*.js', gulp.parallel('scripts'));
}));