// This macro specifies the variable declaration options
macro $varlet {
  rule { var }
  rule { let }
}

// if a param is provided, remember its name and how it was declared
macroclass $param {
  pattern {
    rule { $decl:$varlet $name:ident }
  }
  pattern {
    rule { $name:ident }
    with $decl = #{}
  }
}

/*** Object/array iterators ***
 * if you do not declare your params, they're assumed to exist in the calling context.
 * a 'var' declaration will hoist your var to the top of the calling context (function or global).
 * a 'let' declaration will be contained on the block scope
*/
macro for_each {

  rule { ($key:$param $[:] $val:$param of sorted $dict:expr) { $body ... } } => {
    var i = 0;

    for (;;) { // this will contain any let statements to the block scope
      let dict = $dict;
      let keys = Objects.keys(dict);
      keys.sort();
      let length = keys.length;
      let i = 0;
      $key$decl $key$name = null;
      $val$decl $val$name = null;
      // a while loop is faster than a for (;;)
      while (i < length) {
        $key$name = keys[i];
        if (dict.hasOwnProperty && !dict.hasOwnProperty($key$name)) { continue; }
        $val$name = dict[$key$name];
        $body...
        i++;
      }
      dict = undefined;
      keys = undefined;
      break;
    }
  }

  // ** iterate over an object **
  // for_each ([var|let]? key : [var|let]? value of object) { ... }
  rule { ($key:$param $[:] $val:$param of $dict:expr) { $body ... } } => {

    var dict = $dict;
    for (;;) { // work around Sweet.js issue #365
      $key$decl $key$name = null;
      for ($key$name in $dict) {
        if (dict.hasOwnProperty && !dict.hasOwnProperty($key$name)) { continue; }
        $val$decl $val$name = dict[$key$name];
        $body...
      }
      dict = undefined;
      break;
    }

  }

  // ** iterate over an array, with index **
  // for_each ([var|let]? val, [var|let]? index in array) { ... }
  rule { ($val:$param, $idx:$param in $items:expr) { $body... } }  => {
    for (;;) { // this will contain any let statements to the block scope
      let items = $items;
      let length = items.length;
      $val$decl $val$name = null;
      $idx$decl $idx$name = 0;
      // a while loop is faster than a for (;;)
      while ($idx$name < length) {
        $val$name = items[$idx$name];
        $body...
        $idx$name++;
      }
      items = undefined;
      break;
    }
  }

  // ** iterate over an array, without index **
  // for_each ([var|let]? val in array) { ... }
  rule { ($val:$param in $items:expr) { $body... } }  => {
    for_each ($val$decl $val$name, let i in $items) { $body... } 
  }

  // very specific to the Zotero generaror
  rule { ($item:$param from $generator:expr) { $body... } } => {
    for (;;) {
      $item$decl $item$name = $generator;
      while ($item$name) {
        $body...
        $item$name = $generator;
      }
      break;
    }
  }
}

// Dictionary 'type' that doesn't inherit all of Object's properties.
macro Dict {
  // Dict initialized from an object (or another Dict)
  rule { ($init:expr) } => {
    // Wrapped in a function so it can be called as a simple expression
    (function(init) {
      var dict = Object.create(null);
      var key;
      for (key in init) {
        if (init.hasOwnProperty && !init.hasOwnProperty(key)) { continue; }
        dict[key] = init[key];
      }
      return dict;
    })($init)
  }

  // Empty Dict
  rule {()} => { Object.create(null) }
}

// array comprehensions
macro collect {

  // collect( for (x of iterable) if (condition) x )
  rule { ( for ($x:ident of $iterable:expr) if ($condition:expr) $result:expr) } => {
    (function() {
      var $x;
      var result = [];
      var iterable = $iterable;
      var i = 0, l = iterable.length;
      while (i < l) {
        $x = iterable[i];
        if ($condition) {
          result.push($result);
        }
        i++;
      }
      return result;
    }).bind(this)()
  }

  // collect( for (x of iterable) x )
  rule { ( for ($x:ident of $iterable:expr) $result:expr) } => {
    (function() {
      var $x;
      var result = [];
      var iterable = $iterable;
      var i = 0, l = iterable.length;
      while (i < l) {
        $x = iterable[i];
        result.push($result);
        i++;
      }
      return result;
    }).bind(this)()
  }

  // collect( for (x of iterable) ) { ... }
  rule { ( for ($x:ident of $iterable:expr) ) { $body... } } => {

    (function() {
      var $x;
      var result = [];
      var iterable = $iterable;
      var i = 0, l = iterable.length;
      while (i < l) {
        $x = iterable[i];
        $body...
        if (typeof $x !== 'undefined') {
          result.push($x);
        }
        i++;
      }
      return result;
    }).bind(this)()

  }
}

// operator == 9 left { $l, $r } => #{ $l === $r }
// export ==
// operator != 9 left { $l, $r } => #{ $l !== $r }
// export !=

export for_each
export Dict
export collect
