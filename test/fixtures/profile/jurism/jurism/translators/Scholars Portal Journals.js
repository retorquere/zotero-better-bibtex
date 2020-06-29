{
	"translatorID": "5ac0fd37-5578-4f82-8340-0e135b6336ee",
	"label": "Scholars Portal Journals",
	"creator": "Bartek Kawula",
	"target": "^https?://journals\\d?\\.scholarsportal\\.info/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 10:24:20"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Bartek Kawula

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) { 
	var myArticles = doc.getElementById('my-articles');
	if (myArticles) {
  		Zotero.monitorDOMChanges(myArticles.parentElement, {attributes: true, attributeFilter: ["style"]});
	}
	// see if saved list is toggled open
	if (doc.getElementsByClassName('inner-wrap-open') [0]) {
		if (getItems(doc, true)) {
			return 'multiple';
		}
	} else if (url.indexOf("/search?q") != -1 || url.indexOf("/browse/") != -1) {
		if (getItems(doc, true)) {
			return 'multiple';
		}
	} else if (url.indexOf("/details/") != -1) {
		return 'journalArticle';
	} 
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		var list = getItems(doc, url);
		Zotero.selectItems(list, function(selectedItems) {
			if (!selectedItems) return true;
			var articles = [];
			for (var i in selectedItems) {
				var article = '/ris?uri='+i;
				articles.push(article);
			}
			ZU.doGet(articles, scrape);
		});
	} else {
		var uri = getURI(url);
		var article = '/ris?uri='+uri;
		ZU.doGet(article, scrape);
	}
}

function getURI(url){
	if (url.indexOf("xml") != -1){
		var a = url.indexOf("details");
		var b = url.indexOf("xml");
		return url.substring(a+7,b+3);
	} else if (url.indexOf("resolver.scholarsportal.info/resolve/") != -1)  {
		return url.split("resolver.scholarsportal.info/resolve")[1] + ".xml";
	}
}

function getItems(doc, url) {
	var items = {}, found = false;
	if (doc.getElementsByClassName('inner-wrap-open') [0]) {
		var titles = ZU.xpath(doc.getElementById('my-articles-list'), './/div[@class = "title"]/h3/a');
		for (var i=0; i<titles.length; i++) { 
			var title = ZU.trimInternal(titles[i].textContent);
			var uri = getURI(titles[i].href);
			items[uri] = title;
			found = true;
		}
	} else {
		if (doc.URL.indexOf("/browse") != -1){
			var titles = ZU.xpath(doc, './/div/h4/a');
		}
		else {
			var titles = ZU.xpath(doc.getElementById('result-list'), './/div[@class = "details"]/h3/a');
		
		}
		for (var i=0; i<titles.length; i++) { 
			var title = ZU.trimInternal(titles[i].textContent);
			var uri = getURI(titles[i].href);
			items[uri] = title;
			found = true;
		}
	}
	return found ? items : false;
}

function scrape(text, doc) { 
	// loading RIS transformer. 
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function(obj, item) {
		var uri = getURI(item.attachments[0].path);
		var pdfURL = "/pdf" + uri;
		item.url = "http://journals.scholarsportal.info/details" + uri;
		item.attachments = [{
			url: pdfURL,
			title: "Scholars Portal Full Text PDF",
			mimeType: "application/pdf"
		}];
		item.complete();
	});
	translator.translate();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://journals.scholarsportal.info/search?q=water&search_in=anywhere&date_from=&date_to=&sort=relevance&sub=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journals.scholarsportal.info/details/00959782/v37i0006/841_tnowhbdbmoxs.xml",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Number of Water-Water Hydrogen Bonds in Water-Tetrahydrofuran and Water-Acetone Binary Mixtures Determined by Means of X-Ray Scattering",
				"creators": [
					{
						"lastName": "Katayama",
						"firstName": "Misaki",
						"creatorType": "author"
					},
					{
						"lastName": "Ozutsumi",
						"firstName": "Kazuhiko",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"DOI": "10.1007/s10953-008-9276-0",
				"ISSN": "0095-9782",
				"abstractNote": "The liquid structures of water-tetrahydrofuran (THF) and water-acetone binary mixtures were investigated by the X-ray scattering method. Comparison of the X-ray scattering data revealed that only one kind of intermolecular water-organic molecule interaction is commonly involved throughout all mole fractions of these liquid mixtures, in addition to the intermolecular water-water and organic molecule-organic molecule interactions, which are present in neat water and organic liquids, respectively. On the basis of this finding, we proposed a new analytical method for studying liquid mixtures. By this method the structural information on the intermolecular water-organic molecule interaction as well as the concentrations of the intermolecular water-water, water-organic molecules, and organic molecule-organic molecule interactions were obtained. Combining the concentrations of the intermolecular water-water interaction with the concentrations of water in the liquid mixtures, the number of water-water hydrogen bonds at various mole fractions was experimentally determined for the first time. From the dependence of the number of water-water hydrogen bonds on the composition of the liquid mixtures, the change of the size of the self-associated water-water clusters was deduced.",
				"issue": "6",
				"journalAbbreviation": "Journal of Solution Chemistry",
				"libraryCatalog": "Scholars Portal Journals",
				"pages": "841-856",
				"publicationTitle": "Journal of Solution Chemistry",
				"url": "http://journals.scholarsportal.info/details/00959782/v37i0006/841_tnowhbdbmoxs.xml",
				"volume": "37",
				"attachments": [
					{
						"title": "Scholars Portal Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Acetone",
					"Binary liquid mixtures",
					"Tetrahydrofuran",
					"Water",
					"Water-water hydrogen bonds",
					"X-ray scattering"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals1.scholarsportal.info/browse/toc?uri=/08939454&p=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/