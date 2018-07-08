#!/usr/bin/env node

var fs = require('fs');

const jsesc = require('jsesc');

var inTable = false;
var table = '';
for (const line of fs.readFileSync('../../translators/BibTeX.js', 'utf8').split('\n')) {
  if (line.startsWith('var mappingTable =')) {
    inTable = true;
    table = 'module.exports = {\n'
    continue;
  }

  if (!inTable) continue;


  if (line.startsWith('};')) {
    table += '};\n';
    break;
  }

//  if (line.match(/\/\/ SYMBOL FOR/)) {
//    console.log(line);
//  }

  table += line + '\n';
}

fs.writeFileSync('zotero_table.js', table);

var zotero = require('./zotero_table.js');
delete zotero["'"];

var bbt = require('../translators/bibtex/unicode_translator_mapping.js');

for (const type of ['math', 'text']) {
  for (const key in bbt.ascii[type]) {
    delete zotero[key];
  }
}
console.log('adding', Object.keys(zotero).length, 'mappings from Zotero');

for (var [key, value] of Object.entries(zotero)) {
  if (key === value) continue;

  var type = 'text';
  var m = value.match(/^\$(.+)\$$/);
  if (m) {
    type = 'math';
    value = m[1];
  }
  console.log('adding', type, key, jsesc(key), '=', JSON.stringify(value));
  bbt.ascii[type][key] = value;
}

for (const base of ['ascii', 'unicode']) {
  for (const type of ['math', 'text']) {
    for (const key in bbt[base][type]) {
      const _key = key.normalize('NFC');
      if (!bbt[base][type][_key]) bbt[base][type][_key] = bbt[base][type][key]
    }
  }
}

for (const base of ['ascii', 'unicode']) {
  for (const [key, value] of Object.entries(bbt[base].text)) {
    if (key === value) {
      console.log('removing inert', jsesc(key))
      delete bbt[base].text[key];
    }
  }
}

for (const type of ['math', 'text']) {
  for (const key in bbt.unicode[type]) {
    if (!bbt.ascii[type][key]) {
      console.log('copying', jsesc(key), 'from unicode to ASCII')
      bbt.ascii[type][key] = bbt.unicode[type][key];
    }
  }
}

var m;
for (const base of ['ascii', 'unicode']) {
  for (const type of ['math', 'text']) {
    for (const [key, value] of Object.entries(bbt[base][type])) {
      if (m = value.match(/^{(\\[a-z]+)}$/i)) {
        bbt[base][type][key] = `${m[1]}{}`;
        continue;
      }

      if (m = value.match(/^\\(['`"=~^])([a-zA-Z]){}$/)) { // \'o{} => \'o
        bbt[base][type][key] = `\\${m[1]}${m[2]}`;
        continue;
      }

      if (m = value.match(/^{\\(['`"=~^])([a-zA-Z])}$/)) { // {\'o} => \'o
        bbt[base][type][key] = `\\${m[1]}${m[2]}`;
        continue;
      }

      if (m = value.match(/^\\(['`"=~^]){([a-zA-Z])}$/)) { // \'{o} => \'o
        bbt[base][type][key] = `\\${m[1]}${m[2]}`;
        continue;
      }

      if (m = value.match(/^\\(['`"=~^]){\\([ij])}$/)) { // \'{\i} => \'i
        bbt[base][type][key] = `\\${m[1]}${m[2]}`;
        continue;
      }
    }
  }
}

fs.writeFileSync('../translators/bibtex/unicode_translator_mapping.js', `module.exports = ${jsesc(bbt, { compact: false, indent: '  ' })};\n`)
