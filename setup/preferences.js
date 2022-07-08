#!/usr/bin/env node

const pug = require('pug')
const fs = require('fs')
const path = require('path')

const src = process.argv[2]
const tgt = process.argv[3]

const options = {}
options.pretty = true
const xul = pug.renderFile(src, options)

const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
