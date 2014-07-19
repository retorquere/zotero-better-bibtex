{
	"translatorID": "bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7",
	"label": "CSL JSON",
	"creator": "Simon Kornblith",
	"target": "json",
	"minVersion": "3.0b3",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcs",
	"lastUpdated": "2013-10-24 05:03:52"
}

var parsedData;

function parseInput() {
	var str, json = "";
	
	// Read in the whole file at once, since we can't easily parse a JSON stream. The 
	// chunk size here is pretty arbitrary, although larger chunk sizes may be marginally
	// faster. We set it to 1MB.
	while((str = Z.read(1048576)) !== false) json += str;
	
	try {
		parsedData = JSON.parse(json);	
	} catch(e) {
		Zotero.debug(e);
	}
}

function detectImport() {
	const CSL_TYPES = {"article":true, "article-journal":true, "article-magazine":true,
		"article-newspaper":true, "bill":true, "book":true, "broadcast":true,
		"chapter":true, "dataset":true, "entry":true, "entry-dictionary":true,
		"entry-encyclopedia":true, "figure":true, "graphic":true, "interview":true,
		"legal_case":true, "legislation":true, "manuscript":true, "map":true,
		"motion_picture":true, "musical_score":true, "pamphlet":true,
		"paper-conference":true, "patent":true, "personal_communication":true,
		"post":true, "post-weblog":true, "report":true, "review":true, "review-book":true,
		"song":true, "speech":true, "thesis":true, "treaty":true, "webpage":true};
		
	parseInput();
	if(!parsedData) return false;
	
	if(typeof parsedData !== "object") return false;
	if(!(parsedData instanceof Array)) parsedData = [parsedData];
	
	for(var i=0; i<parsedData.length; i++) {
		var item = parsedData[i];
		if(typeof item !== "object" || !item.type || !(item.type in CSL_TYPES)) {
			return false;
		}
	}
	return true;
}

function doImport() {
	if(!parsedData) parseInput();
	if(!parsedData) return;
	
	for(var i=0; i<parsedData.length; i++) {
		var item = new Z.Item();
		ZU.itemFromCSLJSON(item, parsedData[i]);
		item.complete();
	}
}

function doExport() {
	var item, data = [];
	while(item = Z.nextItem()) data.push(ZU.itemToCSLJSON(item));
	Z.write(JSON.stringify(data, null, "\t"));
}