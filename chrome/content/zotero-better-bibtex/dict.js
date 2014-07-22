"use strict";

var Dict;
if (!Dict) {
  Dict = function(init){
    var obj = Object.create(null);

    function forEach(callback) {
      Object.keys(this).forEach(function(prop) {
        callback.call(null, prop, obj[prop]);
      });
    }
    Object.defineProperty(obj, 'forEach', { enumerable: false, configurable: false, writable: false, value: forEach.bind(obj) });

    Object.keys(init || {}).forEach(function(prop) {
      obj[prop] = init[prop];
    });
    return obj;
  };
}
