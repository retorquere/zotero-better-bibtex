const fs = require('fs')
const parseXML = require('@retorquere/parse-xml')
var path = require('path');

var walk = function(dir, ext) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(walk(file, ext))
        else if (file.endsWith(ext)) results.push(file)
    })
    return results
}

strings = {}
walk('locale', '.dtd').forEach(function(xul) {
  var dtd = fs.readFileSync(xul, 'utf8')
  dtd.replace(/<!ENTITY\s+([^\s]+)\s+"([^"]+)"\s*/g, function(decl, entity, string) {
    strings[entity] = string;
  })
})
// console.log(JSON.stringify(strings, null, 2))

used = {}
walk('content', '.xul').forEach(function(xul) {
  var root = '&better-bibtex.' + path.basename(xul,'.xul') + '.';
  console.log(xul)

  parseXML(fs.readFileSync(xul, 'utf8'), {
    resolveUndefinedEntities: function(entity) {
      if (entity.startsWith('&zotero.') && !entity.startsWith('&zotero.better-bibtex.')) return entity;

      if (!entity.startsWith(root)) console.log(`  ${entity} must start with ${root}`);
      else if (!strings[entity.slice(1, -1)]) console.log(`  ${entity} not found`)

      used[entity.slice(1, -1)] = true;

      return entity;
    }
  })
})

for (entity in strings) {
  if (used[entity]) continue;
  console.log(`Unused: ${entity}`)
}
