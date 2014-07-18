var Timer = require('clockmaker').Timer;

module.exports = {
  name: 'Timeout Showdown',
  tests: [
      {
        name: 'Sync',    
        maxTime: 2,
        fn: function() {
          return;
        }
      },
      {
        name: 'Async-50',    
        maxTime: 2,
        defer: true,
        fn: function(deferred) {
          Timer(deferred.resolve, 50, { this: deferred }).start();
        }
      },
      {
        name: 'Async-100',    
        maxTime: 2,
        defer: true,
        fn: function(deferred) {
          Timer(deferred.resolve, 100, { this: deferred }).start();
        }
      },
  ]
};
