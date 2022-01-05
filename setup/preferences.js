#!/usr/bin/env node

const pug = require('pug')
const fs = require('fs')

const options = {}
options.pretty = true
const xul = pug.renderFile('content/Preferences.pug', options)
fs.writeFileSync('content/Preferences.xul', xul.replace(/&amp;/g, '&').trim())
