'use strict';

const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const version = require('../version');
const ejs = require('ejs');
const fs = require('fs');

var TranslatorHeaderPlugin = function (translator) {
  this.translator = translator;
  this.lastModified = new Date(0);
  this.seen = {}
}

TranslatorHeaderPlugin.prototype.apply = function(compiler) {
  var self = this;

  /*
  compiler.plugin('after-compile', function(compilation, done) {
    compilation.fileDependencies.forEach(function(dep) {
      if (!self.seen[dep]) {
        self.seen[dep] = true;
        var stats = fs.statSync(dep);
        if (stats.mtime > self.lastModified) {
          self.lastModified = stats.mtime;
        }
      }
    })
    done();
  });
  */

  compiler.plugin('emit', function(compilation, done) {
    var header = require(__dirname + '/../../resource/' + self.translator + '.json')

    // header.lastUpdated = self.lastModified.toISOString().replace('T', ' ').replace(/\..*/, '');
    header.lastUpdated = (new Date).toISOString().replace('T', ' ').replace(/\..*/, '');

    var preferences = require(__dirname + '/../../gen/preferences.json')
    var asset = self.translator + '.js';
    compilation.assets[asset] = new ConcatSource(ejs.render(Header, {preferences: preferences, header: header, version: version}), compilation.assets[asset])
    done();
  })
}

module.exports = TranslatorHeaderPlugin;

const Header = `
<%- JSON.stringify(header, null, 2) %>

var Translator = {
  initialize: function () {},
  version: <%- JSON.stringify(version) %>,
  <%- header.label.replace(/[^a-z]/ig, '') %>: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: <%- JSON.stringify(header) %>,
  preferences: <%- JSON.stringify(preferences) %>,
  options: <%- JSON.stringify(header.displayOptions || {}) %>,

  configure: function(stage) {
    this.debugEnabled = Zotero.BetterBibTeX.debugEnabled();
    this.unicode = true; // set by Better Bib(La)TeX later

    if (stage == 'detectImport') {
      this.options = {}
    } else {
      for (var key in this.options) {
        this.options[key] = Zotero.getOption(key)
      }
      // special handling
      this.options.exportPath = Zotero.getOption('exportPath')
      this.options.exportFilename = Zotero.getOption('exportFilename')
    }

    for (key in this.preferences) {
      this.preferences[key] = Zotero.getHiddenPref('better-bibtex.' + key)
    }
    // special handling
    this.preferences.skipWords = this.preferences.skipWords.toLowerCase().trim().split(/\\s*,\\s*/).filter(function(s) { return s })
    this.preferences.skipFields = this.preferences.skipFields.toLowerCase().trim().split(/\\s*,\\s*/).filter(function(s) { return s })
    if (!this.preferences.rawLaTag) this.preferences.rawLaTag = '#LaTeX'
    if (this.preferences.csquotes) {
      var i, csquotes = { open: '', close: '' }
      for (i = 0; i < this.preferences.csquotes.length; i++) {
        csquotes[i % 2 == 0 ? 'open' : 'close'] += this.preferences.csquotes[i]
      }
      this.preferences.csquotes = csquotes
    }

    this.collections = {}
    if (stage == 'doExport' && this.header.configOptions && this.header.configOptions.getCollections && Zotero.nextCollection) {
      let collection
      while (collection = Zotero.nextCollection()) {
        let children = collection.children || collection.descendents || []
        let key = (collection.primary ? collection.primary : collection).key

        this.collections[key] = {
          id: collection.id,
          key: key,
          parent: collection.fields.parentKey,
          name: collection.name,
          items: collection.childItems,
          collections: children.filter(function(coll) { return coll.type === 'collection'}).map(function(coll) { return coll.key}),
          // items: (item.itemID for item in children when item.type != 'collection')
          // descendents: undefined
          // children: undefined
          // childCollections: undefined
          // primary: undefined
          // fields: undefined
          // type: undefined
          // level: undefined
        }
      }
    }
  }
};

<% if (header.translatorType & 2) { /* export */ %>
  function doExport() {
    Translator.configure('doExport')
    Translator.initialize()
    Translator.doExport()
  }
<% } %>

<% if (header.translatorType & 1) { /* import */ %>
  function detectImport() {
    Translator.configure('detectImport')
    return Translator.detectImport()
  }
  function doImport() {
    Translator.configure('doImport')
    Translator.initialize()
    Translator.doImport()
  }
<% } %>
`.trim();
