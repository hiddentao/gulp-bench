'use strict';

var _ = require('lodash');


module.exports = function( output, target ){
  var data;
  if( !_.isEmpty(output.results) ) {
    data = JSON.parse(output.results);
    data.push( target );
  }else{
    data = [target];
  }

  output.results = JSON.stringify( data, null, "  " );
};