"use strict";

var Dict;
if (!Dict) {
  Dict = function(init){
    var obj = Object.create(null);

    /*
    Object.defineProperty(obj, 'values', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function () {
        return Object.keys(this).map(function(key) { return this[key]; });
      }.bind(obj)
    });
    Object.defineProperty(obj, 'forEach', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (callback) {
        Object.keys(this).forEach(function(prop) {
          callback.call(null, prop, obj[prop]);
        });
      }.bind(obj)
    });
    */

    Object.keys(init || {}).forEach(function(prop) {
      obj[prop] = init[prop];
    });
    return obj;
  };
  Dict.forEach = function (obj, callback) {
    Object.keys(obj).forEach(function(prop) {
      callback.call(null, prop, obj[prop]);
    });
  };
  Dict.values = function () {
    return Object.keys(this).map(function(key) { return this[key]; });
  };
}
