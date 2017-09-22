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

  compiler.plugin('emit', function(compilation, done) {
    var header = require(__dirname + '/../../resource/' + self.translator + '.json')
    header.lastUpdated = self.lastModified.toISOString().replace('T', ' ').replace(/\..*/, '');
    var preferences = require(__dirname + '/../../defaults/preferences/defaults.json')
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

  getConfig: function(detect) {
    this.debugEnabled = Zotero.BetterBibTeX.debugEnabled();
    this.unicode = true;

    if (detect) {
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
    this.preferences.rawLaTag = '#LaTeX'
    if (this.preferences.csquotes) {
      var i, csquotes = { open: '', close: '' }
      for (i = 0; i < this.preferences.csquotes.length; i++) {
        csquotes[i % 2 == 0 ? 'open' : 'close'] += this.preferences.csquotes[i]
      }
      this.preferences.csquotes = csquotes
    }
  }
};

<% if (header.translatorType & 2) { /* export */ %>
  function doExport() {
    Translator.getConfig()
    Translator.initialize()
    Translator.doExport()
  }
<% } %>

<% if (header.translatorType & 1) { /* import */ %>
  function detectImport() {
    Translator.getConfig(true)
    return Translator.detectImport()
  }
  function doImport() {
    Translator.getConfig()
    Translator.initialize()
    Translator.doImport()
  }
<% } %>
`.trim();
