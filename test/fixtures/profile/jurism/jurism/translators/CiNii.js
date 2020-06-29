{
	"translatorID": "46291dc3-5cbd-47b7-8af4-d009078186f6",
	"label": "CiNii",
	"creator": "Michael Berkowitz and Mitsuo Yoshida",
	"target": "https?://ci.nii.ac.jp/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-05-05 15:58:26"
}

// Update test



// Assume that all creators are individuals, and not
// institutions.
function fixAuthor(obj) {
	var lst, i, ilen, creator, workingCreator, snipoffset, compositeStr, newCreator;
	// Abort if not a string
	if ("string" !== typeof obj.lastName) {
		return;
	}
	var str = obj.lastName;
	// Replace any comma and surrounding spaces with a single space
	str = str.replace(/\s*,\s*/g, " ");
	// Strip leading and trailing spaces
		str = str.replace(/^\s+/, "").replace(/\s+$/, "");
	// Abort if empty string
	if (!str) {
		return;
	}
	
	// Regular expression: word in all capitals
	var allCapsRe = /^[A-Z\u0400-\u042f]+$/;
	// Regular expression: romanesque string
	var hasRomanesque = /[a-zA-Z\u0080-\u017f\u0400-\u052f]/;
	
	lst = str.split(/\s+/);
	if (lst.length === 1) {
		// Catch single-word names -- WHO maybe?
		obj.lastName = lst[0];
	} else if (!hasRomanesque.exec(str)) {
		// Catch CJ names
		obj.lastName = lst[0];
		// Should always be a single string, but who knows
		obj.firstName = lst.slice(1).join(" ");
	} else {
		var workingCreator = {};
		workingCreator.lastName = [];
		workingCreator.firstName = [];
		
		// Break down Byzantine names ...
		// Normalize leading particles
		for (i = 0, ilen = lst.length; i < ilen; i += 1) {
			if (["von","de","di","le"].indexOf(lst[i].toLowerCase()) > -1) {
				lst[i] = lst[i].toLowerCase();
			} else {
				break;
			}
		}
		// Normalize trailing particles
		for (i = lst.length - 1; i > -1; i += -1) {
			if (["von","de","di","le"].indexOf(lst[i].toLowerCase()) > -1) {
				lst[i] = lst[i].toLowerCase();
			} else {
				break;
			}
		}
		// Snip off trailing particles
		for (i = lst.length - 1; i > -1; i += -1) {
			if (!allCapsRe.test(lst[i][0])) {
				workingCreator.lastName.push(lst.pop());
			} else {
				break;
				}
		}
		// Snip off leading particles
		for (i = 0, ilen = lst.length; i < ilen; i += 1) {
			if (!allCapsRe.test(lst[i][0])) {
				workingCreator.lastName.push(lst[i]);
			} else {
				lst = lst.slice(i);
				break;
			}
		}
		if (lst.length > 0) {
			workingCreator.lastName.push(lst[0]);
			lst = lst.slice(1);
		}
		if (lst.length > 0) {
			workingCreator.firstName = workingCreator.firstName.concat(lst);
		}
		//compositeStr = workingCreator.lastName.join(" ") +
		//	", " +
		//	workingCreator.firstName.join(" ");
		obj.lastName = workingCreator.lastName.join(" ");
		obj.firstName = workingCreator.firstName.join(" ");
		//
		// Finally, fix up any all-caps family names
		if (hasRomanesque.test(obj.lastName) && obj.lastName === obj.lastName.toUpperCase()) {
			obj.lastName = obj.lastName.slice(0, 1) + obj.lastName.slice(1).toLowerCase();
		}
	}
};
function fixMultiAuthors(obj) {
	fixAuthor(obj);
	if (obj.multi) {
		for (var servantLang in obj.multi._key) {
			fixAuthor(obj.multi._key[servantLang]);
		}
	}
}

// Assume that all creators are individuals, and not
// institutions.
function fixAuthor(obj) {
	var lst, i, ilen, creator, workingCreator, snipoffset, compositeStr, newCreator;
	// Abort if not a string
	if ("string" !== typeof obj.lastName) {
		return;
	}
	var str = obj.lastName;
	// Replace any comma and surrounding spaces with a single space
	str = str.replace(/\s*,\s*/g, " ");
	// Strip leading and trailing spaces
		str = str.replace(/^\s+/, "").replace(/\s+$/, "");
	// Abort if empty string
	if (!str) {
		return;
	}
    
	// Regular expression: word in all capitals
	var allCapsRe = /^[A-Z\u0400-\u042f]+$/;
	// Regular expression: romanesque string
	var hasRomanesque = /[a-zA-Z\u0080-\u017f\u0400-\u052f]/;
    
	lst = str.split(/\s+/);
	if (lst.length === 1) {
		// Catch single-word names -- WHO maybe?
		obj.lastName = lst[0];
	} else if (!hasRomanesque.exec(str)) {
		// Catch CJ names
		obj.lastName = lst[0];
		// Should always be a single string, but who knows
		obj.firstName = lst.slice(1).join(" ");
	} else {
		var workingCreator = {};
		workingCreator.lastName = [];
		workingCreator.firstName = [];
        
		// Break down Byzantine names ...
		// Normalize leading particles
		for (i = 0, ilen = lst.length; i < ilen; i += 1) {
			if (["von","de","di","le"].indexOf(lst[i].toLowerCase()) > -1) {
				lst[i] = lst[i].toLowerCase();
			} else {
				break;
			}
		}
		// Normalize trailing particles
		for (i = lst.length - 1; i > -1; i += -1) {
			if (["von","de","di","le"].indexOf(lst[i].toLowerCase()) > -1) {
				lst[i] = lst[i].toLowerCase();
			} else {
				break;
			}
		}
		// Snip off trailing particles
		for (i = lst.length - 1; i > -1; i += -1) {
			if (!allCapsRe.test(lst[i][0])) {
				workingCreator.lastName.push(lst.pop());
			} else {
				break;
				}
		}
		// Snip off leading particles
		for (i = 0, ilen = lst.length; i < ilen; i += 1) {
			if (!allCapsRe.test(lst[i][0])) {
				workingCreator.lastName.push(lst[i]);
			} else {
				lst = lst.slice(i);
				break;
			}
		}
		if (lst.length > 0) {
			workingCreator.lastName.push(lst[0]);
			lst = lst.slice(1);
		}
		if (lst.length > 0) {
			workingCreator.firstName = workingCreator.firstName.concat(lst);
		}
		//compositeStr = workingCreator.lastName.join(" ") +
		//	", " +
		//	workingCreator.firstName.join(" ");
		obj.lastName = workingCreator.lastName.join(" ");
		obj.firstName = workingCreator.firstName.join(" ");
		//
		// Finally, fix up any all-caps family names
		if (hasRomanesque.test(obj.lastName) && obj.lastName === obj.lastName.toUpperCase()) {
			obj.lastName = obj.lastName.slice(0, 1) + obj.lastName.slice(1).toLowerCase();
		}
	}
};
function fixMultiAuthors(obj) {
	fixAuthor(obj);
	if (obj.multi) {
		for (var servantLang in obj.multi._key) {
			fixAuthor(obj.multi._key[servantLang]);
		}
	}
}



function detectWeb(doc, url) {
	if (url.match(/naid/)) {
		return "journalArticle";
	} else if (doc.evaluate('//a[contains(@href, "/naid/")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var links = doc.evaluate('//a[contains(@href, "/naid/")]', doc, null, XPathResult.ANY_TYPE, null);
		var link;
		while (link = links.iterateNext()) {
			items[link.href] = Zotero.Utilities.trimInternal(link.textContent);
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				arts.push(i);
			}
			Zotero.Utilities.processDocuments(arts, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	url = url.replace(/\?.*/, "").replace(/\/$/,"").replace(/\/(?:en|ja)/,"") + '.rdf';
	Zotero.Utilities.HTTP.doGet(url, function (rdfStr) {
		var rdftrans = Zotero.loadTranslator("import");
		rdftrans.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		rdftrans.setString(rdfStr);
		rdftrans.setHandler("itemDone", function(obj, item) {
			item.itemType = "journalArticle";
			for (var i = 0, ilen = item.creators.length; i < ilen; i += 1) {
				if (item.creators[i].lastName && item.creators[i].firstName) {
					item.creators[i].lastName = item.creators[i].lastName +
						", " +
						item.creators[i].firstName;
					item.creators[i].firstName = false;
				}
				fixMultiAuthors(item.creators[i]);
				var lastName = item.creators[i].lastName;
				if (lastName) {
					var jlst = lastName.split(/\s+/);					
					for (var j = 0, jlen = jlst.length; j < jlen; j += 1) {
						var klst = jlst[j].split('-');
						for (var k = 0, klen = klst.length; k < klen; k += 1) {
							if (klst[k].match(/^[A-Z]+$/)) {
								klst[k] = klst[k].slice(0, 1) + klst[k].slice(1).toLowerCase();
							}
						}
						jlst[j] = klst.join('-');
					}
					lastName = jlst.join(" ");
					item.creators[i].lastName = lastName;
				}
			}
			if (item.language && item.language.toLowerCase() === "jpn") {
				item.language = "ja";
			}
			// XXXX This is a hack to avoid garbage returns from CiNii RDF.
			if (!item.itemID || item.itemID.slice(0,26) === 'https://ci.nii.ac.jp/naid/') {
			    item.complete();
            }
		});
		rdftrans.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ci.nii.ac.jp/search?q=test&range=0&count=20&sortorder=1&type=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ci.nii.ac.jp/naid/110008803112",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "<研究速報>観測用既存鉄骨造モデル構造物を用いたオンライン応答実験=Pseudo-dynamic tests on existing steel model structure for seismic monitoring",
				"creators": [
					{
						"lastName": "岡田",
						"creatorType": "author",
						"multi": {
							"_lst": [
								"en"
							],
							"_key": {
								"en": {
									"lastName": "Keisuke",
									"creatorType": "author",
									"firstName": "Okada"
								}
							}
						},
						"firstName": "啓佑"
					},
					{
						"lastName": "伊野",
						"creatorType": "author",
						"multi": {
							"_lst": [
								"en"
							],
							"_key": {
								"en": {
									"lastName": "Fumihiko",
									"creatorType": "author",
									"firstName": "Ino"
								}
							}
						},
						"firstName": "文彦"
					},
					{
						"lastName": "萩原",
						"creatorType": "author",
						"multi": {
							"_lst": [
								"en"
							],
							"_key": {
								"en": {
									"lastName": "Kenichi",
									"creatorType": "author",
									"firstName": "Hagihara"
								}
							}
						},
						"firstName": "兼一"
					}
				],
				"date": "November 2002",
				"DOI": "10.11188/seisankenkyu.54.384",
				"ISSN": "0037105X",
				"issue": "6",
				"itemID": "110000244188",
				"libraryCatalog": "CiNii",
				"pages": "384-387",
				"publicationTitle": "生産研究",
				"url": "http://ci.nii.ac.jp/naid/110000244188/ja/",
				"volume": "54",
				"attachments": [
					{
						"title": "<研究速報>観測用既存鉄骨造モデル構造物を用いたオンライン応答実験=Pseudo-dynamic tests on existing steel model structure for seismic monitoring Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
