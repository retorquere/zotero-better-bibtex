{
	"translatorID": "bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7",
	"translatorType": 3,
	"label": "CSL JSON",
	"creator": "Simon Kornblith",
	"target": "json",
	"minVersion": "4.0.27",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"configOptions": {
		"async": true
	},
	"lastUpdated": "2020-03-25 13:37:41"
}


var mimeTypes = {
    "PDF": "application/pdf",
    "DOC": "application/msword",
    "DOCX": "application/msword",
    "HTML": "text/html",
    "HTM": "text/html",
    "TXT": "text/plain",
    "DEFAULT": "application/octet-stream"
};

var mimeRex = new RegExp("(" + Object.keys(mimeTypes).join("|") + ")$", "i");

function getMimeType(str) {
    var mimeKey = "DEFAULT";
    var m = mimeRex.exec(str);
    if (m) {
        mimeKey = m[1].toUpperCase();
    }
    return mimeTypes[mimeKey];
}

function parseInput() {
	var str, json = "";
	
	// Read in the whole file at once, since we can't easily parse a JSON stream. The 
	// chunk size here is pretty arbitrary, although larger chunk sizes may be marginally
	// faster. We set it to 1MB.
	while ((str = Z.read(1048576)) !== false) json += str;
	
	try {
		return JSON.parse(json);
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
		"song":true, "speech":true, "thesis":true, "treaty":true, "webpage":true,
		"gazette":true, "regulation":true, "classic":true, "standard":true, "hearing":true, "video":true};
		
	var parsedData = parseInput();
	if (!parsedData) return false;
	
	if (typeof parsedData !== "object") return false;
	if (!(parsedData instanceof Array)) parsedData = [parsedData];
	
	for (var i=0; i<parsedData.length; i++) {
		var item = parsedData[i];
		// second argument is for "strict"
		if (typeof item !== "object" || !item.type || !CSL_TYPES[item.type]) {
			return false;
		}
	}
	return true;
}

function doImport() {
	if (typeof Promise == 'undefined') {
		startImport(
			function () {},
			function (e) {
				throw e;
			}
		);
	}
	else {
		return new Promise(function (resolve, reject) {
			startImport(resolve, reject);
		});
	}
}

function startImport(resolve, reject) {
	try {
		var parsedData = parseInput();
		if (!parsedData) resolve();
		if (!Array.isArray(parsedData)) parsedData = [parsedData];
		importNext(parsedData, resolve, reject);
	}
	catch (e) {
		reject (e);
	}
}

function importNext(data, resolve, reject) {
	try {
		var d;
		while (d = data.shift()) {
			var item = new Z.Item();
			ZU.itemFromCSLJSON(item, d);
			item.attachments = [];
            item.tags = [];
			if (d.attachments && d.attachments.length) {
				for (var att of d.attachments) {
                    var title = null, path = null;
                    if (typeof att === "string") {
                        title = "Attachment";
                        path = att;
                    } else if (att.title && att.url) {
                        title = att.title;
                        path = att.path;
                    }
                    if (title && path) {
					    item.attachments.push({
						    title: title,
						    path: path,
						    mimeType: getMimeType(path)
					    });
                    }
				}
			}
            if (d.tags) {
                var tags = d.tags;
                if (typeof d.tags === "string") {
                    tags = d.tags.split(/\s*,\s*/);
                }
                item.tags = tags;
            }
			var maybePromise = item.complete();
			if (maybePromise) {
				maybePromise.then(function () {
					importNext(data, resolve, reject);
				});
				return;
			}
		}
	}
	catch (e) {
		reject(e);
	}
	
	resolve();
}

function doExport() {
	var item, data = [];
	while (item = Z.nextItem()) {
		if (item.extra) {
			item.extra = item.extra.replace(/(?:^|\n)citation key\s*:\s*([^\s]+)(?:\n|$)/i, (m, citationKey) => {
				item.citationKey = citationKey;
				return '\n';
			}).trim();
		}
		var cslItem = ZU.itemToCSLJSON(item);
		if (item.citationKey) cslItem.id = item.citationKey;
		data.push(cslItem);
	}
	Z.write(JSON.stringify(data, null, "\t"));
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "[\n\t{\n\t\t\"id\": \"http://zotero.org/users/96641/items/BDQRTS3T\",\n\t\t\"type\": \"book\",\n\t\t\"title\": \"Stochastic biomathematical models: With applications to neuronal modeling\",\n\t\t\"collection-title\": \"Lecture notes in mathematics\",\n\t\t\"publisher\": \"Springer\",\n\t\t\"publisher-place\": \"Heidelberg\",\n\t\t\"volume\": \"2058\",\n\t\t\"number-of-pages\": \"206\",\n\t\t\"event-place\": \"Heidelberg\",\n\t\t\"ISBN\": \"978-3-642-32156-6\",\n\t\t\"language\": \"en\",\n\t\t\"author\": [\n\t\t\t{\n\t\t\t\t\"family\": \"Bachar\",\n\t\t\t\t\"given\": \"Mostafa\"\n\t\t\t}\n\t\t],\n\t\t\"issued\": {\n\t\t\t\"date-parts\": [\n\t\t\t\t[\n\t\t\t\t\t\"2013\",\n\t\t\t\t\t1,\n\t\t\t\t\t1\n\t\t\t\t]\n\t\t\t]\n\t\t}\n\t}\n]",
		"items": [
			{
				"itemType": "book",
				"title": "Stochastic biomathematical models: With applications to neuronal modeling",
				"creators": [
					{
						"lastName": "Bachar",
						"firstName": "Mostafa",
						"creatorType": "author"
					}
				],
				"date": "January 1, 2013",
				"ISBN": "978-3-642-32156-6",
				"itemID": "http://zotero.org/users/96641/items/BDQRTS3T",
				"language": "en",
				"numPages": "206",
				"place": "Heidelberg",
				"publisher": "Springer",
				"series": "Lecture notes in mathematics",
				"volume": "2058",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
