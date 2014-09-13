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

  // ** iterate over an object **
  // for_each ([var|let]? key : [var|let]? value of object) { ... }
  rule { ($key:$param $[:] $val:$param of $dict:expr) { $body ... } } => {

    do { // this will contain any let statements to the block scope
      $key$decl $key$name = null;
      $val$decl $val$name = null;
      let dict = $dict;
      let keys = Object.keys(dict);
      let length = keys.length;
      let index = 0;
      // a while loop is faster than a for (;;)
      while (index < length) {
        $key$name = keys[index];
        if (dict.hasOwnProperty && !dict.hasOwnProperty($key$name)) { continue; }
        $val$name = dict[$key$name];
        $body...
        index++;
      }
      dict = undefined;
      keys = undefined;
    } while (false)
    
  }

  // ** iterate over an array, with index **
  // for_each ([var|let]? val, [var|let]? index in array) { ... }
  rule { ($val:$param, $idx:$param in $items:expr) { $body... } }  => {
    do { // this will contain any let statements to the block scope
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
    } while (false)
  }

  // ** iterate over an array, without index **
  // for_each ([var|let]? val in array) { ... }
  rule { ($val:$param in $items:expr) { $body... } }  => {
    for_each ($val$decl $val$name, let i in $items) { $body... } 
  }

  // very specific to the Zotero generaror
  rule { ($item:$param from $generator:expr) { $body... } } => {
    do {
      $item$decl $item$name = $generator;
      while ($item$name) {
        $body...
        $item$name = $generator;
      }
    } while (false)
  }
}

// Dictionary 'type' that doesn't inherit all of Object's properties.
macro Dict {
  // Dict initialized from an object (or another Dict)
  rule { ($init:expr) } => {
    // Wrapped in a function so it can be called as a simple expression
    (function(init) {
      var dict = Object.create(null);
      for_each (let key: let value of init) {
        dict[key] = value
      }
      return dict;
    })($init)
  }

  // Empty Dict
  rule {()} => { Object.create(null) }
}

// Helper macro for collect
macro $collect {
  rule { ($result:expr, $item:ident, $items:expr, $cond:expr) } => {
    (function() {
      var result = [];
      for_each (let $item in $items) {
        if ($cond) {
          result.push($result);
        }
      }
      return result;
    }).bind(this)()
  }
}

// array comprehensions
macro collect {
  // collect (expr for item of items)
  rule { ($($result:expr for $item:ident in $items:expr)) } => {
    $collect($result, $item, $items, true)
  }
  // collect (expr for item of items where condition-for-item)
  rule { ($($result:expr for $item:ident in $items:expr where $cond:expr)) } => {
    $collect($result, $item, $items, $cond)
  }

  rule { ($(for $item:ident in $items:expr)) { $body... } } => {
    (function() {
      var result = [];
      for_each (let $item in $items) {
        $body...
        if (typeof $item !== 'undefined') {
          result.push($item);
        }
      }
      return result;
    }).bind(this)()
  }
}

export for_each
export Dict
export collect
