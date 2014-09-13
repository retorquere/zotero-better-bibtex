
iterate (x over [1,2,3,4]) {
  var a = x + 10;
  print(x);
}

iterate (x over [1,2,3,4,5])
  print(x + 10);

iterate (x, i over allItems())
  print(i, x)

var d = Dict({a:1, b:2});

iterate (key:value from d) {
  print(key + ':' + value);
}

each (item from Translator.nextItem()) {
  print(key + ':' + item.value);
}

var typeMap = {
  BibTeX2Zotero: Dict(),
  Zotero2BibTeX: Dict()
};

