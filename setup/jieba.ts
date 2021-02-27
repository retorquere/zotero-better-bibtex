import * as fs from 'fs'

const dict = require('../jieba-js/scripts/data/dictionary.js')

fs.writeFileSync('build/resource/jieba/dict.json', JSON.stringify(dict))
fs.writeFileSync('gen/jieba.js', `
${fs.readFileSync('jieba-js/scripts/main.js', 'utf-8').replace(/\r/g, '')}

module.exports = {
  init: jieba_parsing,
  cut: node_jieba_parsing,
}
`)
