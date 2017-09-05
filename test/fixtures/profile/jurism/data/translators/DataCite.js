{
	"translatorID": "9f1fb86b-92c8-4db7-b8ee-0b481d456428",
	"label": "DataCite",
	"creator": "Aurimas Vinckevicius",
	"target": "",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 8,
	"browserSupport": "gcs",
	"lastUpdated": "2014-05-29 07:46:16"
}

function detectSearch(items) {
	if(!items) return false;
	
	if(typeof items == 'string' || !items.length) items = [items];
	
	for(var i=0, n=items.length; i<n; i++) {
		if(!items[i]) continue;
		
		if(items[i].DOI && ZU.cleanDOI(items[i].DOI)) return true;
		if(typeof items[i] == 'string' && ZU.cleanDOI(items[i])) return true;
	}
	
	return false;
}

function filterQuery(items) {
	if(!items) return [];
	
	if(typeof items == 'string' || !items.length) items = [items];
	
	//filter out invalid queries
	var dois = [], doi;
	for(var i=0, n=items.length; i<n; i++) {
		if(items[i].DOI && (doi = ZU.cleanDOI(items[i].DOI)) ) {
			dois.push(doi);
		} else if(typeof items[i] == 'string' && (doi = ZU.cleanDOI(items[i])) ) {
			dois.push(doi);
		}
	}
	return dois;
}

function doSearch(items) {
	var dois = filterQuery(items);
	if(!dois.length) return;
	
	processDOIs(dois);
}

function fixJSON(text) {
	try {
		var item = JSON.parse(text);
		
		if(item.type == 'misc') item.type = 'article-journal';
		
		if(item.issued && item.issued.raw) item.issued.literal = item.issued.raw;
		if(item.accessed && item.accessed.raw) item.accessed.literal = item.accessed.raw;
		
		return JSON.stringify([item]);
	} catch(e) {
		return false;
	}
}

function processDOIs(dois) {
	var doi = dois.pop();
	ZU.doGet('http://data.datacite.org/application/citeproc+json/' + encodeURIComponent(doi), function(text) {
		text = fixJSON(text);
		if(!text) {
			return;
		}
		
		// use CSL JSON translator
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7');
		trans.setString(text);
		trans.translate();
	}, function() {
		if(dois.length) processDOIs(dois, queryTracker);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "search",
		"input": {
			"DOI": "10.12763/ONA1045"
		},
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Heiliges römisches Reich deutscher Nation",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Code criminel de l'empereur Charles V vulgairement appellé la Caroline contenant les loix qui sont suivies dans les jurisdictions criminelles de l'Empire et à l'usage des conseils de guerre des troupes suisses.",
				"url": "http://dx.doi.org/10.12763/ONA1045",
				"DOI": "10.12763/ONA1045",
				"date": "1734",
				"libraryCatalog": "DataCite"
			}
		]
	}
]
/** END TEST CASES **/