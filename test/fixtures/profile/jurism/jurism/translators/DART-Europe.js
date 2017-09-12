{
	"translatorID": "658f2707-bb46-44eb-af0a-e73a5387fc90",
	"label": "DART-Europe",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.dart-europe\\.eu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-04-17 03:09:28"
}

/**
	Copyright (c) 2013 Sebastian Karcher

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




function detectWeb(doc, url) {
	if (url.indexOf("full.php?") != -1) return "thesis";
	if (url.indexOf("results.php?") != -1) return "multiple";
	
}


function scrape(doc, url) {
	var newItem = new Zotero.Item("thesis");
	var title = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Title")]/following-sibling::td');
	var thesisType = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Type")]/following-sibling::td');
	var date = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Date")]/following-sibling::td');
	var language = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Language")]/following-sibling::td');
	var abstract = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Abstract")]/following-sibling::td');
	var publisherinfo = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Publisher")]/following-sibling::td');
	var fulltext = ZU.xpathText(doc, '//tr[th[@class="field-name" and contains(text(), "Identifier")]][1]/th[@class="field-name" and contains(text(), "Identifier")]/following-sibling::td');

	//Publisher field may have place
	var place;
	if (publisherinfo && publisherinfo.indexOf(":") !=-1){
		var publisher = publisherinfo.match(/:\s*(.+)/)[1]
		var place =publisherinfo.match(/(.+):/)[1]
	}
	else var publisher = publisherinfo;

	//Authors and Tags can have multiple rows. In that case the td[1] remains empty we loop through them until that's no longer the case

	var author = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Author")]/following-sibling::td');
	if (author) newItem.creators.push(ZU.cleanAuthor(author, "author", true))


	var tags = ZU.xpathText(doc, '//tr[contains(@class, "result")]/th[@class="field-name" and contains(text(), "Subject(s)")]/following-sibling::td');
	if (tags) {
	tags = tags.split(/\s*,\s*/);
		for (var i in tags) {
			newItem.tags.push(tags[i])
		}
	}

	if (fulltext) {
		fulltext = fulltext.trim();
		if (fulltext.search(/\.pdf/) != -1) {
			newItem.attachments.push({
				url: fulltext,
				title: "Dart-Europe Full Text PDF",
				mimeType: "application/pdf"
			})
		} else if (fulltext.search(/http\:\/\//) != -1){
			newItem.attachments.push({
				url: fulltext,
				title: "DART-Europe Thesis Page",
				mimeType: "text/html"
			})
		}
	}
	newItem.attachments.push({
		document: doc,
		title: "DART-Europe Record Snapshot",
		mimeType: "text/html"
	})
	newItem.title = title;
	newItem.thesisType = thesisType;
	newItem.date = date;
	newItem.abstractNote = abstract;
	newItem.language = language;
	newItem.publisher = publisher;
	newItem.place = place;
	newItem.complete();
}


function doWeb(doc, url) {

	var articles = new Array();
	var items = {};
	if (detectWeb(doc, url) == "multiple") {
		//this currently doesn't do anything as multiple detect is disabled
		var titles = doc.evaluate('//table[@id="search-results"]//a[contains(@href, "full.php?")]', doc, null, XPathResult.ANY_TYPE, null);
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Z.debug(articles)
			Zotero.Utilities.processDocuments(articles, scrape);
		})
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.dart-europe.eu/basic-results.php?kw[]=labor&f=n&hist=y",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.dart-europe.eu/full.php?id=284332",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Charles Edmund Richard",
						"lastName": "Pennell",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Dart-Europe Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "DART-Europe Record Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "A critical investigation of the opposition of the Rifi confederation led by Muhammed bin 'Abd al-Karim al-Khattabi to Spanish colonial expansion in northern Morocco, 1920-1925, and its political and social background",
				"thesisType": "Thesis, NonPeerReviewed",
				"date": "1979",
				"abstractNote": "This thesis examines the course and political\naction of the war in the Rif mountains in northern Morocco\nbetween 1921 and 1926.\n\nAfter the declaration of a joint Franco-Spanish\nProtectorate over Morocco in 1912, the Spanish army\nattempted to impose its authority over the part of north\nMorocco which was included in its zone. After the end of\nthe First World War the Spanish were opposed in their\nefforts by a slowly growing coalition of tribes in the\ncentral Rif mountains. After the emergence of Mubammad\nbin 'Abd al-Karim al-Khattdbl as leader of the coalition,\nit was able to inflict a series of military defeats on the\nSpanish in the summer of 1921, a success which led to the'\nexpansion of the coalition and, in 1923, to the announcement\nof an independent state in the Rif under the leadership of\nbin 'Abd al-Karim.\n\nThis state was able to defeat another Spanish army\nin 1924 and, in 1925, to inflict a series of defeats upon\nthe French army in that, country's zone of Protectorate,\nbefore an alliance between France and Spain crushed the new\nstate in 1926.\n\nPrevious work has concentrated more on the\nmilitary aspects of the conflict from a European point of\nview, and examination of the Moroccan side has dwelt almost\nexclusively on the personality of the Rifi leader, bin 'Abd\nal-Karim. This thesis, however, is concerned with the\npolitical and social aspects of the war from the Moroccan\npoint of view. While it recognises the importance of bin\n'Abd al-Karim, it tries to explain his role in terms of his\npolitical position in Rifi society as'a whole. It examines\nhis political, social. and religious reforms'l not only from\nthe point of view of their importance in the overall--\nmovement for Islamic reform, but also from that of their\npractical necessity and effects.",
				"publisher": "University of Leeds",
				"libraryCatalog": "DART-Europe"
			}
		]
	}
]
/** END TEST CASES **/