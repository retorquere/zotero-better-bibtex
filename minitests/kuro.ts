import kuroshiro = require('kuroshiro')
import * as fs from 'fs-extra'

import kuromojiLoader = require('kuromoji/src/loader/NodeDictionaryLoader')

console.log(kuromojiLoader)
kuromojiLoader.prototype.loadArrayBuffer = function(url, callback) {
  var m = url.match(/\/([_a-z]+\.dat)\.gz$/)
  console.log('patched!', url, m)
  var data = fs.readFileSync(`build/resource/kuromoji/${m[1]}`)
  callback(data)
}

kuroshiro.init(
  {
    dicPath: 'resource://zotero-better-bibtex/kuromoji'
  },
 (err) => {
    if(err){
       console.error(err);
    } else {
       // kuroshiro is ready
        const result = kuroshiro.convert('感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！');    
        console.log(result);
    }
});

