{
	"translatorID": "4883f662-29df-44ad-959e-27c9d036d165",
	"label": "FAO Publications",
	"creator": "Bin Liu <lieubean@gmail.com>",
	"target": "^https?://www\\.fao\\.org/documents|publications/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-21 10:14:37"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2017 Bin Liu
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
	//Just differentiate single and multiple. Correct itemType (either book or conferencePaper) will be determined in scrape().
	if (url.indexOf('card') !== -1) {
		return 'book';
	} 
	/* Multiples currently don't load properly
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	*/
}

function cleanMeta(str) {
	//clean meta fields obtained from page
	if (str.includes(';') === false) {
		return str.slice(str.indexOf(':')+2);
	} else {
		var strArray = str.slice(str.indexOf(':')+2).split(';');
		strArray.pop(); //removes empty element after the last ';'
		return strArray;
	}
}

function scrape(doc, url) {
	var newItem = new Z.Item();

	if (url.indexOf('card') !== -1) {
		
		//attach document card URL and snapshot
		newItem.attachments.push({
			url: url,
			title: 'FAO Document Record Snapshot',
			mimeType: 'text/html',
			snapshot: true
		});

		//********** Begin fixed-location variables **********

		//Some variables always appear and appear at the same location in all document pages.
		
		//abstract
		var abs = doc.getElementById("mainContentN1");
		// The childrens of `abs` are the label "Abstract:" in a strong-tag,
		// the abstract in several p-tags or text nodes directly, and possibly
		// a note about other languages which begins also with a strong-tag.
		if (abs) {
			var children = abs.childNodes;
			var abstractFound = false;
			for (let child of children) {
				if (child.tagName == "STRONG" || (child.nodeType == 1 && ZU.xpathText(child, './/strong'))) {
					if (abstractFound) {
						break;// stop when another strong tag is found
					} else {
						abstractFound = true;
						continue;// exclude the label "Abstract"
					}
				}
				if (newItem.abstractNote) {
					if (newItem.abstractNote.slice(-1) !== "\n") {
						newItem.abstractNote += "\n\n";
					}
					newItem.abstractNote += child.textContent;
				} else {
					newItem.abstractNote = child.textContent;
				}
			}
		}
		//attach PDF
		var pdfUrl = ZU.xpath(doc, '//*[@id="mainRightN1"]/div[2]/a')[0].href;
		newItem.attachments.push({
			url: pdfUrl,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
		//url: remove 'http://' from pdfUrl
		newItem.url = pdfUrl.slice(pdfUrl.indexOf('www'));
		//language: according to the last one (old format) or two (new format) letters of PDF file name
		var lang_old = pdfUrl.charAt(pdfUrl.indexOf('pdf')-2);
		var lang_new = pdfUrl.slice(pdfUrl.indexOf('pdf')-3, pdfUrl.indexOf('pdf')-1);
		if ((lang_old == 'a') || (lang_new == 'AR') || (lang_new == 'ar')) {
			newItem.language = 'ar';
		} else if ((lang_old == 'c') || (lang_new == 'ZH') || (lang_new == 'zh')) {
			newItem.language = 'zh';
		} else if ((lang_old == 'e') || (lang_new == 'EN') || (lang_new == 'en')) {
			newItem.language = 'en';
		} else if ((lang_old == 'f') || (lang_new == 'FR') || (lang_new == 'fr')) {
			newItem.language = 'fr';
		} else if ((lang_old == 'r') || (lang_new == 'RU') || (lang_new == 'ru')) {
			newItem.language = 'ru';
		} else if ((lang_old == 's') || (lang_new == 'ES') || (lang_new == 'es')) {
			newItem.language = 'es';
		} else {
			newItem.language = 'other';
		}
		//title: use colon to connect main title and subtitle (if subtitle exists)
		var mainTitle = ZU.xpathText(doc, '//*[@id="headerN1"]/h1');
		var subTitle = ZU.xpathText(doc, '//h4[@class="csc-firstHeader h1"]');
		if (subTitle == null) {
			newItem.title = mainTitle;
		} else {
			if (newItem.language == 'zh') {
				newItem.title = mainTitle + '：' + subTitle;
			} else {
				newItem.title = mainTitle + ': ' + subTitle;				
			}
		}
		
		//********** End fixed-location variables **********


		//********** Begin dynamic-location variables **********

		//Variables that appear neither in all document pages nor at same positions in the pages.
		var metaText = ZU.xpath(doc, '//*[@id="mainN1"]')[0].innerText.split('\n'); //scrape text of meta area and split into an array based on line breaks.
		//get what variables are listed in the page, save to object existingMeta
		var textVariable = { //declarations for metadata names as appeared in document pages in different languages
			date: ['سنة النشر', '出版年代', 'Year of publication', 'Année de publication', 'Год издания', 'Fecha de publicación'],
			publisher: ['Publisher', 'Издательство'],
			place: ['مكان النشر', '出版地點', 'Place of publication', 'Lieu de publication', 'Место публикации', 'Lugar de publicacion'],
			pages: ['الصفحات', '页次', 'Pages', 'Страницы', 'Páginas'],
			ISBN: ['الرقم الدولي الموحد للكتاب', 'ISBN'],
			author: ['الكاتب', '作者', 'Author', 'Auteur', 'Автор', 'Autor'],
			corpAuthor: ['الشعبة', '司', 'Corporate author', 'Division', 'Отдел', 'División'],
			office: ['مكتب', '办公室', 'Office', 'Bureau', 'Oфис', 'Oficina'],
			seriesTitle: ['Serial Title'],
			seriesNumber: ['رقم المسلسل', '系列号码', 'Series number', 'Numéro de série', 'Серийный номер', 'Número de serie'],
			conference: ['اسم الاجتماع', '会议名称', 'Meeting Name', 'Nom de la réunion', 'Название мероприятия', 'Nombre de la reunión'],
			confCode: ['رمز/شفرة الاجتماع', '会议代码', 'Meeting symbol/code', 'Symbole/code de la réunion', 'Cимвол/код мероприятия', 'Código/Símbolo de la reunión'],
			session: ['Session', 'undefined', 'session'], //web page bug: in Russian page, session name is 'undefined'
			tags: ['المعجم الكلمات الموضوع', 'AGROVOC', 'Agrovoc', 'АГРОВОК']
		};
		var existingMeta = {};
		for (var i = 0; i < metaText.length; i++) {
			for (var key in textVariable) {
				for (var j = 0; j < textVariable[key].length; j++) {
					if (metaText[i].includes(textVariable[key][j])) {
						existingMeta[key] = metaText[i];
					}
				}
			}
		}

		for (var key in existingMeta) {
			var metaResult = cleanMeta(existingMeta[key]);
			
			//date
			if (key.includes('date')) {
				newItem.date = metaResult;
			}
			//publisher
			if (key.includes('publisher')) {
				newItem.publisher = metaResult;
			}
			//place
			if (key.includes('place')) {
				newItem.place = metaResult;
			}
			//number of pages
			if (key.includes('pages')) {
				newItem.numPages = metaResult.match(/\d+/)[0];
			}
			//ISBN
			if (key.includes('ISBN')) {
				newItem.ISBN = ZU.cleanISBN(metaResult, false); 
			}
			//individual author(s)
			if (key.includes('author')) {
				for (var i = 0; i < metaResult.length; i++) {
					var author = metaResult[i];
					newItem.creators.push(ZU.cleanAuthor(author, 'author', true));
				}
			}
			//corporate author: save for later conditions
			if (key.includes('corpAuthor')) {
				var corpAuthorWeb = metaResult;
			}
			if (key.includes('office')) {
				var officeWeb = metaResult;
			}
			//tag (Agrovoc)
			if (key.includes('tags')) {
				for (var i = 0; i < metaResult.length; i++) {
					newItem.tags[i] = metaResult[i].trim();
				}
			}	
			//seriesTitle
			if (key.includes('seriesTitle')) {
				newItem.series = metaResult[0];
			}
			//seriesNumber: convert first letter to upper case
			if (key.includes('seriesNumber')) {
				newItem.seriesNumber = metaResult[0].toUpperCase() + metaResult.slice(1);
			}
			//use confCode as 'Proceedings Title' in Zotero.
			if (key.includes('confCode')) {
				newItem.publicationTitle = metaResult;
			}
			//conferenceName: save for later conditions.
			if (key.includes('conference')) {
				var conferenceWeb = metaResult[0];
			}
			if (key.includes('session')) {
				var sessionWeb = metaResult;
			}
		}

		//If there's no publisher, use 'FAO' as publisher.
		if (newItem.publisher == null) {
			newItem.publisher = 'FAO';
		}
		//If there's no place, use 'Rome, Italy' as place.
		if (newItem.place == null) {
			newItem.place = 'Rome, Italy';
		}
		//Write corporate author; if no individual or corporate author, use 'FAO' as author.
		if (newItem.creators.length == 0) {
			if (corpAuthorWeb && officeWeb) {
				newItem.creators.push({lastName: corpAuthorWeb + ', ' + officeWeb, creatorType: author, fieldMode: true});
			} else if (corpAuthorWeb && !officeWeb) {
				newItem.creators.push({lastName: corpAuthorWeb, creatorType: author, fieldMode: true});
			} else if (!corpAuthorWeb && officeWeb) {
				newItem.creators.push({lastName: officeWeb, creatorType: author, fieldMode: true});
			} else {
				newItem.creators.push({lastName: 'FAO', creatorType: author, fieldMode: true});
			}
		}
		//Write conferenceName
		if (conferenceWeb && sessionWeb) {
			newItem.conferenceName = conferenceWeb + ' ' + sessionWeb;
		} else if (!sessionWeb) {
			newItem.conferenceName = conferenceWeb;
		} else {
			newItem.conferenceName = sessionWeb;
		}
		//If conference and/or session exists in document page, the itemType is 'conferencePaper'; otherwise it's 'book'. 
		if (conferenceWeb || sessionWeb) {
			newItem.itemType = 'conferencePaper';
		} else {
			newItem.itemType = 'book';
		}
		//********** End dynamic-location variables **********


	}
	newItem.complete();
}


//get items from a multiple-item page
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[@class="item-image"]');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].text);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

//Note on test cases: Because the pages use dynamic elements (which is also why the translator doesn't work for multiple item pages), automatic test in Scaffold doesn't work. Every time a test is needed, use "New Web" to manually add it./** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/zh/c/d8a82e37-695b-4eca-b6f9-53c12758eb8e/",
		"items": [
			{
				"itemType": "book",
				"title": "迁移、农业和农村发展：解决迁移的根源并利用迁移的潜力促进发展",
				"creators": [
					{
						"lastName": "FAO",
						"fieldMode": true
					}
				],
				"date": "2016",
				"abstractNote": "本文件针对的对象是成员国、联合国系统及所有其他潜在合作伙伴，阐明了农业和农村发展以及可持续自然资源管理能够在缓解农村迁移压力方面发挥作用。文件还概述了粮农组织参与国际工作、解决难民和移民全球性流动的主要切入点。粮农组织与合作伙伴合作，加大工作力度，致力于人道主义和发展环境下的迁移问题，并发挥自身在处理农业和农村发展问题方面的比较优势。\n\n其他語言版本:\n\n英語 俄语 西班牙语 法语 阿拉伯语",
				"language": "zh",
				"libraryCatalog": "FAO Publications",
				"numPages": "20",
				"place": "Rome, Italy",
				"publisher": "FAO",
				"url": "www.fao.org/3/a-i6064c.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "农业发展"
					},
					{
						"tag": "农村发展"
					},
					{
						"tag": "对于灾害和危机的适应与恢复能力"
					},
					{
						"tag": "迁徙"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/en/c/I9069EN",
		"items": [
			{
				"itemType": "book",
				"title": "Republic of Moldova Value Chain Gap Analysis",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "O'Connell",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Kiparisov",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"ISBN": "9789251304839",
				"abstractNote": "Agriculture and food industry sectors have a major importance for the Moldovan economy. The Republic of Moldova has one of the highest share of rural population among the countries in Europe and Central Asia, and its agriculture sector significantly contributes to the country’s gross domestic product.\n\nThis work is a part of a series of studies on the value chain development gaps and the environment for doing business for farmers. The goal of this study is to try to consolidate the information on countrywide value chain development gathered from various open sources and based on materials developed in a field mission by FAO officers with an emphasis on the plum and berry value chains. The authors did not aim at close examination of the selected value chains; rather, this paper is a general overview that will be a reference point for future field work in the country.\n\nTo get the results, the authors analysed the legislative history related to value chains, collected materials and statistics from open sources, conducted a field mission and interviewed stakeholders.\n\nThe first part of the report observes the overall situation in the Republic of Moldova with a focus on the agriculture sector, reviewing related legislation, the environment for doing business for farmers, and trade. The paper examines existing support measures for agriculture and covers the banking sector and trade policy. The second part examines value chain actors and overviews the selected value chains of plums and berries. The final part provides recommendations.",
				"language": "en",
				"libraryCatalog": "FAO Publications",
				"numPages": "65",
				"place": "Budapest, Hungary",
				"publisher": "FAO",
				"url": "www.fao.org/3/i9069en/I9069EN.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Republic of Moldova"
					},
					{
						"tag": "agricultural sector"
					},
					{
						"tag": "economic analysis"
					},
					{
						"tag": "economic infrastructure"
					},
					{
						"tag": "economic situation"
					},
					{
						"tag": "research"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/publications/card/en/c/4ca616af-0a4a-4232-bd3b-681b67471857/",
		"items": [
			{
				"itemType": "book",
				"title": "Save Food for a Better Climate: Converting the food loss and waste challenge into climate action",
				"creators": [
					{
						"lastName": "FAO",
						"fieldMode": true
					}
				],
				"date": "2017",
				"ISBN": "9789251099896",
				"abstractNote": "This paper aims to inform on the interrelationship between food loss and waste and climate change. In this context, the paper highlights the related impacts, and outlines the recent global frameworks adopted by the international community, and how they have been translated into national priorities and targets. Climate technology options are explored, along with the challenges and opportunities related to financing needs. Finally, this paper will identify ways and enabling factors to reduce food loss and waste as part of the collective effort to enhance ambition for climate action while simultaneously delivering the other objectives of the sustainable development agenda.",
				"language": "en",
				"libraryCatalog": "FAO Publications",
				"numPages": "38",
				"place": "Rome, Italy",
				"publisher": "FAO",
				"shortTitle": "Save Food for a Better Climate",
				"url": "www.fao.org/3/a-i8000e.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "agricultural development"
					},
					{
						"tag": "agricultural wastes"
					},
					{
						"tag": "climate change adaptation"
					},
					{
						"tag": "climate change mitigation"
					},
					{
						"tag": "climate-smart agriculture"
					},
					{
						"tag": "food wastes"
					},
					{
						"tag": "smallholders"
					},
					{
						"tag": "sustainable agriculture"
					},
					{
						"tag": "sustainable development"
					},
					{
						"tag": "waste reduction"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/publications/card/fr/c/77dbd058-8dd4-4295-af77-23f6b28cc683/",
		"items": [
			{
				"itemType": "book",
				"title": "Vivre et se nourrir de la forêt en Afrique centrale",
				"creators": [
					{
						"firstName": "O.",
						"lastName": "Ndoye",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Vantomme",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISBN": "9789252094890",
				"abstractNote": "Ce livre nous emmène au cœur des zones de forêts denses et sahéliennes de l’Afrique centrale, un écosystème précieux et essentiel à la vie quotidienne de ses habitants, représentant l’un des trois principaux ensembles boisés tropicaux de la planète. Dix pays (Burundi, Cameroun, Congo, Gabon, Guinée Equatoriale, République Centrafricaine, République Démocratique du Congo, Rwanda, Sao Tomé & Principe, Tchad) abritent ces forêts et savanes, riches d’importantes ressources naturelles. Ils ont en commun une longue histoire liée à la colonisation, suivie d'une expérience de coopération multiforme depuis les indépendances qui évolue incontestablement vers une intégration économique et monétaire. De nos jours, alors que les équilibres séculaires entre l’homme et la nature semblent ébranlés, que la sécurité alimentaire, la lutte contre la pauvreté et la préservation de la biodiversité et des ressources forestières sont devenus des enjeux mondiaux ; à l’heure où la croissance démographique non maîtrisée fragilise le maintien des écosystèmes forestiers tout en accentuant les conflits liés à la recherche d’espace vital, le phénomène des changements climatiques vient davantage sonder le génie créateur des populations forestières dans la préservation et la gestion durable de la forêt et des produits forestiers non ligneux (PFNL) qui en sont issus. Cette publication est l’œuvre du personnel technique de la FAO, avec la contribution des partenaires internationaux et locaux engagés dans l’évolution des PFNL. Elle est un document précieux consacré au développement des peuples par la promotion des PFNL en Afrique centrale en vue du renforcement de la sécurité alimentaire et la lutte contre la pauvreté.\n\nVoir aussi la sommaire en version anglais\n\nEgalement disponible en:\n\nAnglais",
				"language": "fr",
				"libraryCatalog": "FAO Publications",
				"numPages": "251",
				"place": "Rome, Italy",
				"publisher": "FAO",
				"series": "Non-wood forest products working paper",
				"seriesNumber": "No. 21",
				"url": "www.fao.org/3/a-i6399f.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Afrique centrale"
					},
					{
						"tag": "Aménagement forestier"
					},
					{
						"tag": "Burundi"
					},
					{
						"tag": "Cameroun"
					},
					{
						"tag": "Congo"
					},
					{
						"tag": "Connaissance indigène"
					},
					{
						"tag": "Conservation de la diversité biologique"
					},
					{
						"tag": "Forêt humide"
					},
					{
						"tag": "Gabon"
					},
					{
						"tag": "Gnetum"
					},
					{
						"tag": "Guinée Équatoriale"
					},
					{
						"tag": "Produit forestier non ligneux"
					},
					{
						"tag": "Ricinodendron heudelotii"
					},
					{
						"tag": "Rwanda"
					},
					{
						"tag": "République centrafricaine"
					},
					{
						"tag": "République démocratique du Congo"
					},
					{
						"tag": "Sao Tomé-et-Principe"
					},
					{
						"tag": "Tchad"
					},
					{
						"tag": "Technologie traditionnelle"
					},
					{
						"tag": "forest products derivation"
					},
					{
						"tag": "méthode traditionnelle"
					},
					{
						"tag": "sustainable forest management"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/publications/card/en/c/MW029en",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Multi-year Programme of Work (MYPOW) 2016-2019 for the FAO Regional Conference for Asia and the Pacific",
				"creators": [
					{
						"firstName": "A.",
						"lastName": "Quereshi",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"abstractNote": "This document presents again the MYPOW for 2016-2019 for APRC. A report on how FAO's regional activities have addressed regional priorities during 2016-2017, as well as priorities and recommendations of the regional technical commissions, along with the plans and priorities of partners such as the Regional Economic Organizations, civil society organizations (CSOs) and the private sector, is presented in document APRC/18/6.\n\nAlso Available in:\n\nChinese French Russian",
				"conferenceName": "FAO Regional Conference for Asia and the Pacific (APRC)",
				"language": "en",
				"libraryCatalog": "FAO Publications",
				"place": "Bangkok, Thailand",
				"proceedingsTitle": "APRC/18/8",
				"publisher": "FAO",
				"url": "www.fao.org/3/mw029en/MW029en.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Asia and the Pacific"
					},
					{
						"tag": "FAO"
					},
					{
						"tag": "Sustainable Development Goals"
					},
					{
						"tag": "agricultural development"
					},
					{
						"tag": "climate change"
					},
					{
						"tag": "development indicators"
					},
					{
						"tag": "development policies"
					},
					{
						"tag": "food safety"
					},
					{
						"tag": "food security"
					},
					{
						"tag": "human nutrition"
					},
					{
						"tag": "meetings"
					},
					{
						"tag": "smallholders"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
