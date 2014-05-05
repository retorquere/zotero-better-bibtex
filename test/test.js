#!/usr/bin/env node

var fs = require('fs');
var dict = require('../tmp/dict.js');

var args = process.argv.slice(2);
var test = args.pop()      || 'Better BibTeX.test.json';

test = JSON.parse(fs.readFileSync(__dirname + '/' + test, 'utf-8'));
test.translator = 'var __zotero__header__ = ' + fs.readFileSync(__dirname + '/../tmp/' + (test.translator || 'Better BibTeX.js'))
test.command = test.command   || 'export';
test.input = test.input       || 'Better BibTeX.input.json';
test.ouput = test.ouput       || 'Better BibTeX.output.bib';
test.preferences = test.preferences || {};
test.options = test.options         || {};

var Item = function () {
  this.m = function () {
    alert('this is m');
  };
};

function rename(item, from, to) {
  item[to] = item[from];
  delete item[from];
}
function dflt(item, field, d) {
  if (typeof item[field] == 'undefined') {
    item[field] = d;
  }
}


var Zotero = {
  output: '',
  items: [],

  debug: function(msg) {
    if (typeof msg != 'string') { msg = JSON.stringify(msg); }
    console.log(msg);
  },

  write: function(str) {
    Zotero.output += str;
  },

  getHiddenPref: function(key) {
    return test.preferences['extensions.zotero.translators.' + key];
  },

  getOption: function(key) {
    return test.options[key];
  },

  removeDiacritics: function(str) {
    return str.replace(/[^!-~]/ig, '.');
  },

  nextItem: function() {
    if (Zotero.items.length == 0) { return false; }
    var item = Zotero.items.shift();

    item.prototype = new Item();
    rename(item, 'type', 'itemType');
    rename(item, 'id', 'itemID');
    dflt(item, 'tags', []);
    dflt(item, 'key', '' + item.itemID);

    return item;
  },

  nextCollection: function() {
    return false;
  }
};
var ZU = Zotero;

function pref(key, value) {
  if (typeof test.preferences[key] == 'undefined') {
    test.preferences[key] = value;
  }
}

var defaults = __dirname + '/../defaults/preferences/defaults.js';
eval('' + fs.readFileSync(defaults));

eval(test.translator);

switch (test.command) {
  case 'export':
    test.input = __dirname + '/' + test.input;
    Zotero.debug('Loading items from ' + test.input);
    Zotero.items = JSON.parse(fs.readFileSync(test.input, 'utf-8'));
    doExport();
    Zotero.debug(Zotero.output);
    break;

  case 'import':
    doImport();
    break;
  case 'detect':
    doDetect();
    break;
  default:
    throw("Unexpected action '" + command + '"');
}
