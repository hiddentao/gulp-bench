var Timer = require('clockmaker').Timer;

module.exports = {
  name: 'Timeout Showdown',
  tests: {
    'Sync': {
      maxTime: 2,
      fn: function() {
        return;
      }
    },
    'Async-50': {
      maxTime: 2,
      defer: true,
      fn: function(deferred) {
        Timer(deferred.resolve, 50, { this: deferred }).start();
      }
    },
    'Async-100': {
      maxTime: 2,
      defer: true,
      fn: function(deferred) {
        Timer(deferred.resolve, 100, { this: deferred }).start();
      }
    }
  }
};