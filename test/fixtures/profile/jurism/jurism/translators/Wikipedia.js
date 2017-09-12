{
	"translatorID": "e5dc9733-f8fc-4c00-8c40-e53e0bb14664",
	"label": "Wikipedia",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*wikipedia\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-02-16 04:51:10"
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
	if(doc.getElementById('firstHeading')) {
		return 'encyclopediaArticle';
	}
}

function doWeb(doc, url) {
	var item = new Zotero.Item('encyclopediaArticle');
	item.title = ZU.trimInternal(doc.getElementById('firstHeading').textContent);
	
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
	var revID;
	if(item.url) {
		revID = item.url.match(/[&?]oldid=(\d+)/)[1];
		item.extra = 'Page Version ID: ' + revID;
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
	
	//last modified date is hard to get from the page because it is localized
	var pageInfoURL = '/w/api.php?action=query&format=json'
		+ '&inprop=url%7Cdisplaytitle'
		+ '&exintro=true&explaintext=true' // Intro section in plain text
		+ '&prop=info%7Cextracts'
		+ (revID // Different if we want a specific revision (this should be the general case)
			? '%7Crevisions&rvprop=timestamp&revids=' + encodeURIComponent(revID)
			: '&titles=' + encodeURIComponent(item.title)
		);
	ZU.doGet(pageInfoURL, function(text) {
		var retObj = JSON.parse(text);
		if(retObj && !retObj.query.pages['-1']) {
			var pages = retObj.query.pages;
			for(var i in pages) {
				if (pages[i].revisions) {
					item.date = pages[i].revisions[0].timestamp;
				} else {
					item.date = pages[i].touched;
				}
				
				item.title = pages[i].displaytitle;
				
				// Note that this is the abstract for the latest revision,
				// not necessarily the revision that is being queried
				item.abstractNote = pages[i].extract;
				
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
				"title": "Россия",
				"creators": [],
				"date": "2012-04-06T20:11:32Z",
				"abstractNote": "Росси́я (от греч. Ρωσία — Русь; официально Росси́йская Федера́ция или Росси́я, на практике используется также сокращение РФ) — государство в Восточной Европе и Северной Азии. Население — 146 270 033 чел. (2015), территория — 17 125 187 км². Занимает первое место в мире по территории и девятое место по численности населения.\nСтолица — Москва. Государственный язык — русский.\nСмешанная республика федеративного устройства. В мае 2012 года пост президента занял Владимир Путин, председателя правительства — Дмитрий Медведев.\nВ составе Российской Федерации находятся 85 субъектов, 46 из которых именуются областями, 22 — республиками, 9 — краями, 3 — городами федерального значения, 4 — автономными округами и 1 — автономной областью.\nРоссия граничит с девятнадцатью странами (самый большой показатель в мире), включая две частично признанных, из них по суше со следующими государствами: Норвегией, Финляндией, Эстонией, Латвией, Литвой, Польшей, Белоруссией, Украиной, Абхазией, Грузией, Южной Осетией, Азербайджаном, Казахстаном, КНР, КНДР, Монголией, по морю с Турцией, Японией и США.\nОтличается значительным этнокультурным разнообразием. Бо́льшая часть (около 75 %) населения относит себя к православию, что делает Россию страной с самым многочисленным православным населением в мире.\nПо данным Всемирного банка, объём ВВП по ППС за 2014 год составил $3,461 трлн ($24,120 на человека). Денежная единица — российский рубль (усреднённый курс за 2014 год — 36 рублей за 1 доллар США).\nЯвляется великой державой и энергетической сверхдержавой — кандидатом-сверхдержавой, постоянный член Совета безопасности ООН. Одна из ведущих космических держав мира, обладает ядерным оружием и средствами его «доставки».\nПосле распада СССР в конце 1991 года Российская Федерация была признана международным сообществом как государство-продолжатель СССР в вопросах ядерного потенциала СССР, внешнего долга СССР, собственности СССР за рубежом, а также членства в Совете Безопасности ООН. Россия состоит в ряде международных организаций — ООН, ОБСЕ, Совет Европы, ЕАЭС, СНГ, ОЧЭС, ОДКБ, ВТО, ВФП, ЦАС, ШОС, АТЭС, БРИКС, МОК, ISO и других.",
				"encyclopediaTitle": "Википедия",
				"extra": "Page Version ID: 43336101",
				"language": "ru",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "http://ru.wikipedia.org/w/index.php?title=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F&oldid=43336101",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Zotero",
				"creators": [],
				"date": "2012-04-03T14:41:27Z",
				"abstractNote": "Zotero /zoʊˈtɛroʊ/ is free and open-source reference management software to manage bibliographic data and related research materials (such as PDF files). Notable features include web browser integration, online syncing, generation of in-text citations, footnotes and bibliographies, as well as integration with the word processors Microsoft Word, LibreOffice, OpenOffice.org Writer and NeoOffice. It is produced by the Center for History and New Media of George Mason University (GMU).",
				"encyclopediaTitle": "Wikipedia, the free encyclopedia",
				"extra": "Page Version ID: 485342619",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "http://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://en.wikipedia.org/wiki/Wikipedia:Article_wizard",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Wikipedia:Article wizard",
				"creators": [],
				"date": "2015-02-10T10:51:06Z",
				"encyclopediaTitle": "Wikipedia, the free encyclopedia",
				"extra": "Page Version ID: 646481896",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"shortTitle": "Wikipedia",
				"url": "http://en.wikipedia.org/w/index.php?title=Wikipedia:Article_wizard&oldid=646481896",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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