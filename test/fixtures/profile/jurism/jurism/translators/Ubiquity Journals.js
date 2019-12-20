{
	"translatorID": "5c11e3bd-caf5-4da6-95d8-e67c57929098",
	"label": "Ubiquity Journals",
	"creator": "Sebastian Karcher",
	"target": "^https?://[^/]+(/articles/10\\.\\d{4,9}/[-._;()/:a-z0-9A-Z]+|/articles/?$|/\\d+/volume/\\d+/issue/\\d+)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 23:10:24"
}

/*
	Ubiquiy Press Translator
	Copyright (C) 2015 Sebastian Karcher

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
*/
function detectWeb(doc, _url) {
	var ubiquitytest = doc.getElementsByClassName("press-logo");
	// this doesn't work always, so we're only using it on single items.
	// if the translator doesn't detect there, we still get good EM import
	// For multiples we check getSearchResults
	if (ubiquitytest[0] && ubiquitytest[0].href.includes("http://www.ubiquitypress.com")) {
		if (ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content')) {
			return "journalArticle";
		}
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function doWeb(doc, url) {
	var itemType = detectWeb(doc, url);
	if (itemType === 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return;
			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	var results = ZU.xpath(doc,
			'//div[@class="article-caption"]/div[@class="caption-text"]/a[contains(@href, "/articles/10.")]'
		),
		items = {},
		found = false;
	for (var i = 0; i < results.length; i++) {
		var title = results[i].textContent;
		if (!title) continue;
		if (checkOnly) return true;
		found = true;
		title = title.trim();
		items[results[i].href] = title;
	}
	return found ? items : false;
}

function scrape(doc, url) {
	var abstract = ZU.xpathText(doc, '//meta[@name="DC.Description"]/@content');
	var translator = Zotero.loadTranslator('web');
	// use the Embedded Metadata translator
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		if (abstract) {
			item.abstractNote = ZU.cleanTags(abstract.trim());
		}
		item.complete();
	});
	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ancient-asia-journal.com/articles/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journal.eahn.org/articles/10.5334/ah.bd/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Handymen, Hippies and Healing: Social Transformation through the DIY Movement (1940s to 1970s) in North America",
				"creators": [
					{
						"firstName": "Cathy",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"date": "2014-03-19",
				"DOI": "10.5334/ah.bd",
				"ISSN": "2050-5833",
				"abstractNote": "This paper explores the relation between the ‘DIY’ (‘do-it-yourself’) movement and ‘DIY architecture’, and the notion of social transformation, in examples of DIY manuals and discourse of North America drawn from the 1940s to the 1970s. The DIY movement emerged as a significant phenomenon in North America of the 1950s, where it was associated with a mainstream audience and a residential market. By the 1960s, the DIY approach was embraced by the North American counterculture as a self-sustaining sensibility that could overcome a reliance on the mainstream, consumerist society that spurned it. On the surface, the association of DIY with the counterculture and countercultural architects appears to denote a significant ideological shift from its original association with the beliefs and culture of mainstream North America and the nuclear family. However, one of the key characterisations of the DIY movement identified in the present paper is the way it is bound to the notion of social identity and transformation, regardless of ideology. Particular attention is paid to DIY manuals and discourse of the 1950s.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "journal.eahn.org",
				"publicationTitle": "Architectural Histories",
				"rights": "Authors who publish with this journal agree to the following terms:    Authors retain copyright and grant the journal right of first publication with the work simultaneously licensed under a  Creative Commons Attribution License  that allows others to share the work with an acknowledgement of the work's authorship and initial publication in this journal.  Authors are able to enter into separate, additional contractual arrangements for the non-exclusive distribution of the journal's published version of the work (e.g., post it to an institutional repository or publish it in a book), with an acknowledgement of its initial publication in this journal.  Authors are permitted and encouraged to post their work online (e.g., in institutional repositories or on their website) prior to and during the submission process, as it can lead to productive exchanges, as well as earlier and greater citation of published work (See  The Effect of Open Access ).  All third-party images reproduced on this journal are shared under Educational Fair Use. For more information on  Educational Fair Use , please see  this useful checklist prepared by Columbia University Libraries .   All copyright  of third-party content posted here for research purposes belongs to its original owners.  Unless otherwise stated all references to characters and comic art presented on this journal are ©, ® or ™ of their respective owners. No challenge to any owner’s rights is intended or should be inferred.",
				"shortTitle": "Handymen, Hippies and Healing",
				"url": "http://journal.eahn.org/articles/10.5334/ah.bd/",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Ant Farm",
					"DIY",
					"DIY architecture",
					"Paolo Soleri"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.pediatricneurologybriefs.com/51/volume/29/issue/7/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
