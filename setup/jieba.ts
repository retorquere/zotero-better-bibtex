/* eslint-disable no-console, @typescript-eslint/no-unsafe-return */
const execSync = require('child_process').execSync

console.log('jieba')
execSync('mkdir -p build/resource/ooooevan-jieba/dict')
execSync('cp node_modules/ooooevan-jieba/dict/* build/resource/ooooevan-jieba/dict')

export {}
