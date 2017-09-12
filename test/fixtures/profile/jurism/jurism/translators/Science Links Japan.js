{
	"translatorID": "c0d7d260-d795-4782-9446-f6c403a7922c",
	"label": "Science Links Japan",
	"creator": "Michael Berkowitz",
	"target": "^https?://sciencelinks\\.jp/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-06-02 21:28:10"
}

function scrape(doc) {
	var data = ZU.xpath(doc, '//div[@id="result_detail"]/table/tbody/tr/td');
	var item = new Zotero.Item("journalArticle");
	var m;
	for(var i=0, n=data.length; i<n; i++) {
		var datum = ZU.trimInternal(data[i].textContent);
		if (m = datum.match(/^Title;(.*)$/)) {
			item.title = ZU.capitalizeTitle(m[1]);
		} else if (datum.indexOf('Author;') == 0 && (m = datum.match(/\b[A-Z'\-]+\s+[A-Z'\-]+/g))) {
			for (var j=0; j<m.length; j++) {
				item.creators.push(Zotero.Utilities.cleanAuthor(Zotero.Utilities.capitalizeTitle(m[j], true), "author"));
			}
		} else if (m = datum.match(/^Journal Title;(.*)$/)) {
			item.publicationTitle = m[1];
		} else if (m = datum.match(/^ISSN[;:]([\d\-]+)/)) {
			item.ISSN = m[1];
		} else if (m = datum.match(/^VOL\.([^;]+);NO\.([^;]+);PAGE\.([^(]+)\s*.*\((\d+)\)$/)) {
			item.volume = m[1];
			item.issue = m[2];
			item.pages = m[3];
			item.date = m[4];
		} else if (m = datum.match(/^Abstract;(.*)/)) {
			item.abstractNote = m[1];
		}
	}
	item.url = doc.location.href;
	item.attachments = [{url:item.url, title:"Science Links Japan Snapshot", mimeType:"text/html"}];
	item.complete();
}
function detectWeb(doc, url) {
	if (url.match(/result/) || url.match(/journal/)) {
		return "multiple";
	} else if (url.match(/article/)) {
		return "journalArticle";
	}
	else if (url.match(/display\.php/)){
		return "journalArticle"
	}
	
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var links = ZU.xpath(doc, '//div[@id="result"]//td[@class="title"]/strong');
		var items = ZU.getItemArray(doc, links);
		Zotero.selectItems(items, function(items) {
			if(!items) return true;
			var arts = new Array();
			for (var i in items) {
				arts.push(i);
			}
			ZU.processDocuments(arts, scrape);
		});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://sciencelinks.jp/j-east/article/200704/000020070407A0083452.php",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Takami",
						"lastName": "Toshiya",
						"creatorType": "author"
					},
					{
						"firstName": "Maki",
						"lastName": "Jun",
						"creatorType": "author"
					},
					{
						"firstName": "Ooba",
						"lastName": "Jun-Ichi",
						"creatorType": "author"
					},
					{
						"firstName": "Kobayashi",
						"lastName": "Taizo",
						"creatorType": "author"
					},
					{
						"firstName": "Nogita",
						"lastName": "Rie",
						"creatorType": "author"
					},
					{
						"firstName": "Aoyagi",
						"lastName": "Mutsumi",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Science Links Japan Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Interaction and Localization of One-Electron Orbitals in an Organic Molecule: Fictitious Parameter Analysis for Multiphysics Simulations",
				"publicationTitle": "J Phys Soc Jpn",
				"ISSN": "0031-9015",
				"volume": "76",
				"issue": "1",
				"pages": "013001.1-013001.4",
				"date": "2007",
				"abstractNote": "We present a new methodology for analyzing complicated multiphysics simulations by introducing a fictitious parameter. Using the method, we study the quantum mechanical aspects of an organic molecule in water. The simulation is variationally constructed from the ab initio molecular orbital method and classical statistical mechanics, with the fictitious parameter representing the coupling strength between solute and solvent. We obtain a number of one-electron orbital energies of the solute molecule derived from the Hartree-Fock approximation, and eigenvalue statistical analysis developed in the study of nonintegrable systems is applied to them. On the basis of the results, we analyze the localization properties of the electronic wavefunctions under the influence of the solvent. (author abst.)",
				"url": "http://sciencelinks.jp/j-east/article/200704/000020070407A0083452.php",
				"libraryCatalog": "Science Links Japan",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Interaction and Localization of One-Electron Orbitals in an Organic Molecule"
			}
		]
	}
]
/** END TEST CASES **/