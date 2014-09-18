/*jshint globalstrict: true*/
'use strict';

function allItems() {
  return [];
}
function print () {
}

for_each (let x, var i in allItems()) {
  print(i, x)
}
for_each (var x, i in allItems()) {
  print(i, x)
}

for_each (x in [1,2,3,4]) {
  var a = x + 10;
  print(x);
}

var d = Dict({a:1, b:2});

for_each (let key: var value of d) {
  print(key + ':' + value);
}

var Translator = {};

for_each ( let item from Translator.nextItem() ) {
  print(item.value);
}

var typeMap = {
  BibTeX2Zotero: Dict(),
  Zotero2BibTeX: Dict()
};

var items = [];
var x = collect( for (item of items) item.id )
x = collect( for (item of items) if (item.id > 0) item.id )
x = collect( for (item of items) ) {
  if (item.x) {
    item = undefined;
  }
}

var ref = collect(for (y of collect(for (f of [0,1,2,3]) f*f)) if(y) y)
