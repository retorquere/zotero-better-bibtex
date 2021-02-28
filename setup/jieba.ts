/* eslint-disable no-console, @typescript-eslint/no-unsafe-return */
const fs = require('fs')
const Jieba = require('ooooevan-jieba')
const jieba = new Jieba()
console.log('jieba')
jieba.load()

console.log('  probabilities')
fs.writeFileSync('build/resource/jieba/probabilities.json', JSON.stringify({
  startProb: jieba.startProb,
  transProb: jieba.transProb,
  prevTrans: jieba.prevTrans,
  emitProb: jieba.emitProb,
}))

console.log('  dict')
fs.writeFileSync('build/resource/jieba/dict.json', JSON.stringify({
  dictlineArr: fs.readFileSync(jieba.dictPath).toString().split('\n').filter(s => s),
  userDictlineArr: fs.readFileSync(jieba.userDictPath).toString().split('\n').filter(s => s),
}))
