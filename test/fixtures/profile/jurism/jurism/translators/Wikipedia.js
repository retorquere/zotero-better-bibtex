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
	if (doc.getElementById('firstHeading')) {
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
	if (m) {
		item.encyclopediaTitle = m[1];
	} else {
		item.encyclopediaTitle = 'Wikipedia, the free encyclopedia';
	}

	item.url = ZU.xpathText(doc, '//li[@id="t-permalink"]/a/@href');
	var revID;
	if (item.url) {
		revID = item.url.match(/[&?]oldid=(\d+)/)[1];
		item.extra = 'Page Version ID: ' + revID;
		item.url = doc.location.protocol + '//' + doc.location.hostname
					+ item.url;
	} else {
		item.url = url;
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
		if (retObj && !retObj.query.pages['-1']) {
			var pages = retObj.query.pages;
			for (var i in pages) {
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
		"url": "https://ru.wikipedia.org/w/index.php?title=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F&oldid=43336101",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Россия",
				"creators": [],
				"date": "2012-04-06T20:11:32Z",
				"abstractNote": "Росси́я (от греч. Ρωσία — Русь; официально также Росси́йская Федера́ция, на практике используется и аббревиатура РФ) — государство в Восточной Европе и Северной Азии. Население — 146 804 372 чел. (2017). Территория России, определяемая её Конституцией, составляет 17 125 191 км². Занимает первое место в мире по территории, шестое — по объёму ВВП по ППС и девятое — по численности населения.\nСтолица — Москва. Государственный язык — русский.\nСмешанная республика федеративного устройства. В мае 2012 года пост президента занял Владимир Владимирович Путин, председателя правительства — Дмитрий Анатольевич Медведев.\nВ состав Российской Федерации входят 85 субъектов, 46 из которых именуются областями, 22 — республиками, 9 — краями, 3 — городами федерального значения, 4 — автономными округами и 1 — автономной областью.\nРоссия граничит с восемнадцатью государствами (самый большой показатель в мире), включая два частично признанных и два непризнанных:\nпо суше — с Норвегией, Финляндией, Эстонией, Латвией, Литвой, Польшей, Белоруссией, Украиной, Грузией, Азербайджаном, Казахстаном, Монголией, КНР, КНДР, Южной Осетией, Абхазией, ЛНР, ДНР;\nпо морю — с Японией и США.\nРоссия — многонациональное государство, отличающееся большим этнокультурным многообразием. Бо́льшая часть (около 75 %) населения относит себя к православию, что делает Россию страной с самым многочисленным православным населением в мире.\nРоссия — одна из ведущих космических держав мира: мировой лидер по количеству запусков космических аппаратов, экспортёр ракетных двигателей, имеет самый большой в мире радиотелескоп, а также крупнейший в мире космический радиотелескоп, в России создана одна из двух существующих в мире глобальных систем спутниковой навигации; входит в десятку мировых лидеров по ядерной энергетике, экспортёр ядерных реакторов и сопутствующих систем, крупнейший экспортёр топлива для атомной промышленности, обладает уникальными технологиями переработки отработавшего ядерного топлива; один из крупнейших мировых производителей и экспортёров программного обеспечения и информационных технологий, входит в десятку мировых лидеров по количеству эксплуатируемых суперкомпьютеров (2014); входит в шестёрку мировых лидеров по количеству патентов на инновационные технологии (2017); имеет крупнейший в мире ледокольный флот и единственный в мире атомный ледокольный флот; входит в пятёрку мировых лидеров по производству сельхозтехники, мировой лидер по производству титана для высокотехнологичной продукции, мировой лидер по производству морских навигационных систем и электронных карт, мировой лидер в сфере кораблестроения судов на подводных крыльях, воздушной подушке и экранопланов;мировой лидер в строительстве гиперзвуковых авиационных систем; мировой лидер в производстве аммиака; второе место в мире по производству азотно-калийных минеральных удобрений;; первое место в мире по добыче и экспорту алмазов (2013) и платины; первое место в мире по экспорту стали (2013); второе место в мире по добыче нефти (2015) и газа (2014); первое место в мире по экспорту зерна (2016); входит в пятерку мировых лидеров по протяженности железных дорог, первое место в мире по протяжённости электрифицированных железных дорог; входит в пятерку мировых лидеров по производству электроэнергии; является одним из мировых лидеров в разработке установок для термоядерной энергетики, занимает второе место в мире (после США) по экспорту вооружений, обладает вторым в мире арсеналом ядерного оружия, входит в число стран с наиболее богатым культурным наследием и обладает самым большим запасом природных ресурсов на Земле. Россия занимает седьмое место в мире по объёмам золотовалютных резервов и седьмое место в мире по официально заявленным запасам золота в резервах. Постоянный член Совета безопасности ООН с правом вето. Является одной из современных великих держав мира.\nПосле распада СССР в конце 1991 года Российская Федерация была признана международным сообществом как государство-продолжатель СССР в вопросах ядерного потенциала, внешнего долга, государственной собственности за рубежом, а также членства в Совете Безопасности ООН. Россия состоит в ряде международных организаций — ООН, ОБСЕ, Совет Европы, ЕАЭС, СНГ, ОЧЭС, ОДКБ, ГКМЧП, ВОИС, ММО, ВТО, ЮНВТО, ВФП, ШОС, АТЭС, БРИКС, КООМЕТ, МОК, МЭК, ISO, EUREKA, IRENA, G20 и других.\nПо данным Всемирного банка, объём ВВП по ППС за 2014 год составил 3,745 трлн долларов (25 636 долларов на человека). Денежная единица — российский рубль (усреднённый курс за 2016 год — 67 рублей за 1 доллар США).",
				"encyclopediaTitle": "Википедия",
				"extra": "Page Version ID: 43336101",
				"language": "ru",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://ru.wikipedia.org/w/index.php?title=%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F&oldid=43336101",
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
		"url": "https://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Zotero",
				"creators": [],
				"date": "2012-04-03T14:41:27Z",
				"abstractNote": "Zotero /zoʊˈtɛroʊ/ is free and open-source reference management software to manage bibliographic data and related research materials (such as PDF files). Notable features include web browser integration, online syncing, generation of in-text citations, footnotes and bibliographies, as well as integration with the word processors Microsoft Word, LibreOffice, OpenOffice.org Writer and NeoOffice. It is produced by the Center for History and New Media at George Mason University.",
				"encyclopediaTitle": "Wikipedia",
				"extra": "Page Version ID: 485342619",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://en.wikipedia.org/w/index.php?title=Zotero&oldid=485342619",
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
		"url": "https://en.wikipedia.org/wiki/Wikipedia:Article_wizard",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Wikipedia:Article wizard",
				"creators": [],
				"date": "2016-10-24T18:43:24Z",
				"encyclopediaTitle": "Wikipedia",
				"extra": "Page Version ID: 746008393",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"shortTitle": "Wikipedia",
				"url": "https://en.wikipedia.org/w/index.php?title=Wikipedia:Article_wizard&oldid=746008393",
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
];
/** END TEST CASES **/
