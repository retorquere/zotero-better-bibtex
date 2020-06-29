{
	"translatorID": "5f22bd25-5b70-11e1-bb1d-c4f24aa18c1e",
	"label": "Annual Reviews",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*annualreviews\\.org(:[\\d]+)?(?=/)[^?]*(/(toc|journal|doi)/|showMost(Read|Cited)Articles|doSearch)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:19:19"
}

/**
	Copyright (c) 2012 Aurimas Vinckevicius

	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public
	License along with this program.  If not, see
	<http://www.gnu.org/licenses/>.
*/

//add using BibTex
function addByBibTex(doi, tags) {
	var baseUrl = 'http://www.annualreviews.org';
	var risRequest = baseUrl + '/action/downloadCitation';
	var articleUrl = baseUrl + '/doi/abs/' + doi;
	var pdfUrl = baseUrl + '/doi/pdf/' + doi;

	var postData = 'include=abs&direct=on&submit=Download+chapter+metadata&downloadFileName=citation' +
			'&format=bibtex' +		//bibtex
			'&doi=' + encodeURIComponent(doi);

	Zotero.Utilities.HTTP.doPost(risRequest, postData, function(text) {
		var translator = Zotero.loadTranslator('import');
		translator.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');	//bibtex
		translator.setString(text);

		translator.setHandler('itemDone', function(obj, item) {
			//title is sometimes in all caps
			if (item.title == item.title.toUpperCase())
				item.title = ZU.capitalizeTitle(item.title, true);
			if (item.abstractNote){
				item.abstractNote = item.abstractNote.replace(/^...?Abstract/, "")
			}
			//add tags
			if (tags) {
				item.tags = tags;
			}

			//set PDF file
			item.attachments = [{
				url: pdfUrl,
				title: 'Full Text PDF',
				mimeType: 'application/pdf'
			}];

			item.complete();
		});

		translator.translate();
	});
}

function detectWeb(doc, url) {
	var title = doc.title.toLowerCase();

	if ( url.match(/\/doi\/(abs|full|pdf)\//) ) {

		return 'journalArticle';

	} else if ( title.match('- table of contents -') ||
		title.match('- most downloaded reviews') ||
		title.match('- most cited reviews') ||
		title.match('- forthcoming -') ||
		title.match('search results') ||
		url.match('/journal/') ) {		//individual journal home page

		return 'multiple';
	}
}

function doWeb(doc, url) {
	if ( detectWeb(doc, url) == 'multiple' ) {
		var articles = Zotero.Utilities.xpath(doc, '//div[@class="articleBoxWrapper"]');
		var selectList = new Object();
		var doi, title, article;
		for ( var i in articles ) {
			article = articles[i];
			doi = Zotero.Utilities.xpath(article, './div[@class="articleCheck"]/input');
			title = Zotero.Utilities.xpathText(article, './div[@class="articleBoxMeta"]/h2/a');
			if ( doi && doi[0].value && title) {
				selectList[doi[0].value] = title;
			}
		}

		Zotero.selectItems(selectList, function(selectedItems) {
			if (selectedItems == null) return true;
			for (var item in selectedItems) {
				addByBibTex(item);
			}
		});
	} else {
		var match = url.match(/\/(?:abs|full|pdf)\/([^?]+)/);
		if (match) {
			//get keywords before we leave
			var tags, keywords = ZU.xpath(doc,
				'//form[@id="frmQuickSearch"]\
				/div[@class="pageTitle" and contains(text(), "KEYWORD")]\
				/following-sibling::div/span[@class="data"]');
			if (keywords) {
				tags = new Array();
				for (var i=0, n=keywords.length; i<n; i++) {
					tags.push(keywords[i].textContent.trim());
				}
			}

			addByBibTex(match[1], tags);
		}
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.annualreviews.org/action/doSearch?pageSize=20&sortBy=relevancy&text1=something&field1=AllField&logicalOpe1=and&text2=&field2=Abstract&logicalOpe2=and&text3=&field3=Title&filterByPub=all&publication=1449&AfterYear=&BeforeYear=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/journal/biophys",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/toc/biophys/40/1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/action/showMostCitedArticles?topArticlesType=sinceInception&journalCode=biophys",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/action/showMostReadArticles?topArticlesType=sinceInception&journalCode=biophys",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/doi/abs/10.1146/annurev.biophys.29.1.545?prevSearch=&searchHistoryKey=",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Molecular Mechanisms Controlling Actin Filament Dynamics in Nonmuscle Cells",
				"creators": [
					{
						"firstName": "Thomas D.",
						"lastName": "Pollard",
						"creatorType": "author"
					},
					{
						"firstName": "Laurent",
						"lastName": "Blanchoin",
						"creatorType": "author"
					},
					{
						"firstName": "R. Dyche",
						"lastName": "Mullins",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"DOI": "10.1146/annurev.biophys.29.1.545",
				"abstractNote": "We review how motile cells regulate actin filament assembly at their leading edge. Activation of cell surface receptors generates signals (including activated Rho family GTPases) that converge on integrating proteins of the WASp family (WASp, N-WASP, and Scar/WAVE). WASP family proteins stimulate Arp2/3 complex to nucleate actin filaments, which grow at a fixed 70° angle from the side of pre-existing actin filaments. These filaments push the membrane forward as they grow at their barbed ends. Arp2/3 complex is incorporated into the network, and new filaments are capped rapidly, so that activated Arp2/3 complex must be supplied continuously to keep the network growing. Hydrolysis of ATP bound to polymerized actin followed by phosphate dissociation marks older filaments for depolymerization by ADF/cofilins. Profilin catalyzes exchange of ADP for ATP, recycling actin back to a pool of unpolymerized monomers bound to profilin and thymosin-β4 that is poised for rapid elongation of new barbed ends.",
				"extra": "PMID: 10940259",
				"issue": "1",
				"itemID": "doi:10.1146/annurev.biophys.29.1.545",
				"libraryCatalog": "Annual Reviews",
				"pages": "545-576",
				"publicationTitle": "Annual Review of Biophysics and Biomolecular Structure",
				"url": "http://dx.doi.org/10.1146/annurev.biophys.29.1.545",
				"volume": "29",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"ADF/cofilins",
					"Arp2/3 complex",
					"WASp",
					"cell motility",
					"profilin"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.annualreviews.org/toc/anchem/5/1",
		"items": "multiple"
	}
]
/** END TEST CASES **/