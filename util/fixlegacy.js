#!/usr/bin/env node
const legacy = require('./legacy')

console.log(legacy.parse(process.argv[2]))
