{
	"translatorID": "2c310a37-a4dd-48d2-82c9-bd29c53c1c76",
	"label": "APS",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://journals\\.aps\\.org",
	"minVersion": "3.0.12",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-05-08 21:55:24"
}

function getSearchResults(doc) {
	var articles = doc.getElementsByClassName('article');
	var results = [];
	for(var i=0; i<articles.length; i++) {
		if(articles[i].getElementsByClassName('reveal-export').length) {
			results.push(articles[i]);
		}
	}
	
	return results;
}

function detectWeb(doc, url) {
	if(getSearchResults(doc).length){
		return "multiple";
	}
	
	var title = doc.getElementById('title');
	if(title && ZU.xpath(title, './/a[@data-reveal-id="export-article"]').length) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		var results = getSearchResults(doc);
		var items = {};
		for(var i=0; i<results.length; i++) {
			var title = ZU.xpath(results[i], './/h5[@class="title"]/a')[0];
			items[title.href] = cleanMath(title.textContent);
		}
		
		Z.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var urls = [];
			for(var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	url = url.replace(/[?#].*/, '').replace(/\/abstract\//, '/{REPLACE}/');
	// fetch RIS
	var risUrl = url.replace('{REPLACE}', 'export')
			   + '?type=ris&download=true';
	ZU.doGet(risUrl, function(text) {
		text = text.replace(/^ID\s+-\s+/mg, 'DO  - ');
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7'); //RIS
		trans.setString(text);
		trans.setHandler('itemDone', function(obj, item) {
			// scrape abstract from page
			item.abstractNote = ZU.trimInternal(cleanMath(
				ZU.xpathText(doc, '//section[contains(@class,"abstract")]/div[@class="content"]/p[1]')
			));
			
			// attach PDF
			if(ZU.xpath(doc, '//section[@id="title"]//a[starts-with(text(), "PDF")]').length) {
				item.attachments.push({
					title: 'Full Text PDF',
					url: url.replace('{REPLACE}', 'pdf'),
					mimeType: 'application/pdf'
				});
			}
			
			item.attachments.push({
				title: "APS Snapshot",
				document: doc
			});
			
			if(Z.getHiddenPref && Z.getHiddenPref('attachSupplementary')) {
				try {
					// Fetch supplemental info as JSON
					ZU.doGet(url.replace('{REPLACE}', 'supplemental'), function(text) {
						var suppInfo = JSON.parse(text);
						var asLink = Z.getHiddenPref('supplementaryAsLink');
						for(var i=0; i<suppInfo.components.length; i++) {
							var supp = suppInfo.components[i];
							if(!supp.path) continue;
							var title = supp.filename || 'Supplementary Data';
							if(asLink) {
								item.attachments.push({
									title: title,
									url: supp.path,
									mimeType: 'text/html',
									snapshot: false
								});
							} else {
								item.attachments.push({
									title: title,
									url: supp.path
									//probably PDF, but not sure it's always the case
								});
							}
						}
					}, function() { item.complete() });
				} catch(e) {
					Z.debug('Could not attach supplemental data. ' + e.message);
					item.complete();
				}
			} else {
				item.complete();
			}
		});
		trans.translate();
	});
}

function cleanMath(str) {
	//math tags appear to have duplicate content and are somehow left in even after textContent
	return str.replace(/<(math|mi)[^<>]*>.*?<\/\1>/g, '');
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.aps.org/prd/abstract/10.1103/PhysRevD.84.077701",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Raidal",
						"firstName": "Martti",
						"creatorType": "author"
					},
					{
						"lastName": "Strumia",
						"firstName": "Alessandro",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
					}
				],
				"DOI": "10.1103/PhysRevD.84.077701",
				"url": "http://link.aps.org/doi/10.1103/PhysRevD.84.077701",
				"journalAbbreviation": "Phys. Rev. D",
				"issue": "7",
				"abstractNote": "We reconsider Higgs boson invisible decays into Dark Matter in the light of recent Higgs searches at the LHC. Present hints in the Compact Muon Solenoid and ATLAS data favor a nonstandard Higgs boson with approximately 50% invisible branching ratio, and mass around 143 GeV. This situation can be realized within the simplest thermal scalar singlet Dark Matter model, predicting a Dark Matter mass around 50 GeV and direct detection cross section just below present bound. The present runs of the Xenon100 and LHC experiments can test this possibility.",
				"libraryCatalog": "APS",
				"title": "Hints for a nonstandard Higgs boson from the LHC",
				"publicationTitle": "Physical Review D",
				"volume": "84",
				"pages": "077701",
				"date": "October 21, 2011"
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals.aps.org/prd/issues/84/7",
		"items": "multiple"
	}
]
/** END TEST CASES **/
