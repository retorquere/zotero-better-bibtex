import * as fs from 'fs'

const readme = fs.readFileSync('README.md', 'utf8')
const warning = '<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->'

const index = [warning]
const sponsoring = [warning]
let appendto = index

for (const line of readme.split('\n')) {
  if (line.match(/^# .*sponsor/i)) appendto = sponsoring

  appendto.push(line)
}

fs.writeFileSync('docs/index.md', index.join('\n'))
fs.writeFileSync('docs/sponsoring.md', sponsoring.join('\n'))
