{
	"translatorID": "587709d3-80c5-467d-9fc8-ed41c31e20cf",
	"label": "eLibrary.ru",
	"creator": "Avram Lyon",
	"target": "^https?://elibrary\\.ru/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-10-19 17:28:01"
}

/*
	***** BEGIN LICENSE BLOCK *****

	eLibrary.ru Translator
	Copyright © 2010-2011 Avram Lyon, ajlyon@gmail.com

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
	if (url.match(/\/item.asp/)) {
		return getDocType(doc);
	}
	else if (url.match(/\/(query_results|contents|org_items|itembox_items)\.asp/)) {
		return "multiple";
	}
	return false;
}

function doWeb(doc, url) {
	var articles = [];
	if (detectWeb(doc, url) == "multiple") {
		var results = ZU.xpath(doc, '//table[@id="restab"]/tbody/tr[starts-with(@id, "arw")]/td[2]');
		// Zotero.debug('results.length: ' + results.length);
		var items = {};
		for (let i = 0; i < results.length; i++) {
			// Zotero.debug('result [' + i + '] text: ' + results[i].textContent);
			var title = ZU.xpathText(results[i], './a');
			var uri = ZU.xpathText(results[i], ' ./a/@href');
			if (!title || !uri) continue;
			items[uri] = fixCasing(title);
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return;
			}
			for (let i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function fixCasing(string) {
	if (string && string == string.toUpperCase()) {
		return ZU.capitalizeTitle(string, true);
	}
	else return string;
}

function getDocType(doc) {
	var docType = ZU.xpathText(doc, '//tr/td/text()[contains(., "Тип:")]/following-sibling::*[1]');
	var itemType;
	
	switch (docType) {
		case "обзорная статья":
		case "статья в журнале - научная статья":
		case "научная статья":
		case "статья в журнале":
		case "статья в открытом архиве":
			itemType = "journalArticle";
			break;
		case "статья в сборнике трудов конференции":
			itemType = "conferencePaper";
			break;
		case "учебное пособие":
		case "монография":
			itemType = "book";
			break;
		case "публикация в сборнике трудов конференции":
			itemType = "conferencePaper";
			break;
		default:
			Zotero.debug("Unknown type: " + docType + ". Using 'journalArticle'");
			itemType = "journalArticle";
			break;
	}
	return itemType;
}

function scrape(doc, url) {
	var item = new Zotero.Item();
	item.itemType = getDocType(doc);
	item.title = fixCasing(doc.title);
	item.url = url;
	
	var rightPart = doc.getElementById("leftcol").nextSibling;
	var centralColumn = ZU.xpath(rightPart, './table/tbody/tr[2]/td[@align="left"]');
	var datablock = ZU.xpath(centralColumn, './div[1]');
	
	var authors = ZU.xpath(datablock, './/table[1]//b');
	// Zotero.debug('authors.length: ' + authors.length);
	
	for (let i = 0; i < authors.length; i++) {
		var dirty = authors[i].textContent;
		// Zotero.debug('author[' + i + '] text: ' + dirty);
		
		/* Common author field formats are:
			(1) "LAST FIRST PATRONIMIC"
			(2) "LAST F. P." || "LAST F.P." || "LAST F.P" || "LAST F."
			
		   In all these cases, we put comma after LAST for `ZU.cleanAuthor()` to work.
		   Other formats are rare, but possible, e.g. "ВАН ДЕ КЕРЧОВЕ Р." == "Van de Kerchove R.".
		   They go to single-field mode (assuming they got no comma). */
		var nameFormat1RE = new ZU.XRegExp("^\\p{Letter}+\\s\\p{Letter}+\\s\\p{Letter}+$");
		var nameFormat2RE = new ZU.XRegExp("^\\p{Letter}+\\s\\p{Letter}\\.(\\s?\\p{Letter}\\.?)?$");
		
		var isFormat1 = ZU.XRegExp.test(dirty, nameFormat1RE);
		var isFormat2 = ZU.XRegExp.test(dirty, nameFormat2RE);
		
		if (isFormat1 || isFormat2) {
			// add comma before the first space
			dirty = dirty.replace(/^([^\s]*)(\s)/, '$1, ');
		}
		
		var cleaned = ZU.cleanAuthor(dirty, "author", true);
		
		/* Now `cleaned.firstName` is:
			(1) "FIRST PATRONIMIC"
			(2) "F. P." || "F."
			
		   The `fixCasing()` makes 2nd letter lowercase sometimes,
		   for example, "S. V." -> "S. v.", but "S. K." -> "S. K.".
		   Thus, we can only apply it to Format1 . */
		
		if (isFormat1) {
			// "FIRST PATRONIMIC" -> "First Patronimic"
			cleaned.firstName = fixCasing(cleaned.firstName);
		}
		
		if (cleaned.firstName === undefined) {
			// Unable to parse. Restore punctuation.
			cleaned.fieldMode = true;
			cleaned.lastName = dirty;
		}
		
		cleaned.lastName = fixCasing(cleaned.lastName, true);
		
		// Skip entries with an @ sign-- email addresses slip in otherwise
		if (!cleaned.lastName.includes("@")) item.creators.push(cleaned);
	}

	var mapping = {
		Издательство: "publisher",
		"Дата депонирования": "date",
		"Год издания": "date",
		Год: "date",
		Том: "volume",
		Номер: "issue",
		ISSN: "ISSN",
		"Число страниц": "pages", // e.g. "83"
		Страницы: "pages", // e.g. "10-16"
		Язык: "language",
		"Место издания": "place"
	};
	
	
	for (let key in mapping) {
		var t = ZU.xpathText(datablock, './/tr/td/text()[contains(., "' + key + ':")]/following-sibling::*[1]');
		if (t) {
			item[mapping[key]] = t;
		}
	}
	
	/*
	// Times-cited in Russian-Science-Citation-Index.
	// This value is hardly useful for most users, would just clutter "extra" field.
	// Keeping this code just-in-case.
	var rsci = ZU.xpathText(doc, '//tr/td/text()[contains(., "Цитирований в РИНЦ")]/following-sibling::*[2]');
	Zotero.debug("Russian Science Citation Index: " + rsci);
	if (rsci) item.extra = "Цитируемость в РИНЦ: " + rsci;
	*/

	var journalBlock = ZU.xpath(datablock, './table/tbody[tr[1]/td/font[contains(text(), "ЖУРНАЛ:")]]/tr[2]/td[2]');
	if (!item.publicationTitle) item.publicationTitle = ZU.xpathText(journalBlock, ".//a[1]");
	item.publicationTitle = fixCasing(item.publicationTitle);

	var tags = ZU.xpath(datablock, './table[tbody/tr/td/font[contains(text(), "КЛЮЧЕВЫЕ СЛОВА:")]]//tr[2]/td/a');
	for (let j = 0; j < tags.length; j++) {
		item.tags.push(fixCasing(tags[j].textContent));
	}

	item.abstractNote = ZU.xpathText(datablock, './table/tbody/tr[td/font[text() = "АННОТАЦИЯ:"]]/following-sibling::*[1]');
	
	// Language to RFC-4646 code
	switch (item.language) {
		case "русский":
			item.language = "ru";
			break;
		case "английский":
			item.language = "en";
			break;
		default:
			Zotero.debug("Unknown language: " + item.language + " - keeping as-is.");
			break;
	}

	item.DOI = ZU.xpathText(doc, '/html/head/meta[@name="doi"]/@content');
	
	/* var pdf = false;
	// Now see if we have a free PDF to download
	var pdfImage = doc.evaluate('//a/img[@src="/images/pdf_green.gif"]', doc, null,XPathResult.ANY_TYPE, null).iterateNext();
	if (pdfImage) {
		// A green PDF is a free one. We need to construct the POST request
		var postData = [], postField;
		var postNode = doc.evaluate('//form[@name="results"]/input', doc, null,XPathResult.ANY_TYPE, null);
		while ((postField = postNode.iterateNext()) !== null) {
			postData.push(postField.name + "=" +postField.value);
		}
		postData = postData.join("&");
		Zotero.debug(postData + postNode.iterateNext());
		Zotero.Utilities.HTTP.doPost('http://elibrary.ru/full_text.asp', postData, function(text) {
			var href = text.match(/http:\/\/elibrary.ru\/download\/.*?\.pdf/)[0];
			pdf = {url:href, title:"eLibrary.ru полный текст", mimeType:"application/pdf"};
		});
	}*/

	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://elibrary.ru/org_items.asp?orgsid=3326",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=9541154",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Иноязычные заимствования в художественной прозе на иврите в XX в",
				"creators": [
					{
						"firstName": "М. В.",
						"lastName": "Свет",
						"creatorType": "author"
					}
				],
				"date": "2007",
				"ISSN": "0320-8095",
				"issue": "1",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"pages": "40-58",
				"publicationTitle": "Вестник Московского Университета. Серия 13: Востоковедение",
				"url": "https://elibrary.ru/item.asp?id=9541154",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=17339044",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Использование Молекулярно-Генетических Методов Установления Закономерностей Наследования Для Выявления Доноров Значимых Признаков Яблони",
				"creators": [
					{
						"firstName": "Иван Иванович",
						"lastName": "Супрун",
						"creatorType": "author"
					},
					{
						"firstName": "Елена Владимировна",
						"lastName": "Ульяновская",
						"creatorType": "author"
					},
					{
						"firstName": "Евгений Николаевич",
						"lastName": "Седов",
						"creatorType": "author"
					},
					{
						"firstName": "Галина Алексеевна",
						"lastName": "Седышева",
						"creatorType": "author"
					},
					{
						"firstName": "Зоя Михайловна",
						"lastName": "Серова",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISSN": "2219-5335",
				"abstractNote": "На основе полученных новых знаний по формированию и проявлению ценных селекционных признаков выделены новые доноры и комплексные доноры значимых признаков яблони.",
				"issue": "13 (1)",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"pages": "1-10",
				"publicationTitle": "Плодоводство И Виноградарство Юга России",
				"url": "https://elibrary.ru/item.asp?id=17339044",
				"attachments": [],
				"tags": [
					{
						"tag": "Apple-Tree"
					},
					{
						"tag": "Immunity"
					},
					{
						"tag": "Scab"
					},
					{
						"tag": "Variety"
					},
					{
						"tag": "Иммунитет"
					},
					{
						"tag": "Парша"
					},
					{
						"tag": "Сорт"
					},
					{
						"tag": "Яблоня"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=21640363",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "На пути к верификации C программ. Часть 3. Перевод из языка C-light в язык C-light-kernel и его формальное обоснование",
				"creators": [
					{
						"firstName": "В. А.",
						"lastName": "Непомнящий",
						"creatorType": "author"
					},
					{
						"firstName": "И. С.",
						"lastName": "Ануреев",
						"creatorType": "author"
					},
					{
						"firstName": "И. Н.",
						"lastName": "Михайлов",
						"creatorType": "author"
					},
					{
						"firstName": "А. В.",
						"lastName": "Промский",
						"creatorType": "author"
					}
				],
				"date": "14.06.2002",
				"abstractNote": "Описаны правила перевода из языка C-light в язык C-light-kernel, являющиеся основой двухуровневой схемы верификации C-программ. Для языка C-light предложена модифицированная операционная семантика. Модификация позволяет упростить как описание семантики сложных конструкций языка C-light, так и доказательство непротиворечивости аксиоматической семантики языка C-light-kernel. Определено понятие семантического расширения и проведено формальное обоснование корректности перевода. Предполагается реализовать правила перевода в системе верификации программ.",
				"issue": "097",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"pages": "83",
				"url": "https://elibrary.ru/item.asp?id=21640363",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=21665052",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Информационно-поисковая полнотекстовая система \"Боярские списки XVIII века\"",
				"creators": [
					{
						"firstName": "А. В.",
						"lastName": "Захаров",
						"creatorType": "author"
					}
				],
				"date": "08.04.2005",
				"abstractNote": "В полнотекстовой электронной публикации (со статусом препринта), основанной по технологии реляционных баз данных, представлены боярские списки из коллекции документов Российского государственного архива древних актов и научной библиотеки Казанского федерального университета. Публикуемые документы составлялись Разрядным приказом и Сенатом для пофамильного учета думных и московских чинов (\"царедворцев\"). Ключевая археографическая проблема проектирования базы данных состоит в максимально адекватном отображении структуры и текстовых данных источника с возможностью поиска информации по нескольким параметрам. База данных \"Боярские списки XVIII века\" доступна в сети Интернет с 2003 г. Зарегистрирована ФГУП \"Информрегистр\" в 2005 г. Сфера применения: исследования по генеалогии, биографике, археографии, история России, преподавание исторической информатики. К настоящему времени в базе данных размещены полные тексты 14 боярских и чиновных списков 1700-1721 гг.",
				"issue": "0220510249",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"url": "https://elibrary.ru/item.asp?id=21665052",
				"attachments": [],
				"tags": [
					{
						"tag": "Археография"
					},
					{
						"tag": "Боярские Списки"
					},
					{
						"tag": "Информационная Система"
					},
					{
						"tag": "Источниковедение"
					},
					{
						"tag": "Московские Чины"
					},
					{
						"tag": "Петр I"
					},
					{
						"tag": "Полнотекстовая База Данных"
					},
					{
						"tag": "Разрядный Приказ"
					},
					{
						"tag": "Царедворцы"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=20028198",
		"items": [
			{
				"itemType": "book",
				"title": "Аппарат издания и правила оформления",
				"creators": [
					{
						"firstName": "Людмила Павловна",
						"lastName": "Стычишина",
						"creatorType": "author"
					},
					{
						"firstName": "А. В.",
						"lastName": "Хохлов",
						"creatorType": "author"
					}
				],
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"publisher": "Изд-во Политехнического университета",
				"url": "https://elibrary.ru/item.asp?id=20028198",
				"attachments": [],
				"tags": [
					{
						"tag": "Аппарат Издания"
					},
					{
						"tag": "Издательское Дело"
					},
					{
						"tag": "Культура. Наука. Просвещение"
					},
					{
						"tag": "Оформление Изданий"
					},
					{
						"tag": "Оформление Книги"
					},
					{
						"tag": "Печать"
					},
					{
						"tag": "Подготовка Рукописи И Графических Материалов К Изданию"
					},
					{
						"tag": "Редакционно-Издательский Процесс"
					},
					{
						"tag": "Российская Федерация"
					},
					{
						"tag": "Теория И Практика Издательского Дела"
					},
					{
						"tag": "Техническое Оформление"
					},
					{
						"tag": "Учебное Пособие Для Высшей Школы"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=38164350",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Графики негладких контактных отображений на группах карно с сублоренцевой структурой",
				"creators": [
					{
						"firstName": "М. Б.",
						"lastName": "Карманова",
						"creatorType": "author"
					}
				],
				"date": "2019",
				"DOI": "10.31857/S0869-56524863275-279",
				"ISSN": "0869-5652",
				"abstractNote": "Для классов графиков -отображений нильпотентных градуированных групп доказана формула площади на сублоренцевых структурах произвольной глубины с многомерным временем.",
				"issue": "3",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"pages": "275-279",
				"publicationTitle": "Доклады Академии Наук",
				"url": "https://elibrary.ru/item.asp?id=38164350",
				"volume": "486",
				"attachments": [],
				"tags": [
					{
						"tag": "Contact Mapping"
					},
					{
						"tag": "Graph-Mapping"
					},
					{
						"tag": "Intrinsic Basis"
					},
					{
						"tag": "Multidimensional Time"
					},
					{
						"tag": "Nilpotent Graded Group"
					},
					{
						"tag": "Sub-Lorentzian Structure"
					},
					{
						"tag": "Surface Area"
					},
					{
						"tag": "Внутренний Базис"
					},
					{
						"tag": "Контактное Отображение"
					},
					{
						"tag": "Многомерное Время"
					},
					{
						"tag": "Нильпотентная Градуированная Группа"
					},
					{
						"tag": "Отображение-График"
					},
					{
						"tag": "Площадь Поверхности"
					},
					{
						"tag": "Сублоренцева Структура"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=30694319",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Intellectual Differentiation in the Structure of Students' Civil Identity",
				"creators": [
					{
						"firstName": "M. K.",
						"lastName": "Akimova",
						"creatorType": "author"
					},
					{
						"firstName": "E. I.",
						"lastName": "Gorbacheva",
						"creatorType": "author"
					},
					{
						"firstName": "S. V.",
						"lastName": "Persiyantseva",
						"creatorType": "author"
					},
					{
						"firstName": "S. V.",
						"lastName": "Yaroshevskaya",
						"creatorType": "author"
					}
				],
				"date": "2017",
				"DOI": "10.15405/epsbs.2017.12.1",
				"language": "en",
				"libraryCatalog": "eLibrary.ru",
				"pages": "1-7",
				"url": "https://elibrary.ru/item.asp?id=30694319",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elibrary.ru/item.asp?id=18310800",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Обзор И Инвентаризация Археологических Раскопок В Долине Каракол (парк Уч-Энмек). Доклад Бельгийско-Российской Экспедиции В Алтайские Горы (2007-2008)",
				"creators": [
					{
						"firstName": "Й.",
						"lastName": "Боургеоис",
						"creatorType": "author"
					},
					{
						"firstName": "Щ.",
						"lastName": "Гхеыле",
						"creatorType": "author"
					},
					{
						"firstName": "Р.",
						"lastName": "Гооссенс",
						"creatorType": "author"
					},
					{
						"lastName": "Де Щулф А.",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "Е.",
						"lastName": "Дворников",
						"creatorType": "author"
					},
					{
						"firstName": "А. В.",
						"lastName": "Ебел",
						"creatorType": "author"
					},
					{
						"lastName": "Ван Хооф Л.",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "С.",
						"lastName": "Лоуте",
						"creatorType": "author"
					},
					{
						"lastName": "Де Лангхе К.",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "А.",
						"lastName": "Малмендиер",
						"creatorType": "author"
					},
					{
						"lastName": "Ван Де Керчове Р.",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "Р.",
						"lastName": "Цаппелле",
						"creatorType": "author"
					},
					{
						"lastName": "Те Киефте Д.",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2009",
				"abstractNote": "О результатах совместной бельгийско-российской археологической экспедиции в Парке Уч-Энмек (Горный Алтай) (2007-2008), занимавшейся изучением могил скифской культуры.",
				"issue": "1 (4)",
				"language": "ru",
				"libraryCatalog": "eLibrary.ru",
				"pages": "10-20",
				"publicationTitle": "Мир Евразии",
				"url": "https://elibrary.ru/item.asp?id=18310800",
				"attachments": [],
				"tags": [
					{
						"tag": "Belgian-Russian Expedition"
					},
					{
						"tag": "Karakol"
					},
					{
						"tag": "Scythian Culture"
					},
					{
						"tag": "Uch Enmek Park"
					},
					{
						"tag": "Бельгийско-Русская Экспедиция"
					},
					{
						"tag": "Каракол"
					},
					{
						"tag": "Парк Уч-Энмек"
					},
					{
						"tag": "Скифская Культура"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
