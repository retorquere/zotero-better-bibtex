Eric's Scheem Implementation
====

This is the simple Scheme parser and interpreter I created using [Nathan University](http://nathansuniversity.com/).

The parser was generated using [PEG.js](http://pegjs.majda.cz/).

Sample code
-----

```scheme
(begin
  (define x 10)
  (if (< x 20)
    (set! x (* x x))
    error)
  x) ; => 100
```

Supported Operations
----

* Simple Math Operations: `+ - * /`
* Creating variables through `define`
* Reseting variables using `set!`
* Raising errors though `error`
* `if` statements
    * Using `= < <= > >=`

Playing with it
-----

Open the `index.html` and have at it!
