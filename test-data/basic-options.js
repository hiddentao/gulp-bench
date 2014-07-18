module.exports = {
  name: 'Test with options',
  maxTime: 2, /* max. test running time of 2 seconds */
  defer: true, /* pass a 'deferred' object to the test function */
  onComplete: function() {
    console.log('Hooray!');
  },
  fn: function(deferred) {
    setTimeout(function() {
      deferred.resolve(); 
    }, 500);
  }
};
