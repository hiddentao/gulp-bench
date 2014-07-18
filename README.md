# [gulp](http://gulpjs.com)-bench [![Build Status](https://travis-ci.org/hiddentao/gulp-bench.svg?branch=master)](https://travis-ci.org/hiddentao/gulp-bench)

Run performance [Benchmark](http://benchmarkjs.com/) tests. Ported from [grunt-benchmark](https://github.com/shama/grunt-benchmark).

## Install

```bash
$ npm install --save-dev gulp-bench
```


## Usage

The usage syntax below is the same as for [grunt-benchmark](https://github.com/shama/grunt-benchmark).

### Basic 

Setup your benchmark test, e.g. in `test.js`:

```js
var fibonacci = function(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

module.exports = function() {
  fibonacci(10);
};
```

In your gulpfile:

```js
var gulp = require('gulp');
var benchmark = require('gulp-bench');

gulp.task('default', function () {
	return gulp.src('test.js', {read: false})
		.pipe(benchmark());
});
```

Run it:

```bash
$ gulp
[16:11:01] Running benchmark basic [./test-data/basic.js]...
[16:11:11]    basic x 1,107,255 ops/sec ±0.74% (96 runs sampled)
```

As well as outputting to console output the plugin stream returns a single file containing the test results in JSON form:

```js
gulp.task('default', function () {
    return gulp.src('test.js', {read: false})
        .pipe(benchmark())
        .pipe(gulp.dest('.'));  /* writes a results file to current folder */   
});
```

You can modify the results filename and format by supplying [plugin options](#plugin-options).

### Test options

Tests can be configured through futher options:

```js
module.exports = {
  name: 'Timeout (asynchronous)',
  maxTime: 2, /* test should run for max. this no. of seconds */
  defer: true, /* indicates that test is asynchronous */
  onComplete: function() {
    console.log('Hooray!');
  },
  fn: function(deferred) {
    setTimeout(function() {
      deferred.resolve(); 
    }, 500);
  }
};
```

### Test suites

You can compare implementations by constructing a test suite:

```js
var Timer = require('clockmaker').Timer;

module.exports = {
  name: 'Timeout Showdown',
  maxTime: 2,
  tests: {
    'Return immediately (synchronous)': function() {
      return;
    },
    'Timeout: 50ms (asynchronous)': {
      defer: true,
      fn: function(deferred) {
        Timer(deferred.resolve, 50, { this: deferred }).start();
      }
    },
    'Timeout: 100ms (asynchronous)': {
      defer: true,
      fn: function(deferred) {
        Timer(deferred.resolve, 100, { this: deferred }).start();
      }
    }
  }
};
```

The expected console output for the above test suite will look similar to:

```bash
[16:11:01] Running suite Timeout Showdown [./test-data/compare.js]...
[16:11:11]    Sync x 69,826,905 ops/sec ±4.27% (37 runs sampled)
[16:11:26]    Async-50 x 19.64 ops/sec ±0.25% (40 runs sampled)
[16:11:38]    Async-100 x 9.91 ops/sec ±0.17% (23 runs sampled)
[16:11:40] Fastest test is Sync at 3,555,514.2x faster than Async-50
```

The tests within a suite can also be specified as an array:

```js
var Timer = require('clockmaker').Timer;

module.exports = {
  name: 'Timeout Showdown',
  maxTime: 2,
  tests: [
    {
        name: 'Return immediately (synchronous)',
        fn: function() {
            return;
        }
    },
    {
        name: 'Timeout 50ms (asynchronous)',
        defer: true,
        fn: function(deferred) {
            Timer(deferred.resolve, 50, { this: deferred }).start();
        }
    },
    {
        name: 'Timeout 100ms (asynchronous)',
        defer: true,
        fn: function(deferred) {
            Timer(deferred.resolve, 100, { this: deferred }).start();
        }
    },
  ]
};
```

## Plugin Options

### output

Type: `String`
Default: `benchmark-results.json`

Specifies the name of the file in which to write test results.

### outputFormat

Type: `String`
Default: `json`
Values: `csv`, `json`

Specifies the format for the `output` file.

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/gulp-bench/blob/master/LICENSE.md)
