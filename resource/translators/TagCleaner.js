{
	"translatorID": "09444934-6997-4e40-b2a3-15deca4b6d8d",
	"label": "TagCleaner",
	"creator": "Emiliano heyns",
	"target": "tags",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 199,
  "configOptions": {
    "getCollections": "true"
  },
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsv",
	"lastUpdated": "/*= timestamp =*/"
}

var Config = {
  id: '/*= id =*/',
  label:  '/*= label =*/'
}

/*= dict =*/

function sentinel() {
  return (Config.id + "\t" + Config.label + "\n");
}

function doExport() {
  var keywords = Dict();
  while (item = Zotero.nextItem()) {
    item.tags.forEach(function(tag) {
      keywords.set(tag.tag, tag.tag);
    });
  }

  Zotero.write(sentinel());
  keywords.forEach(function(key, value) {
    Zotero.write(key + "\t" + value + "\n");
  });
}

function detectImport() {
  var input = Zotero.read(sentinel().length);
  return (input == sentinel());
}

function doImport() {
  var tags = '';
  while(read = Zotero.read(1024)) { tags += read; }
  tags = tags.split(/\r?\n/);
  if (tags.shift() == sentinel()) {
    tags.forEach(function(tag) {
      var repl = tag.split("\t");
      if (repl.length == 2) {
      }
    }
  }
}


var exports = {
	'doExport': doExport,
	'doImport': doImport
}
