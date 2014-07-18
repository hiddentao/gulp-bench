'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var bench = require('./index');
var through = require('through2');
var path= require('path');

var sinon = require('sinon'),
	chai = require('chai'),
	should = chai.should(),
	expect = chai.expect();


var mocker = null,
	stdoutSpy;


beforeEach(function() {
	mocker = sinon.sandbox.create();
});

afterEach(function() {
	mocker.restore();
});


it('basic benchmark', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench();

	stream.on('data', function(output) {
		try {
			path.basename(output.path).should.eql('benchmark-results.json');

			var json = JSON.parse(output._contents.toString());
			json.length.should.eql(1);

			json = json[0];
			json.name.should.eql('basic');
			json.timestamp.should.be.defined;
			(typeof json.count).should.eql('number');
			(typeof json.cycles).should.eql('number');
			(typeof json.hz).should.eql('number');

			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/basic.js'}));
	stream.end();
});


it('csv results', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench({
		outputFormat: 'csv'
	});

	stream.on('data', function(output) {
		try {
			path.basename(output.path).should.eql('benchmark-results.json');

			var lines = output._contents.toString().split("\n");
			lines.length.should.eql(3);

			lines[0].should.eql('name,date,error,count,cycles,hz');

			var result = lines[1].split(',');
			result.length.should.eql(6)
			result[0].should.eql('"basic"');

			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/basic.js'}));
	stream.end();
});


it('change output filename', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench({
		output: 'blabla'
	});

	stream.on('data', function(output) {
		try {
			path.basename(output.path).should.eql('blabla');

			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/basic.js'}));
	stream.end();
});



it('with options', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench();

	stream.on('data', function(output) {
		try {
			var json = JSON.parse(output._contents.toString());
			var result = json[0];

			result.name.should.eql('Test with options');
			result.count.should.eql(1);
			result.cycles.should.eql(1);

			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/basic-options.js'}));
	stream.end();
});


it('compare', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench();

	stream.on('data', function(output) {
		try {
			var json = JSON.parse(output._contents.toString());

			json.length.should.eql(3);

			json[0].name.should.eql('Sync');
			json[1].name.should.eql('Async-50');
			json[2].name.should.eql('Async-100');
 
 			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/compare.js'}));
	stream.end();
});



it('tests-as-array', function (cb) {
	this.timeout(20000);
	var self = this;

	var stream = bench();

	stream.on('data', function(output) {
		try {
			var json = JSON.parse(output._contents.toString());

			json.length.should.eql(3);

			json[0].name.should.eql('Sync');
			json[1].name.should.eql('Async-50');
			json[2].name.should.eql('Async-100');
 
 			cb();
		} catch (err) {
			cb(err);
		}
	});

	stream.write(new gutil.File({path: './test-data/compare-array.js'}));
	stream.end();
});

