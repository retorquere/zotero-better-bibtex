const fs = require('fs')
const parseXML = require('@rgrove/parse-xml')
const path = require('path');
const YAML = require('js-yaml')

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
walk('locale/en-US', '.dtd').forEach(function(xul) {
  var dtd = fs.readFileSync(xul, 'utf8')
  dtd.replace(/<!ENTITY\s+([^\s]+)\s+"([^"]+)"\s*/g, function(decl, entity, string) {
    strings[entity] = string;
  })
})

used = {}
walk('content', '.xul').forEach(function(xul) {
  var root = '&better-bibtex.' + path.basename(xul,'.xul') + '.';
  console.log(xul)

  parseXML(fs.readFileSync(xul, 'utf8'), {
    resolveUndefinedEntity: function(entity) {
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


