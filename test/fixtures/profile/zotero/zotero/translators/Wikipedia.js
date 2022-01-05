{
	"translatorID": "e5dc9733-f8fc-4c00-8c40-e53e0bb14664",
	"translatorType": 4,
	"label": "Wikipedia",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*wikipedia\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-01 23:20:00"
}

/**
	Copyright (c) 2021 Aurimas Vinckevicius and Abe Jellinek
	
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
	// on desktop, the article title is in #firstHeading.
	// on mobile, it's #section_0.
	if (doc.getElementById('firstHeading') || doc.getElementById('section_0')) {
		return 'encyclopediaArticle';
	}
}

function doWeb(doc, url) {
	var item = new Zotero.Item('encyclopediaArticle');
	item.title = ZU.trimInternal((doc.getElementById('firstHeading') || doc.getElementById('section_0')).textContent);
	
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

	// we don't get a permalink directly on mobile, but it goes into the
	// "retrieved from" footer
	let permalink = ZU.xpathText(doc, '//li[@id="t-permalink"]/a/@href')
		|| attr(doc, '.printfooter a', 'href');
	var revID;
	if (permalink) {
		revID = permalink.match(/[&?]oldid=(\d+)/)[1];
		item.extra = 'Page Version ID: ' + revID;
		if (permalink.startsWith('/')) {
			item.url = 'https://' + doc.location.hostname + permalink;
		}
		else {
			item.url = permalink;
		}
	}
	else {
		// if we can't find a link, just use the page URL
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

				let displayTitle = pages[i].displaytitle
					.replace(/<em>/g, '<i>')
					.replace(/<\/em>/g, '</i>')
					.replace(/<strong>/, '<b>')
					.replace(/<\/strong>/, '</b>');

				// https://www.zotero.org/support/kb/rich_text_bibliography
				item.title = filterTagsInHTML(displayTitle,
					'i, b, sub, sup, '
					+ 'span[style="font-variant:small-caps;"], '
					+ 'span[class="nocase"]');
				
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
}

function filterTagsInHTML(html, allowSelector) {
	let elem = new DOMParser().parseFromString(html, 'text/html');
	filterTags(elem.body, allowSelector);
	return elem.body.innerHTML;
}

function filterTags(root, allowSelector) {
	for (let node of root.childNodes) {
		if (!(node instanceof Element)) {
			return;
		}
		
		if (node.matches(allowSelector)) {
			filterTags(node);
		}
		else {
			while (node.firstChild) {
				let firstChild = node.firstChild;
				node.parentNode.insertBefore(firstChild, node);
				filterTags(firstChild, allowSelector);
			}
			node.remove();
		}
	}
}

/** BEGIN TEST CASES **/
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
				"abstractNote": "Росси́я или Росси́йская Федера́ция (РФ), — государство в Восточной Европе и Северной Азии. Территория России в её конституционных границах составляет 17 125 191 км²; население страны (в пределах её заявленной территории) составляет 146 171 015 чел. (2021). Занимает первое место в мире по территории, шестое — по объёму ВВП по ППС, и девятое — по численности населения.\nСтолица — Москва. Государственный язык — русский. Денежная единица — российский рубль.\nГосударственный строй — президентско-парламентская республика с федеративным устройством. С 31 декабря 1999 года (с перерывом в 2008—2012 годах, когда Дмитрий Медведев был президентом) должность президента Российской Федерации занимает Владимир Путин. C 16 января 2020 года должность председателя Правительства РФ занимает Михаил Мишустин.\nРоссия имеет 18 границ (16 сухопутных и 2 морских). В состав Российской Федерации входят 85 субъектов, 46 из которых именуются областями, 22 — республиками, 9 — краями, 3 — городами федерального значения, 4 — автономными округами и 1 — автономной областью. Всего в стране около 157 тысяч населённых пунктов. Россия является самой холодной страной в мире: 65 % её территории покрыты вечной мерзлотой; в России самая низкая среднегодовая температура воздуха среди всех стран мира, составляющая −5,5 °С; в России расположены: Северный полюс холода; Санкт-Петербург — самый северный в мире город с населением более одного миллиона человек; Мурманск — крупнейший в мире город, расположенный за Северным полярным кругом, и крупнейший такой город в Европе; Норильск — крупнейший заполярный город Азии; Сабетта — крупнейшее поселение севернее 70° с. ш. Также Россия является страной с максимальным перепадом температур в мире: 116,6 °C.\nРоссия — многонациональное государство с широким этнокультурным многообразием. Бо́льшая часть населения (около 75 %) относит себя к православию, что делает Россию страной с самым многочисленным православным населением в мире.\nРоссия — ядерная держава; одна из ведущих промышленных и космических держав мира; занимает 3-е место в рейтинге самых влиятельных стран мира (2020). Русский язык — язык мирового значения, один из шести официальных и рабочих языков ООН, ЮНЕСКО и других международных организаций.\nРоссия является постоянным членом Совета Безопасности ООН с правом вето; одна из современных великих держав мира. Также Россия состоит в ряде международных организаций: ООН, G20, ОБСЕ, Совете Европы, ЕАЭС, СНГ, ОДКБ, ВТО, ШОС, АТЭС, БРИКС, МОК и других.\nПосле распада СССР в конце 1991 года Российская Федерация была признана международным сообществом как государство-правопреемник СССР в вопросах ядерного потенциала, внешнего долга, государственной собственности за рубежом, а также членства в Совете Безопасности ООН.\nПо данным МВФ, объём ВВП по номиналу за 2019 год составил 1,7 трлн долларов (11 585 долларов на человека, 61-е место в мире). Объём ВВП по ППС за 2019 год составил 4,39 трлн долларов (29 181 долларов на человека, 50-е место в мире).",
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
				"abstractNote": "Zotero  is a free and open-source reference management software to manage bibliographic data and related research materials (such as PDF files). Notable features include web browser integration, online syncing, generation of in-text citations, footnotes, and bibliographies, as well as integration with the word processors Microsoft Word, LibreOffice Writer, and Google Docs. It is produced by the Center for History and New Media at George Mason University.",
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
				"date": "2020-11-06T04:29:05Z",
				"encyclopediaTitle": "Wikipedia",
				"extra": "Page Version ID: 987303078",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"shortTitle": "Wikipedia",
				"url": "https://en.wikipedia.org/w/index.php?title=Wikipedia:Article_wizard&oldid=987303078",
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
		"url": "https://en.m.wikipedia.org/w/index.php?title=1%25_rule_(Internet_culture)&oldid=999756024",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "1% rule (Internet culture)",
				"creators": [],
				"date": "2021-01-11T20:19:42Z",
				"abstractNote": "In Internet culture, the 1% rule is a rule of thumb pertaining to participation in an internet community, stating that only 1% of the users of a website add content, while the other 99% of the participants only lurk. Variants include the 1–9–90 rule (sometimes 90–9–1 principle or the 89:10:1 ratio), which states that in a collaborative website such as a wiki, 90% of the participants of a community only consume content, 9% of the participants change or update content, and 1% of the participants add content. This also applies, approximately, to Wikipedia.Similar rules are known in information science; for instance, the 80/20 rule known as the Pareto principle states that 20 percent of a group will produce 80 percent of the activity, however the activity is defined.",
				"encyclopediaTitle": "Wikipedia",
				"extra": "Page Version ID: 999756024",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://en.wikipedia.org/w/index.php?title=1%25_rule_(Internet_culture)&oldid=999756024",
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
		"url": "https://en.wikipedia.org/w/index.php?title=List_of_Sex_and_the_City_episodes&oldid=964829978",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "List of <i>Sex and the City</i> episodes",
				"creators": [],
				"date": "2020-06-27T20:48:06Z",
				"abstractNote": "The following is a list of episodes from the American television series Sex and the City.",
				"encyclopediaTitle": "Wikipedia",
				"extra": "Page Version ID: 964829978",
				"language": "en",
				"libraryCatalog": "Wikipedia",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://en.wikipedia.org/w/index.php?title=List_of_Sex_and_the_City_episodes&oldid=964829978",
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
