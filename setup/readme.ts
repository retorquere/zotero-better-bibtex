import * as fs from 'fs'

const readme = fs.readFileSync('README.md', 'utf8')
const warning = '<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->'

const index = `
---
title: Better BibTeX for Zotero
weight: 5
aliases:
  - /Home
---
${warning}
`.split('\n')

const sponsoring = `
---
title: Sponsoring BBT
---
${warning}
`.split('\n')

let appendto = index
for (let line of readme.split('\n')) {
  if (line.match(/gitter/i)) continue
  if (line.match(/^# .*sponsor/i)) appendto = sponsoring
  if (line.startsWith('# ')) continue

  appendto.push(line)
}

fs.writeFileSync('site/content/_index.md', index.join('\n'))
fs.writeFileSync('site/content/sponsoring.md', sponsoring.join('\n'))
