'use strict';

const fs = require('fs');
const pug = require('pug');
const path = require('path');
const uriTemplate = require('uri-templates')
const pkg = Object.assign({}, require('../package.json'))

if (!pkg.id) pkg.id = (pkg.name.replace(/^zotero-/, '') + '@' + pkg.author.email.replace(/.*@/, '')).toLowerCase()
if (pkg.xpi) Object.assign(pkg, pkg.xpi)

pkg.version = require('./version')

if (pkg.updateLink) pkg.updateLink = uriTemplate(pkg.updateLink).fill({version: pkg.version})

module.exports = function() {
  var template;

  var options_and_vars = Object.assign(pkg, { pretty: true})

  console.log('generating install.rdf')
  template = fs.readFileSync(path.join(__dirname, 'install.rdf.pug'), 'utf8')
  template = pug.render(template, options_and_vars)
  fs.writeFileSync(path.join(__dirname, '../build/install.rdf'), template, { encoding: 'utf8' })

  console.log('generating update.rdf')
  template = fs.readFileSync(path.join(__dirname, 'update.rdf.pug'), 'utf8')
  template = pug.render(template, options_and_vars)
  fs.writeFileSync(path.join(__dirname, '../gen/update.rdf'), template, { encoding: 'utf8' })
}
