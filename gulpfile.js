const path         = require('path');
const gulp         = require('gulp');
const nunjucks     = require('gulp-nunjucks');
const fn           = require('gulp-fn');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const webpack      = require('webpack-stream');
const named        = require('vinyl-named');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const bs           = require('browser-sync');
const data         = require('gulp-data');
const newer        = require('gulp-newer');
const jsonfile     = require('jsonfile');

gulp.task('tours', done => {
	const siteData = jsonfile.readFileSync('./src/data.json');
	const tours = siteData.tours;
	const keys  = Object.keys(tours);
	const pages = [];

	for (let key = 0; key < keys.length; key ++) {
		const tour = tours[keys[key]];

		if (tour.stops) {
			pages.push(done =>
				gulp.src('src/views/**/_tour.njk')
					.pipe(nunjucks.compile(
						Object.assign({ root: "../.." }, tour) // Maybe calculate root like above later?
					))
					.pipe(rename({
						basename: tour.id,
						extname: '.html'
					}))
					.pipe(gulp.dest('dist'))
			);
		}
	}

	if (pages.length > 0) gulp.series(...pages)();
	done();
});

gulp.task('pages', gulp.parallel('tours', done => {
	const siteData = jsonfile.readFileSync('./src/data.json');

	return gulp.src(["src/views/**/*.njk", "!src/views/**/_*.njk"])
		.pipe(data(function(file) {
			const rootPath = path.join(__dirname, 'src/');

			let fileSpread = file.path.split(path.sep);

			fileSpread.splice(0, fileSpread.indexOf('views') + 1);
			fileSpread.pop();

			filePath = path.join(rootPath, ...fileSpread);
			let root = path.relative(filePath, rootPath);

			if (root === '') root = '.';

			return Object.assign({ root: root }, siteData);
		}))
		.pipe(nunjucks.compile())
		.pipe(rename({ extname: '.html' }))
		.pipe(gulp.dest('dist'))
	}
));

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
		.pipe(bs.stream())
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

gulp.task('media', done =>
	gulp.src('src/media/**')
		.pipe(newer('dist/media'))
		.pipe(gulp.dest('dist/media'))
		.pipe(bs.stream())
);

gulp.task('data', gulp.parallel('tours', done =>
	gulp.src('src/data.json')
		.pipe(gulp.dest('dist/'))
));

gulp.task('dev', gulp.series('pages', 'styles', 'scripts', () => {
	gulp.watch(['src/models/**/*.json', 'src/views/**/*.njk'], gulp.parallel('pages'))
		.on('change', bs.reload);
	
	gulp.watch('src/scripts/**/*.js', gulp.parallel('scripts'))
		.on('change', bs.reload);
	
	gulp.watch('src/data.json', gulp.parallel('data', 'pages'))
		.on('change', bs.reload);

	gulp.watch('src/media/**', gulp.parallel('media'));
	gulp.watch(['src/styles/**/*.scss', 'src/styles/**/*.css'], gulp.parallel('styles'));
	
	bs.init({
		server: {
			baseDir: './dist'
		}
	});
}));