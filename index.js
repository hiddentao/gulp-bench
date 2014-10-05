'use strict';

var _ = require('lodash'),
  path = require('path'),
	benchmark = require('./lib/benchmark'),
	gutil = require('gulp-util'),
	through2 = require('through2');


var File = gutil.File;


module.exports = function (options) {
	var b = benchmark();

	options = _.extend({
		output: 'benchmark-results.json',
		outputFormat: 'json'
	}, options);

	return through2.obj(function (file, enc, cb) {
		b.runBench(file.path, options, cb);
	}, function (cb) {
		var f = new File({
    	cwd: process.cwd(),
    	path: options.output,
    	contents: new Buffer(b.getResults())
   	});

		this.push(f);

		cb();
	});
};
