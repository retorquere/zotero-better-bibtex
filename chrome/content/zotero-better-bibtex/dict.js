var Dict = (function() {
  var module = {};
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var MANGLE_STRING = "~";

  function mangle(key) {
    if ((typeof key !== 'string') && (typeof key !== 'number')) {
      throw new TypeError('key must be a string or number; ' + JSON.stringify(key) + ' is a ' + (typeof key));
    }
    return MANGLE_STRING + key;
  }

  function unmangle(key) {
    return key.substring(MANGLE_STRING.length);
  }

  function methods(obj, methodHash) {
    for (var methodName in methodHash) {
      Object.defineProperty(obj, methodName, { value: methodHash[methodName] });
    }
  }

  return function (initializer) {
    var store = Object.create(null);
    var size = 0;

    var dict = {};

    methods(dict, {
      get: function (key, defaultValue) {
        var mangled = mangle(key);
        return mangled in store ? store[mangled] : defaultValue;
      },

      set: function (key, value) {
        var mangled = mangle(key);
        if (!(mangled in store)) { ++size; }

        return store[mangled] = value;
      },

      has: function (key) {
        return mangle(key) in store;
      },

      delete: function (key) {
        var mangled = mangle(key);
        if (mangled in store) {
          --size;
          delete store[mangled];
          return true;
        }

        return false;
      },

      keys: function() {
        var keys = [];
        this.forEach(function(k, v) { keys.push(k); });
        return keys;
      },
      values: function() {
        var values = [];
        this.forEach(function(k, v) { values.push(v); });
        return values;
      },

      clear: function () {
        store = Object.create(null);
        size = 0;
      },

      forEach: function (callback, thisArg) {
        if (typeof callback !== "function") { throw new TypeError("`callback` must be a function"); }

        var keys = [];
        for (var mangledKey in store) {
          if (hasOwnProperty.call(store, mangledKey)) {
            keys.push(mangledKey);
          }
        }
        keys.sort();
        keys.forEach(function(mangledKey) {
          var key = unmangle(mangledKey);
          var value = store[mangledKey];

          callback.call(thisArg, key, value, dict);
        });
      },

      size: function () {
        return size;
      },

      toJSON: function () {
        var unmangled = {};
        for (var mangledKey in store) {
          if (hasOwnProperty.call(store, mangledKey)) {
            var key = unmangle(mangledKey);
            var value = store[mangledKey];
            unmangled[key] = value;
          }
        }
        return unmangled;
      }
    });

    if (typeof initializer === "object" && initializer !== null) {
      Object.keys(initializer).forEach(function (key) {
        dict.set(key, initializer[key]);
      });
    }

    return dict;
  };
})();
