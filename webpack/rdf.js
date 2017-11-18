'use strict';

const fs = require('fs');
const pug = require('pug');
const path = require('path');
const uriTemplate = require('uri-templates')
const Package = Object.assign({}, require('../package.json'))
const PropertiesReader = require('properties-reader');
const glob = require("glob");

if (!Package.id) Package.id = (Package.name.replace(/^zotero-/, '') + '@' + Package.author.email.replace(/.*@/, '')).toLowerCase()
if (Package.xpi) Object.assign(Package, Package.xpi)

Package.version = require('./version')

if (Package.updateLink) Package.updateLink = uriTemplate(Package.updateLink).fill({version: Package.version});
Package.updateURL = Package.xpi.releaseURL + 'update.rdf';

const translations = glob.sync(path.join(__dirname, '../locale/*/*.properties'))
for (const translation of translations) {
  let locale = path.basename(path.dirname(translation))
  let properties = PropertiesReader(translation)
  let description = properties.get('xpi.description')

  if (!description) continue

  if (locale === 'en-US') {
    Package.description = description
  } else {
    Package.localizedDescriptions = Package.localizedDescriptions || {}
    Package.localizedDescriptions[locale] = description
  }
}

module.exports = function() {
  var template;

  var options_and_vars = Object.assign(Package, { pretty: true, })

  console.log('generating install.rdf')
  template = fs.readFileSync(path.join(__dirname, 'install.rdf.pug'), 'utf8')
  template = pug.render(template, options_and_vars)
  fs.writeFileSync(path.join(__dirname, '../build/install.rdf'), template, { encoding: 'utf8' })

  console.log('generating update.rdf')
  template = fs.readFileSync(path.join(__dirname, 'update.rdf.pug'), 'utf8')
  template = pug.render(template, options_and_vars)
  fs.writeFileSync(path.join(__dirname, '../gen/update.rdf'), template, { encoding: 'utf8' })
}
