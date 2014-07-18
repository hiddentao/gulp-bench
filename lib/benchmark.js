/*
 * Based on https://github.com/shama/grunt-benchmark/blob/master/tasks/lib/benchmark.js
 *
 * Copyright (c) 2014 Kyle Robinson Young
 * Licensed under the MIT license.
 */
'use strict';


var _ = require('lodash'),
  path = require('path'),
  gutil = require('gulp-util'),
  Benchmark = require('benchmark'),
  writers = require('./writers');


var _logInfo = function(msg) {
  gutil.log(msg);
};

var _logErr = function(msg) {
  gutil.log(gutil.colors.red('ERROR: ' + msg));
};

var _logSuccess = function(msg) {
  gutil.log(gutil.colors.green(msg));
};


module.exports = function() {
  var exports = {};

  // Turn function into an object
  exports.objectify = function objectify(obj) {
    return (typeof obj === 'function') ? {fn: obj} : obj;
  };

  exports.logStart = function logStart(name, src) {
    _logInfo('Running ' + (name ? name + ' ' : '') + '[' + src + ']...');
  };


  var output = {
    results: ''
  };

  exports.getResults = function() {
    return output.results;
  };

  exports._writeResults = function(target, options) {
    var format = options.outputFormat;
    var writer = writers[format]; 

    if (writer){
      var vo = {
        name : target.name,
        timestamp : (new Date()).toString(),
        error : target.error,
        count : target.count,
        cycles: target.cycles,
        hz : target.hz
      };
      if (target.suite) { 
        vo.suite = target.suite; 
      }
      writer.call(null, output, vo);
    } else {
      _logErr('Invalid output format requested');
    }
  };


  exports.runBench = function runBench(src, options, cb) {
    options = options || {};

    var singleBenchmark = false;
    var benchmarkOptions = {};
    var tests;
    var runnable;
    var benchmarkInfo = require(path.resolve(process.cwd(), src));

    if (typeof benchmarkInfo === 'function') {
      /*
        // A lone function named by its file
        module.exports = function() {}  // Test function
      */
      benchmarkOptions.file = src;
      benchmarkOptions.name = path.basename(src, '.js');
      benchmarkOptions.fn = benchmarkInfo;
      singleBenchmark = true;
    }
    else {
      // Copy it so we can modify it without breaking future tests
      benchmarkInfo = _.extend({}, benchmarkInfo);

      if (typeof benchmarkInfo.name === 'string' && typeof benchmarkInfo.fn === 'function') {
        if (benchmarkInfo.tests) {
          _logErr('Invalid benchmark: "'+benchmarkOptions.name+'" specify either export.fn or export.tests ');
          return cb();
        }
        /*
          // A single test
          module.exports = {
            name: String,  // Test name
            fn: Function, // Test function
            [setup: Function],  // Other Benchmark parameters
            [teardown: Function] // etc
        */
        benchmarkOptions = benchmarkInfo;
        singleBenchmark = true;
      }
      else if (benchmarkInfo.tests) {
        /*
          // A suite of tests
          module.exports = {
            name: String, // Suite name
            tests: Object, // Object keyed on test name
            [setup: Function],  // Other Benchmark parameters
            [teardown: Function] // etc
          }
        */

        // Set name
        benchmarkInfo.name = benchmarkInfo.name || path.basename(src, '.js');

        // Extract tests
        tests = benchmarkInfo.tests;
        delete benchmarkInfo.tests;

        // Add in options
        _.extend(benchmarkOptions, benchmarkInfo);

        if (Array.isArray(tests)) {
          // Ensure all tests are test objects with valid names
          tests = tests.map(function(obj, index) {
            obj = exports.objectify(obj);

            // Explicitly give a name or the output of Benchmark.js' filter('winner') command is an empty string
            if (!obj.name) {
              obj.name = '<Test #' + (index + 1) + '>';
            }

            return obj;
          });
        }
        else {
          // Convert tests to an array of test objects
          tests = _.map(tests, function(obj, key) {
            obj = exports.objectify(obj);

            // name can be specified as the key or as a property of the test object
            if (!obj.name) {
              obj.name = key;
            }

            return obj;
          });
        }
      }
      else {
        _logErr('Invalid configuration: ' + src + ' does not contain a valid test object or test suite', benchmarkInfo);
        return cb();
      }
    }

    if (singleBenchmark) {
      // Create a single benchmark
      runnable = new Benchmark(benchmarkOptions);

      exports.logStart('benchmark ' + benchmarkOptions.name, src);

      // Add test complete listener
      runnable.on('complete', function() {
        if (!this.error) {
          _logSuccess(this);
        }
        exports._writeResults(this, options);
      });
    }
    else {
      // Create a benchmarking suite
      runnable = new Benchmark.Suite(benchmarkOptions.name, benchmarkOptions);

      // TODO: tests as either object or array
      tests.forEach(function(test) { runnable.add(test); });

      exports.logStart('suite ' + benchmarkInfo.name, src);

      // Add test complete listeners
      runnable.on('cycle', function(event) {
        var target = event.target || this;

        if (!target.error) {
          _logSuccess('   ' + target);
        }
        target.suite = benchmarkInfo.name;
        exports._writeResults(target, options);
      });

      runnable.on('complete', function() {
        if (!this.error) {
          // Get the tests
          var tests = _.sortBy(this, 'hz');

          // Get the top fastest tests
          var fastestTests = Benchmark.filter(this, 'fastest');

          // Only bother if more than one test
          if (tests.length <= 1) {
            return;
          }

          // Get the testest test
          var fastest = fastestTests[0];

          // Extract their names
          var fastestNames = Benchmark.pluck(fastestTests, 'name');

          // Get the second fastest
          var secondFastestTests;
          var secondFastest;
          var secondFastestNames;
          if (fastestTests.length > 1) {
            secondFastestTests = Benchmark.filter(fastestTests.slice(1), 'fastest');
            secondFastest = secondFastestTests[0];
            secondFastestNames = Benchmark.pluck(secondFastestTests, 'name');
          }
          else {
            var slowerTests = _.reject(tests, function(obj) {
              return ~fastestNames.indexOf(obj.name);
            });
            secondFastestTests = Benchmark.filter(slowerTests, 'fastest').reverse();
            secondFastest = secondFastestTests[0];
            secondFastestNames = Benchmark.pluck(secondFastestTests, 'name');
          }

          // Calculate how much faster the fastest functions were than the second fastest
          var timesFaster = (fastest.hz/secondFastest.hz);

          var isAre = 'test is';
          if (fastestTests.length > 1) {
            isAre = 'tests are';
          }

          var message = "Fastest " + isAre + ' ' + [fastestNames].join(' and ' );

          var decimalPlaces = timesFaster < 2 ? 2 : 1;

          // Only bother if there wasn't a tie
          if (fastestTests.length !== tests.length) {
            message += ' at ' + Benchmark.formatNumber(timesFaster.toFixed(decimalPlaces))+'x faster than ' + secondFastestNames.join(' and ');
          }

          _logInfo(message);
        }
      });
    }

    // Add listeners
    runnable.on('error', function(event) {
      var target = event.target;
      _logErr('Error running test ' + target.name + ': ' + target.error);
    });

    runnable.on('complete', function() {
      // Catch errors
      if (this.error) {
        _logErr(this.error);
      }

      // all done
      cb();
    });

    // Run the test(s)
    runnable.run();
  };

  return exports;
};
