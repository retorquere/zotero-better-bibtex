#!/usr/bin/env node

import fs from 'fs'

for (const lib of process.argv.slice(2)) {
  if (lib.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(lib, 'utf-8'))
    if (data.config?.id === '36a3b0b5-bad0-4a04-b79b-441c7cef77db') {
      for (const item of data.items) {
        delete item.citationKey
      }
      fs.writeFileSync(lib, JSON.stringify(data, null, 2))
    }
  }
}
