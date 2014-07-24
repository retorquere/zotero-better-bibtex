{
	"translatorID": "e5dc9733-f8fc-4c00-8c40-e53e0bb14664",
	"label": "Wikipedia",
	"creator": "Aurimas Vinckevicius",
	"target": "https?://[^/]*wikipedia\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-11-28 22:10:10"
}

/**
	Copyright (c) 2012 Aurimas Vinckevicius
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	if(ZU.xpathText(doc, '//h1[@id="firstHeading"]/span'))
		return 'encyclopediaArticle';
}

function doWeb(doc, url) {
	var item = new Zotero.Item('encyclopediaArticle');
	item.title = ZU.xpathText(doc, '//h1[@id="firstHeading"]/span');
	
	/* Removing the creator and publisher. Wikipedia is pushing the creator in their own
  	directions on how to cite http://en.wikipedia.org/w/index.php?title=Special%3ACite&page=Psychology
  	but style guides - including Chicago and APA disagree and prefer just using titles.
  	cf. e.g. http://blog.apastyle.org/apastyle/2009/10/how-to-cite-wikipedia-in-apa-style.html
  	For Publisher, not even Wikipedia suggests citing the Foundation as a Publisher.

	item.creators.push({
		lastName: 'Wikipedia contributors',
		fieldMode: 1,
		creatorType: 'author'
	});

	item.publisher = 'Wikimedia Foundation, Inc.';
	*/
	item.rights = 'Creative Commons Attribution-ShareAlike License';

	//turns out it's not that trivial to get the localized title for Wikipedia
	//we can try to strip it from the page title though
	//test for all sorts of dashes to account for different locales
	/**TODO: there's probably a better way to do this, since sometimes page
	 * title only says "- Wikipedia" (in some other language)
	 */
	var m = doc.title.match(/[\u002D\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B]\s*([^\u002D\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B]+)$/);
	if(m) {
		item.encyclopediaTitle = m[1];
	} else {
		item.encyclopediaTitle = 'Wikipedia, the free encyclopedia';
	}

	item.url = ZU.xpathText(doc, '//li[@id="t-permalink"]/a/@href');
	if(item.url) {
		item.extra = 'Page Version ID: ' + 
						item.url.match(/[&?]oldid=(\d+)/)[1];
		item.url = doc.location.protocol + '//' + doc.location.hostname
					+ item.url;
	} else {
		item.url = url
	}

	item.attachments.push({
		url: item.url,
		title: 'Snapshot',
		mimeType: 'text/html',
		snapshot: true
	});

	item.language = doc.documentElement.lang;

	var abs = ZU.xpathText(doc, '//div[@id="mw-content-text"]/p[1]', null, '');
	if(abs) item.abstractNote = ZU.trimInternal(abs);

	//last modified date is hard to get from the page because it is localized
	var pageInfoURL = '/w/api.php?action=query&prop=info&format=json&' + 
						'inprop=url%7Cdisplaytitle&titles=' +
						item.title;
	ZU.doGet(pageInfoURL, function(text) {
		var retObj = JSON.parse(text);
		if(retObj && !retObj.query.pages['-1']) {
			var pages = retObj.query.pages;
			for(var i in pages) {
				item.date = pages[i].touched;
				item.title = pages[i].displaytitle;
				//we should never have more than one page returned,
				//but break just in case
				break;
			}
		}
		item.complete();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ru.wikipedia.org/w/index.php?title=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F&oldid=43336101",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "Россия",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"encyclopediaTitle": "Википедия",
				"url": "http://ru.wikipedia.org/w/index.php?title=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F&oldid=43336101",
				"extra": "Page Version ID: 43336101",
				"language": "ru",
				"abstractNote": "Росси́я (от греч. Ρωσία — Русь[1]; официально — Росси́йская Федера́ция или Росси́я[2], на практике используется также сокращение — РФ[3]) — страна, расположенная в Восточной Европе и Северной Азии. Является самым большим государством мира (17 098 246 км²[4], что составляет 11,46 % (~1 / 9 часть, равная 11,11 %) площади всей суши Земли, или 12,65 % (~1 / 8 часть, равная 12,5 %) заселённой человеком суши, что почти вдвое больше, чем у занимающей второе место Канады). Население на 2012 год составляет 143 030 106 человек[5], в настоящее время страна занимает девятое место в мире по этому показателю. Государственный язык на всей территории страны — русский. В 23 субъектах федерации наряду с русским используются другие государственные языки. Столица — город Москва. Всего в России 13 городов с населением более миллиона человек: Москва, Санкт-Петербург, Новосибирск, Екатеринбург, Нижний Новгород, Самара, Омск, Казань, Челябинск, Ростов-на-Дону, Уфа, Волгоград[6], Пермь[7].",
				"date": "2012-10-31T19:07:35Z",
				"libraryCatalog": "Wikipedia",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "Zotero",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"encyclopediaTitle": "Wikipedia, the free encyclopedia",
				"url": "http://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
				"extra": "Page Version ID: 485342619",
				"language": "en",
				"abstractNote": "Zotero ( /zoʊˈtɛroʊ/) is free, open source reference management software to manage bibliographic data and related research materials (such as PDFs). Notable features include web browser integration, online syncing, generation of in-text citations, footnotes and bibliographies, as well as integration with the word processors Microsoft Word, LibreOffice, OpenOffice.org Writer and NeoOffice. It is produced by the Center for History and New Media of George Mason University (GMU).",
				"date": "2012-10-24T08:29:51Z",
				"libraryCatalog": "Wikipedia",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://en.wikipedia.org/wiki/Wikipedia:Article_wizard",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "Wikipedia:Article wizard",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"encyclopediaTitle": "Wikipedia, the free encyclopedia",
				"url": "http://en.wikipedia.org/w/index.php?title=Wikipedia:Article_wizard&oldid=521878824",
				"extra": "Page Version ID: 521878824",
				"language": "en",
				"date": "2012-11-07T20:23:45Z",
				"libraryCatalog": "Wikipedia",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Wikipedia"
			}
		]
	}
]
/** END TEST CASES **/