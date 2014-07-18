'use strict';

var _ = require('lodash');


module.exports = function( output, target ) {
  if( _.isEmpty(output.results) ) {
    output.results += "name,date,error,count,cycles,hz\n";
  }

  output.results += [
        '"' + target.name + '"',
        '"' + target.timestamp + '"',
        target.error,
        target.count,
        target.cycles,
        target.hz
      ].join( ',' ) + "\n";
};