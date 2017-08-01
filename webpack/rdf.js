'use strict';

const fs = require('fs');
const pug = require('pug');
const path = require('path');
const version = require('./version')

module.exports = function() {
  var template;

  console.log('generating install.rdf')
  template = fs.readFileSync(path.join(__dirname, 'install.rdf.pug'), 'utf8')
  template = pug.render(template, { pretty: true, version: version })
  fs.writeFileSync(path.join(__dirname, '../build/install.rdf'), template, { encoding: 'utf8' })

  console.log('generating update.rdf')
  template = fs.readFileSync(path.join(__dirname, 'update.rdf.pug'), 'utf8')
  template = pug.render(template, { pretty: true, version: version })
  fs.writeFileSync(path.join(__dirname, '../gen/update.rdf'), template, { encoding: 'utf8' })
}
