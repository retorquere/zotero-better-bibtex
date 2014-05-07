#!/usr/bin/env node

var fs = require('fs');
var dict = require('../tmp/dict.js');

var args = process.argv.slice(2);
var test = args.pop()      || 'Better BibTeX.test.json';

test = JSON.parse(fs.readFileSync(__dirname + '/' + test, 'utf-8'));
test.translator = 'var __zotero__header__ = ' + fs.readFileSync(__dirname + '/../tmp/' + test.translator)
// test.command = test.command   || 'export';
// test.input = test.input       || 'Better BibTeX.input.json';
// test.ouput = test.ouput       || 'Better BibTeX.output.bib';
test.preferences = test.preferences || {};
test.options = test.options         || {};


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
  input: '',
  items: [],


  Item: function (type) {
    console.log('Creating '+ type);
    this.creators = [];
    this.attachments = [];
    this.notes = [];
    this.complete = function() {
      console.log('Item: ' + JSON.stringify(this));
    }

    /*this.__defineGetter__("creators", function(){
      return this.author;
    });
    this.__defineGetter__("date", function(){
      try { return this.issued['date-parts'].join('-'); }
      catch (e) { return null; }
    });
    this.__defineGetter__("year", function(){
      try { return this.issued['date-parts'][0]; }
      catch (e) { return null; }
    });*/
  },

  debug: function(msg) {
    if (typeof msg != 'string') { msg = JSON.stringify(msg); }
    console.log(msg);
  },

  write: function(str) {
    Zotero.output += str;
  },

  read: function(n) {
    console.log('read ' + n + ' from ' + Zotero.input.length);
    if (Zotero.input == '') { return false; }
    var r = Zotero.input.substring(0, n);
    Zotero.input = Zotero.input.substring(n, Zotero.input.length);
    return r;
  },

  getHiddenPref: function(key) {
    return test.preferences[key];
  },

  getOption: function(key) {
    return test.options[key];
  },

  removeDiacritics: function(str) {
    return str.replace(/[^!-~]/ig, '.');
  },

  Utilities: {
    strToDate: function(str) {
      return str;
    },
    trim: function(str) {
      return str ? str.trim() : str;
    },
    trimInternal: function(str) {
      return str ? str.trim() : str;
    },
    cleanAuthor: function(name, field, bool) {
      return name;
    },
    text2html: function(value) {
      return value;
    },
    formatDate: function(date) {
      return JSON.stringify(date);
    }

  },

  nextItem: function() {
    if (Zotero.items.length == 0) { return false; }
    var item = Zotero.items.shift();

    item.prototype = new Zotero.Item();
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
  key = key.replace('extensions.zotero.translators.', '');
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
    //Zotero.debug('Loading items from ' + test.input);
    Zotero.items = JSON.parse(fs.readFileSync(test.input, 'utf-8'));
    doExport();
    //Zotero.debug(Zotero.output);
    break;

  case 'import':
    test.input = __dirname + '/' + test.input;
    Zotero.input = fs.readFileSync(test.input, 'utf-8');
    doImport();
    Zotero.debug(Zotero.output);
    break;

  case 'detect':
    doDetect();
    break;
  default:
    throw("Unexpected action '" + command + '"');
}
