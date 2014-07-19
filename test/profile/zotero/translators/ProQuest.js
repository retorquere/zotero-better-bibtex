{
	"translatorID": "fce388a6-a847-4777-87fb-6595e710b7e7",
	"translatorType": 4,
	"label": "ProQuest",
	"creator": "Avram Lyon",
	"target": "^https?://search\\.proquest\\.com.*\\/(docview|pagepdf|results|publicationissue|browseterms|browsetitles|browseresults|myresearch\\/(figtables|documents))",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-29 05:15:00"
}

/*
   ProQuest Translator
   Copyright (C) 2011 Avram Lyon, ajlyon@gmail.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var language="English";
var L={};

var followLink;

//returns an array of values for a given field or array of fields
//the values are in the same order as the field names
function getTextValue(doc, fields) {
	if(typeof(fields) != 'object') fields = [fields];

	//localize fields
	fields = fields.map(
		function(field) {
			if(fieldNames[language]) {
				return fieldNames[language][field] || field;
			} else {
				return field;
			}
		});

	var allValues = [], values;
	for(var i=0, n=fields.length; i<n; i++) {
		values = ZU.xpath(doc,
			'//div[@class="display_record_indexing_fieldname" and\
				normalize-space(text())="' + fields[i] +
			'"]/following-sibling::div[@class="display_record_indexing_data"][1]');

		if(values.length) values = [values[0].textContent];

		allValues = allValues.concat(values);
	}

	return allValues;
}

//initializes field map translations
function initLang(doc, url) {
	var lang = ZU.xpathText(doc, '//a[@id="changeLanguageLink"]/text()');
	if(lang && lang.trim() != "English") {
		lang = lang.trim();

		//if already initialized, don't need to do anything else
		if(lang == language) return;

		language = lang;

		//build reverse field map
		L = {};
		for(var i in fieldNames[language]) {
			L[fieldNames[language][i]] = i;
		}

		return;
	}

	language = 'English';
	L = {};
}

function fetchEmbeddedPdf(url, item, callback) {
	ZU.processDocuments(url, function(doc) {
		var pdfLink = ZU.xpath(doc, '//span[@class="pdfReader_link"]/a');
		var attr = 'href';

		//try to fall back to the URL of the embedded PDF
		if(!pdfLink.length) {
			Zotero.debug('PDF link not found. Falling back to embedded PDF.');
			pdfLink = ZU.xpath(doc, '//embed');
			attr = 'src';
		}

		if(!pdfLink.length) {
			Zotero.debug('Could not determine PDF url.');
			Zotero.debug('Will try to use supplied url: ' + url);
		} else {
			url = pdfLink[0][attr];
		}

		if(pdfLink.length) {
			item.attachments.push({
				title: 'Full Text PDF',
				url: url,
				mimeType: 'application/pdf'
			});
		}
	}, callback);
}

function detectWeb(doc, url) {
	initLang(doc, url);

	followLink = false;

	//Check for multiple first
	if (url.indexOf('docview') == -1 &&
		url.indexOf('pagepdf') == -1) {
		var resultitem = ZU.xpath(doc, '//a[contains(@href, "/docview/")]');
		if (resultitem.length) {
			return "multiple";
		}
	}

	var types = getTextValue(doc, ["Source type", "Document type", "Record type"]);
	var zoteroType = getItemType(types);
	if(zoteroType) return zoteroType;

	//hack for NYTs, which misses crucial data.
	var db = getTextValue(doc, "Database")[0];
	if (db && db.indexOf("The New York Times") !== -1) {
		return "newspaperArticle";
	}

	// Fall back on journalArticle-- even if we couldn't guess the type
	if(types.length) return "journalArticle";

	if (url.indexOf("/results/") === -1) {
		//we might be on a page with a link to the abstract/metadata
		//e.g. pdf view
		var abstract_link = ZU.xpath(doc, '//a[@class="formats_base_sprite format_abstract"]');
		if (abstract_link.length == 1) {
			//let the tranlator know that, instead of scraping this page,
			//we need to follow the link
			followLink = true;
			return (url.indexOf('/dissertations/') != -1)? "thesis" : "journalArticle";
		}
	}

	return false;
}

//we can pass pdfUrl to doWeb if we're coming to abstract/metadata page
//from full text pdf view
function doWeb(doc, url, pdfUrl) {
	var type = detectWeb(doc, url);
	if (type != "multiple" && !followLink) {	//see detectWeb
		scrape(doc, url, type, pdfUrl);
	} else if(type == "multiple") {
		// detect web returned multiple
		var results = ZU.xpath(doc, '//a[contains(@class,"previewTitle") or\
									contains(@class,"resultTitle")]');
		// If the above didn't get us titles, try agin with a more liberal xPath
		if (!results.length) {
			results = ZU.xpath(doc, '//a[contains(@href, "/docview/")]');
		}

		var items = new Array();
		for(var i=0, n=results.length; i<n; i++) {
			items[results[i].href] = results[i].textContent;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) return true;

			var articles = new Array();
			for (var i in items) {
				ZU.processDocuments(i,
					//call doWeb so that we rerun detectWeb to get type and
					//initialize translations
					function(doc) { doWeb(doc, doc.location.href) });
			}
		});
	//pdfUrl should be undefined unless we are calling doWeb from the following
	//block, where it is set to false or an actual value
	} else if(followLink && pdfUrl === undefined) {
		pdfUrl = false;
		var link = ZU.xpathText(doc,
			'//a[@class="formats_base_sprite format_abstract"]/@href');
		if(!link) return;

		//see if we can get the full text PDF link before we go
		//the logic here is actually slightly different from fetchEmbeddedPdf
		if(url.indexOf('fulltextPDF') != -1) {
			pdfUrl = ZU.xpath(doc, '//embed');
			if(pdfUrl.length) {
				pdfUrl = pdfUrl[0].src;
			} else {
				pdfUrl = false;
			}
		}

		ZU.processDocuments(link, function(doc) {
			doWeb(doc, doc.location.href, pdfUrl) });
	}
}

function scrape(doc, url, type, pdfUrl) {
	var item = new Zotero.Item(type);

	//get all rows
	var rows = ZU.xpath(doc, '//div[@class="display_record_indexing_row"]');

	var label, value, enLabel;
	var dates = [], place = {}, altKeywords = [];

	for(var i=0, n=rows.length; i<n; i++) {
		label = rows[i].childNodes[0];
		value = rows[i].childNodes[1];

		if(!label || !value) continue;

		label = label.textContent.trim();
		value = value.textContent.trim();	//trimInternal?

		//translate label
		enLabel = L[label] || label;

		switch(enLabel) {
			case 'Title':
				if(value == value.toUpperCase()) value = ZU.capitalizeTitle(value, true);
				item.title = value;
			break;
			case 'Author':
			case 'Editor':	//test case?
				var type = (enLabel == 'Author')? 'author' : 'editor';
				
				// Use titles of a tags if they exist, since these don't include
				// affiliations
				value = ZU.xpathText(rows[i].childNodes[1], "a/@title", null, "; ") || value;

				value = value.replace(/^by\s+/i,'')	//sometimes the authors begin with "By"
							.split(/\s*;\s*|\s+and\s+/i);

				for(var j=0, m=value.length; j<m; j++) {
					/**TODO: might have to detect proper creator type from item type*/
					item.creators.push(
						ZU.cleanAuthor(value[j], type, value[j].indexOf(',') != -1));
				}
			break;
			case 'Publication title':
				item.publicationTitle = value;
			break;
			case 'Volume':
				item.volume = value;
			break;
			case 'Issue':
				item.issue = value;
			break;
			case 'Number of pages':
				item.numPages = value;
			break;
			case 'ISSN':
				item.ISSN = value;
			break;
			case 'ISBN':
				item.ISBN = value;
			break;
			case 'DOI':	//test case?
				item.DOI = value;
			break;
			case 'Copyright':
				item.rights = value;
			break;
			case 'Language of publication':
				if(item.language) break;
			case 'Language':
				item.language = value;
			break;
			case 'Section':
				item.section = value;
			break;
			case 'Pages':
				item.pages = value;
			break;
			case 'University/institution':
			case 'School':
				item.university = value;
			break;
			case 'Degree':
				item.thesisType = value;
			break;
			case 'Publisher':
				item.publisher = value;
			break;

			case 'Identifier / keyword':
				item.tags = value.split(/\s*(?:,|;)\s*/);
			break;
			//alternative tags
			case 'Subject':
			case 'Journal subject':
			case 'Publication subject':
				altKeywords.push(value);
			break;

			//we'll figure out proper location later
			case 'University location':
			case 'School location':
				place.schoolLocation = value;
			break;
			case 'Place of publication':
				place.publicationPlace = value;
			break;
			case 'Country of publication':
				place.publicationCountry = value;
			break;
			

			//multiple dates are provided
			//more complete dates are preferred
			case 'Publication date':
				dates[2] = value;
			break;
			case 'Publication year':
				dates[1] = value;
			break;
			case 'Year':
				dates[0] = value;
			break;

			//we know about these, skip
			case 'Source type':
			case 'Document type':
			case 'Record type':
			case 'Database':
			break;

			default:
				Z.debug('Unhandled field: "' + label + '"');
		}
	}

	item.url = url;
	if (item.itemType=="thesis" && place.schoolLocation) {
		item.place = place.schoolLocation;
	}
	
	else if(place.publicationPlace) {
		item.place = place.publicationPlace;
		if(place.publicationCountry) {
			item.place = item.place + ', ' + place.publicationCountry;
		}
	} 

	item.date = dates.pop();

	//sometimes number of pages ends up in pages
	if(!item.numPages) item.numPages = item.pages;
	
	//lanuguage is sometimes given as full word and abbreviation
	if(item.language) item.language = item.language.split(/\s*;\s*/)[0];

	//parse some data from the byline in case we're missing publication title
	// or the date is not complete
	var byline = ZU.xpath(doc, '//span[contains(@class, "titleAuthorETC")][last()]');
	//add publication title if we don't already have it
	if(!item.publicationTitle
		&& ZU.fieldIsValidForType('publicationTitle', item.itemType)) {
		var pubTitle = ZU.xpathText(byline, './/a[@id="lateralSearch"]');
		//remove date range
		if(pubTitle) item.publicationTitle = pubTitle.replace(/\s*\(.+/, '');
	}

	var date = ZU.xpathText(byline, './text()');
	if(date) date = date.match(/]\s+(.+?):/);
	if(date) date = date[1];
	//add date if we only have a year and date is longer in the byline
	if(date
		&& (!item.date
			|| (item.date.length <= 4 && date.length > item.date.length))) {
		item.date = date;
	}

	item.abstractNote = ZU.xpath(doc,
		'//div[@id="abstractZone" or contains(@id,"abstractFull")]/p')
		.map(function(p) { return ZU.trimInternal(p.textContent) }).join('\n');
	

	if(!item.tags.length && altKeywords.length) {
		item.tags = altKeywords.join(',').split(/\s*(?:,|;)\s*/);
	}

	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});

	//we may already have a link to the full length PDF
	if(pdfUrl) {
		item.attachments.push({
			title: 'Full Text PDF',
			url: pdfUrl,
			mimeType: 'application/pdf'
		});
	} else {
		var pdfLink = ZU.xpath(doc, '(//div[@id="side_panel"]//\
			a[contains(@class,"format_pdf") and contains(@href,"fulltext") or contains(@href, "preview")])[last()]');
		if(pdfLink.length) {
			fetchEmbeddedPdf(pdfLink[0].href, item,
				function() { item.complete(); });
		}
	}

	if(pdfUrl || !pdfLink.length) {
		item.complete();
	}
}

function getItemType(types) {
	var guessType, govdoc, govdocType;
	for(var i=0, n=types.length; i<n; i++) {
		switch (types[i]) {
			case "Conference Papers and Proceedings":
			case "Conference Papers & Proceedings":
				return "conferencePaper";
			case "Dissertations & Theses":
			case "Dissertation/Thesis":
				return "thesis";
			case "Newspapers":
			case "Wire Feeds":
			case "WIRE FEED":
			case "Historical Newspapers":
				return "newspaperArticle";
			case "Scholarly Journals":
			case "Trade Journals":
			case "Historical Periodicals":
				return "journalArticle";
			case "Magazines":
				return "magazineArticle";
			case "Reports":
			case "REPORT":
				return "report";
			case "Blog":
			case "Article In An Electronic Resource Or Web Site":
				return "blogPost";
			case "Patent":
				return "patent";
			case "Government & Official Publications":
				govdoc = true;
			break;
			case "Blogs, Podcats, & Websites":
				guessType = "webpage";
			break;
			case "Books":
				guessType = "book";
			break;
			case "Pamphlets & Ephemeral Works":
				guessType = "document";
			break;
			case "Encyclopedias & Reference Works":
				guessType = "encyclopediaArticle";
			break;
		}

		if (types[i].indexOf("report", 0) != -1) {
			govdocType = "report"
		} else if (types[i].indexOf("statute", 0) != -1) {
			govdocType = "statute"
		}

		if(govdoc && govdocType) {
			return govdocType;
		}
	}

	return guessType;
}

//localized field names
var fieldNames = {
	'العربية': {
		"Source type":'نوع المصدر',
		"Document type":'نوع المستند',
		//"Record type"
		"Database":'قاعدة البيانات',
		"Title":'العنوان',
		"Author":'المؤلف',
		//"Editor":
		"Publication title":'عنوان المطبوعة',
		"Volume":'المجلد',
		"Issue":'الإصدار',
		"Number of pages":'عدد الصفحات',
		"ISSN":'رقم المسلسل الدولي',
		"ISBN":'الترقيم الدولي للكتاب',
		//"DOI":
		"Copyright":'حقوق النشر',
		"Language":'اللغة',
		"Language of publication":'لغة النشر',
		"Section":'القسم',
		"Publication date":'تاريخ النشر',
		"Publication year":'عام النشر',
		"Year":'العام',
		"Pages":'الصفحات',
		"School":'المدرسة',
		"Degree":'الدرجة',
		"Publisher":'الناشر',
		"Place of publication":'مكان النشر',
		"School location":'موقع المدرسة',
		"Country of publication":'بلد النشر',
		"Identifier / keyword":'معرف / كلمة أساسية',
		"Subject":'الموضوع',
		"Journal subject":'موضوع الدورية'
	},
	'Bahasa Indonesia': {
		"Source type":'Jenis sumber',
		"Document type":'Jenis dokumen',
		//"Record type"
		"Database":'Basis data',
		"Title":'Judul',
		"Author":'Pengarang',
		//"Editor":
		"Publication title":'Judul publikasi',
		"Volume":'Volume',
		"Issue":'Edisi',
		"Number of pages":'Jumlah halaman',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Hak cipta',
		"Language":'Bahasa',
		"Language of publication":'Bahasa publikasi',
		"Section":'Bagian',
		"Publication date":'Tanggal publikasi',
		"Publication year":'Tahun publikasi',
		"Year":'Tahun',
		"Pages":'Halaman',
		"School":'Sekolah',
		"Degree":'Gelar',
		"Publisher":'Penerbit',
		"Place of publication":'Tempat publikasi',
		"School location":'Lokasi sekolah',
		"Country of publication":'Negara publikasi',
		"Identifier / keyword":'Pengidentifikasi/kata kunci',
		"Subject":'Subjek',
		"Journal subject":'Subjek jurnal'
	},
	'Deutsch': {
		"Source type":'Quellentyp',
		"Document type":'Dokumententyp',
		//"Record type"
		"Database":'Datenbank',
		"Title":'Titel',
		"Author":'Autor',
		//"Editor":
		"Publication title":'Titel der Publikation',
		"Volume":'Band',
		"Issue":'Ausgabe',
		"Number of pages":'Seitenanzahl',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Sprache',
		"Language of publication":'Publikationssprache',
		"Section":'Bereich',
		"Publication date":'Publikationsdatum',
		"Publication year":'Erscheinungsjahr',
		"Year":'Jahr',
		"Pages":'Seiten',
		"School":'Bildungseinrichtung',
		"Degree":'Studienabschluss',
		"Publisher":'Herausgeber',
		"Place of publication":'Verlagsort',
		"School location":'Standort der Bildungseinrichtung',
		"Country of publication":'Publikationsland',
		"Identifier / keyword":'Identifikator/Schlüsselwort',
		"Subject":'Thema',
		"Journal subject":'Zeitschriftenthema'
	},
	'Español': {
		"Source type":'Tipo de fuente',
		"Document type":'Tipo de documento',
		//"Record type"
		"Database":'Base de datos',
		"Title":'Título',
		"Author":'Autor',
		//"Editor":
		"Publication title":'Título de publicación',
		"Volume":'Tomo',
		"Issue":'Número',
		"Number of pages":'Número de páginas',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Idioma',
		"Language of publication":'Idioma de la publicación',
		"Section":'Sección',
		"Publication date":'Fecha de titulación',
		"Publication year":'Año de publicación',
		"Year":'Año',
		"Pages":'Páginas',
		"School":'Institución',
		"Degree":'Título universitario',
		"Publisher":'Editorial',
		"Place of publication":'Lugar de publicación',
		"School location":'Lugar de la institución',
		"Country of publication":'País de publicación',
		"Identifier / keyword":'Identificador / palabra clave',
		"Subject":'Materia',
		"Journal subject":'Materia de la revista'
	},
	'Français': {
		"Source type":'Type de source',
		"Document type":'Type de document',
		//"Record type"
		"Database":'Base de données',
		"Title":'Titre',
		"Author":'Auteur',
		//"Editor":
		"Publication title":'Titre de la publication',
		"Volume":'Volume',
		"Issue":'Numéro',
		"Number of pages":'Nombre de pages',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Langue',
		"Language of publication":'Langue de publication',
		"Section":'Section',
		"Publication date":'Date du diplôme',
		"Publication year":'Année de publication',
		"Year":'Année',
		"Pages":'Pages',
		"School":'École',
		"Degree":'Diplôme',
		"Publisher":'Éditeur',
		"Place of publication":'Lieu de publication',
		"School location":"Localisation de l'école",
		"Country of publication":'Pays de publication',
		"Identifier / keyword":'Identificateur / mot-clé',
		"Subject":'Sujet',
		"Journal subject":'Sujet de la publication'
	},
	'한국어': {
		"Source type":'원본 유형',
		"Document type":'문서 형식',
		//"Record type"
		"Database":'데이터베이스',
		"Title":'제목',
		"Author":'저자',
		//"Editor":
		"Publication title":'출판물 제목',
		"Volume":'권',
		"Issue":'호',
		"Number of pages":'페이지 수',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'언어',
		"Language of publication":'출판 언어',
		"Section":'섹션',
		"Publication date":'출판 날짜',
		"Publication year":'출판 연도',
		"Year":'연도',
		"Pages":'페이지',
		"School":'학교',
		"Degree":'학위',
		"Publisher":'출판사',
		"Place of publication":'출판 지역',
		"School location":'학교 지역',
		"Country of publication":'출판 국가',
		"Identifier / keyword":'식별자/키워드',
		"Subject":'주제',
		"Journal subject":'저널 주제'
	},
	'Italiano': {
		"Source type":'Tipo di fonte',
		"Document type":'Tipo di documento',
		//"Record type"
		"Database":'Database',
		"Title":'Titolo',
		"Author":'Autore',
		//"Editor":
		"Publication title":'Titolo pubblicazione',
		"Volume":'Volume',
		"Issue":'Fascicolo',
		"Number of pages":'Numero di pagine',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Lingua',
		"Language of publication":'Lingua di pubblicazione',
		"Section":'Sezione',
		"Publication date":'Data di pubblicazione',
		"Publication year":'Anno di pubblicazione',
		"Year":'Anno',
		"Pages":'Pagine',
		"School":'Istituzione accademica',
		"Degree":'Titolo accademico',
		"Publisher":'Casa editrice',
		"Place of publication":'Luogo di pubblicazione:',
		"School location":'Località istituzione accademica',
		"Country of publication":'Paese di pubblicazione',
		"Identifier / keyword":'Identificativo/parola chiave',
		"Subject":'Soggetto',
		"Journal subject":'Soggetto rivista'
	},
	'Magyar': {
		"Source type":'Forrástípus',
		"Document type":'Dokumentum típusa',
		//"Record type"
		"Database":'Adatbázis',
		"Title":'Cím',
		"Author":'Szerző',
		//"Editor":
		"Publication title":'Publikáció címe',
		"Volume":'Kötet',
		"Issue":'Szám',
		"Number of pages":'Oldalszám',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Nyelv',
		"Language of publication":'Publikáció nyelve',
		"Section":'Rész',
		"Publication date":'Publikáció dátuma',
		"Publication year":'Publikáció éve',
		"Year":'Év',
		"Pages":'Oldalak',
		"School":'Iskola',
		"Degree":'Diploma',
		"Publisher":'Kiadó',
		"Place of publication":'Publikáció helye',
		"School location":'Iskola helyszíne:',
		"Country of publication":'Publikáció országa',
		"Identifier / keyword":'Azonosító / kulcsszó',
		"Subject":'Tárgy',
		"Journal subject":'Folyóirat tárgya'
	},
	'日本語': {
		"Source type":'リソースタイプ',
		"Document type":'ドキュメントのタイプ',
		//"Record type"
		"Database":'データベース',
		"Title":'タイトル',
		"Author":'著者',
		//"Editor":
		"Publication title":'出版物のタイトル',
		"Volume":'巻',
		"Issue":'号',
		"Number of pages":'ページ数',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'著作権',
		"Language":'言語',
		"Language of publication":'出版物の言語',
		"Section":'セクション',
		"Publication date":'出版日',
		"Publication year":'出版年',
		"Year":'年',
		"Pages":'ページ',
		"School":'学校',
		"Degree":'学位称号',
		"Publisher":'出版社',
		"Place of publication":'出版地',
		"School location":'学校所在地',
		"Country of publication":'出版国',
		"Identifier / keyword":'識別子 / キーワード',
		"Subject":'主題',
		"Journal subject":'学術誌の主題'
	},
	'Norsk': {
		"Source type":'Kildetype',
		"Document type":'Dokumenttypeند',
		//"Record type"
		"Database":'Database',
		"Title":'Tittel',
		"Author":'Forfatter',
		//"Editor":
		"Publication title":'Utgivelsestittel',
		"Volume":'Volum',
		"Issue":'Utgave',
		"Number of pages":'Antall sider',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Opphavsrett',
		"Language":'Språk',
		"Language of publication":'Utgivelsesspråk',
		"Section":'Del',
		"Publication date":'Utgivelsesdato',
		"Publication year":'Utgivelsesår',
		"Year":'År',
		"Pages":'Sider',
		"School":'Skole',
		"Degree":'Grad',
		"Publisher":'Utgiver',
		"Place of publication":'Utgivelsessted',
		"School location":'Skolested',
		"Country of publication":'Utgivelsesland',
		"Identifier / keyword":'Identifikator/nøkkelord',
		"Subject":'Emne',
		"Journal subject":'Journalemne'
	},
	'Polski': {
		"Source type":'Typ źródła',
		"Document type":'Rodzaj dokumentu',
		//"Record type"
		"Database":'Baza danych',
		"Title":'Tytuł',
		"Author":'Autor',
		//"Editor":
		"Publication title":'Tytuł publikacji',
		"Volume":'Tom',
		"Issue":'Wydanie',
		"Number of pages":'Liczba stron',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Prawa autorskie',
		"Language":'Język',
		"Language of publication":'Język publikacji',
		"Section":'Rozdział',
		"Publication date":'Data publikacji',
		"Publication year":'Rok publikacji',
		"Year":'Rok',
		"Pages":'Strony',
		"School":'Uczelnia',
		"Degree":'Stopień',
		"Publisher":'Wydawca',
		"Place of publication":'Miejsce publikacji',
		"School location":'Lokalizacja uczelni',
		"Country of publication":'Kraj publikacji',
		"Identifier / keyword":'Identyfikator/słowo kluczowe',
		"Subject":'Temat',
		"Journal subject":'Tematyka czasopisma'
	},
	'Português (Brasil)': {
		"Source type":'Tipo de fonte',
		"Document type":'Tipo de documento',
		//"Record type"
		"Database":'Base de dados',
		"Title":'Título',
		"Author":'Autor',
		//"Editor":
		"Publication title":'Título da publicação',
		"Volume":'Volume',
		"Issue":'Edição',
		"Number of pages":'Número de páginas',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Idioma',
		"Language of publication":'Idioma de publicação',
		"Section":'Seção',
		"Publication date":'Data de publicação',
		"Publication year":'Ano de publicação',
		"Year":'Ano',
		"Pages":'Páginas',
		"School":'Escola',
		"Degree":'Graduação',
		"Publisher":'Editora',
		"Place of publication":'Local de publicação',
		"School location":'Localização da escola',
		"Country of publication":'País de publicação',
		"Identifier / keyword":'Identificador / palavra-chave',
		"Subject":'Assunto',
		"Journal subject":'Assunto do periódico'
	},
	'Português (Portugal)': {
		"Source type":'Tipo de fonte',
		"Document type":'Tipo de documento',
		//"Record type"
		"Database":'Base de dados',
		"Title":'Título',
		"Author":'Autor',
		//"Editor":
		"Publication title":'Título da publicação',
		"Volume":'Volume',
		"Issue":'Edição',
		"Number of pages":'Número de páginas',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Idioma',
		"Language of publication":'Idioma de publicação',
		"Section":'Secção',
		"Publication date":'Data da publicação',
		"Publication year":'Ano da publicação',
		"Year":'Ano',
		"Pages":'Páginas',
		"School":'Escola',
		"Degree":'Licenciatura',
		"Publisher":'Editora',
		"Place of publication":'Local de publicação',
		"School location":'Localização da escola',
		"Country of publication":'País de publicação',
		"Identifier / keyword":'Identificador / palavra-chave',
		"Subject":'Assunto',
		"Journal subject":'Assunto da publicação periódica'
	},
	'Русский': {
		"Source type":'Тип источника',
		"Document type":'Тип документа',
		//"Record type"
		"Database":'База',
		"Title":'Название',
		"Author":'Автор',
		//"Editor":
		"Publication title":'Название публикации',
		"Volume":'Том',
		"Issue":'Выпуск',
		"Number of pages":'Число страниц',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Copyright',
		"Language":'Язык',
		"Language of publication":'Язык публикации',
		"Section":'Раздел',
		"Publication date":'Дата публикации',
		"Publication year":'Год публикации',
		"Year":'Год',
		"Pages":'Страницы',
		"School":'Учебное заведение',
		"Degree":'Степень',
		"Publisher":'Издательство',
		"Place of publication":'Место публикации',
		"School location":'Местонахождение учебного заведения',
		"Country of publication":'Страна публикации',
		"Identifier / keyword":'Идентификатор / ключевое слово',
		"Subject":'Тема',
		"Journal subject":'Тематика журнала'
	},
	'ไทย': {
		"Source type":'ประเภทของแหล่งข้อมูล',
		"Document type":'ประเภทเอกสาร',
		//"Record type"
		"Database":'ฐานข้อมูล',
		"Title":'ชื่อเรื่อง',
		"Author":'ผู้แต่ง',
		//"Editor":
		"Publication title":'ชื่อเอกสารสิ่งพิมพ์',
		"Volume":'เล่ม',
		"Issue":'ฉบับที่',
		"Number of pages":'จำนวนหน้า',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'ลิขสิทธิ์',
		"Language":'ภาษา',
		"Language of publication":'ภาษาของเอกสารสิ่งพิมพ์',
		"Section":'ส่วน',
		"Publication date":'วันที่เอกสารสิ่งพิมพ์',
		"Publication year":'ปีที่พิมพ์',
		"Year":'ปี',
		"Pages":'หน้า',
		"School":'สถาบันการศึกษา',
		"Degree":'ปริญญาบัตร',
		"Publisher":'สำนักพิมพ์',
		"Place of publication":'สถานที่พิมพ์',
		"School location":'สถานที่ตั้งของสถาบันการศึกษา',
		"Country of publication":'ประเทศที่พิมพ์',
		"Identifier / keyword":'ตัวบ่งชี้/คำสำคัญ',
		"Subject":'หัวเรื่อง',
		"Journal subject":'หัวเรื่องของวารสาร'
	},
	'Türkçe': {
		"Source type":'Yayın türü',
		"Document type":'Belge türü',
		//"Record type"
		"Database":'Veritabanı',
		"Title":'Başlık',
		"Author":'Yazar adı',
		//"Editor":
		"Publication title":'Yayın adı',
		"Volume":'Cilt',
		"Issue":'Sayı',
		"Number of pages":'Sayfa sayısı',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'Telif Hakkı',
		"Language":'Dil',
		"Language of publication":'Yayın Dili',
		"Section":'Bölüm',
		"Publication date":'Yayınlanma tarihi',
		"Publication year":'Yayın Yılı',
		"Year":'Yıl',
		"Pages":'Sayfalar',
		"School":'Okul',
		"Degree":'Derece',
		"Publisher":'Yayıncı',
		"Place of publication":'Basım yeri',
		"School location":'Okul konumu',
		"Country of publication":'Yayınlanma ülkesi',
		"Identifier / keyword":'Tanımlayıcı / anahtar kelime',
		"Subject":'Konu',
		"Journal subject":'Dergi konusu'
	},
	'中文(简体)‎': {
		"Source type":'来源类型',
		"Document type":'文档类型',
		//"Record type"
		"Database":'数据库',
		"Title":'标题',
		"Author":'作者',
		//"Editor":
		"Publication title":'出版物名称',
		"Volume":'卷',
		"Issue":'期',
		"Number of pages":'页数',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'版权',
		"Language":'语言',
		"Language of publication":'出版物语言',
		"Section":'章节',
		"Publication date":'出版日期',
		"Publication year":'出版年份',
		"Year":'出版年',
		"Pages":'页',
		"School":'学校',
		"Degree":'学位',
		"Publisher":'出版商',
		"Place of publication":'出版物地点',
		"School location":'学校地点',
		"Country of publication":'出版物国家/地区',
		"Identifier / keyword":'标识符/关键字',
		"Subject":'主题',
		"Journal subject":'期刊主题'
	},
	'中文(繁體)': {
		"Source type":'來源類型',
		"Document type":'文件類型',
		//"Record type"
		"Database":'資料庫',
		"Title":'標題',
		"Author":'作者',
		//"Editor":
		"Publication title":'出版物名稱',
		"Volume":'卷期',
		"Issue":'期',
		"Number of pages":'頁數',
		"ISSN":'ISSN',
		"ISBN":'ISBN',
		//"DOI":
		"Copyright":'著作權',
		"Language":'語言',
		"Language of publication":'出版物語言',
		"Section":'區段',
		"Publication date":'出版日期',
		"Publication year":'出版年份',
		"Year":'年',
		"Pages":'頁面',
		"School":'學校',
		"Degree":'學位',
		"Publisher":'出版者',
		"Place of publication":'出版地',
		"School location":'學校地點',
		"Country of publication":'出版國家/地區',
		"Identifier / keyword":'識別碼/關鍵字',
		"Subject":'主題',
		"Journal subject":'期刊主題'
	}
};

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://search.proquest.com/dissertations/docview/251755786/abstract/132B8A749B71E82DBA1/1",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Valleri Jane",
						"lastName": "Robinson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Communication and the arts",
					"Konstantin",
					"Konstantin Stanislavsky",
					"Modernism",
					"Russian",
					"Stanislavsky",
					"Theater"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"numPages": "233",
				"university": "The Ohio State University",
				"thesisType": "Ph.D.",
				"language": "English",
				"rights": "Copyright UMI - Dissertations Publishing 2001",
				"url": "http://search.proquest.com/dissertations/docview/251755786/abstract/132B8A749B71E82DBA1/1",
				"place": "United States -- Ohio",
				"abstractNote": "Russian modernist theatre greatly influenced the development of American theatre during the first three decades of the twentieth century. Several developments encouraged the relationships between Russian artists and their American counterparts, including key tours by Russian artists in America, the advent of modernism in the American theatre, the immigration of Eastern Europeans to the United States, American advertising and consumer culture, and the Bolshevik Revolution and all of its domestic and international ramifications. Within each of these major and overlapping developments, Russian culture became increasingly acknowledged and revered by American artists and thinkers, who were seeking new art forms to express new ideas. This study examines some of the most significant contributions of Russian theatre and its artists in the early decades of the twentieth century. Looking beyond the important visit of the Moscow Art Theatre in 1923, this study charts the contributions of various Russian artists and their American supporters.\nCertainly, the influence of Stanislavsky and the Moscow Art Theatre on the modern American theatre has been significant, but theatre historians' attention to his influence has overshadowed the contributions of other Russian artists, especially those who provided non-realistic approaches to theatre. In order to understand the extent to which Russian theatre influenced the American stage, this study focuses on the critics, intellectuals, producers, and touring artists who encouraged interaction between Russians and Americans, and in the process provided the catalyst for American theatrical experimentation. The key figures in this study include some leaders in the Yiddish intellectual and theatrical communities in New York City, Morris Gest and Otto H. Kahn, who imported many important Russian performers for American audiences, and a number of Russian émigré artists, including Jacob Gordin, Jacob Ben-Ami, Benno Schneider, Boris Aronson, and Michel Fokine, who worked in the American theatre during the first three decades of the twentieth century.",
				"libraryCatalog": "ProQuest",
				"shortTitle": "Beyond Stanislavsky",
				"title": "Beyond Stanislavsky: The influence of Russian modernism on the American theatre",
				"date": "2001"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/docview/213445241",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Gerald F.",
						"lastName": "Powers",
						"creatorType": "author"
					},
					{
						"firstName": "Drew",
						"lastName": "Christiansen",
						"creatorType": "author"
					},
					{
						"firstName": "Robert T.",
						"lastName": "Hennemeyer",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Peace",
					"Book reviews",
					"Sciences: Comprehensive Works",
					"Sociology",
					"Political Science--International Relations"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Peacemaking: moral & policy challenges for a new world // Review",
				"publicationTitle": "Peace Research",
				"volume": "27",
				"issue": "2",
				"pages": "90-100",
				"numPages": "0",
				"publisher": "Menno Simons College",
				"ISSN": "00084697",
				"language": "English",
				"rights": "Copyright Peace Research May 1995",
				"url": "http://search.proquest.com/docview/213445241",
				"place": "Winnipeg, Canada",
				"date": "May 1995",
				"abstractNote": "In his \"Introduction\" to the book entitled Peacemaking: Moral and Policy Challenges for a New World, Rev. Drew Christiansen points out that the Roman Catholic bishops of the United States have made a clear distinction between the social teachings of the Church--comprising universally binding moral and ethical principles--and the particular positions they have taken on public policy issues--such as those relating to war, peace, justice, human rights and other socio-political matters. While the former are not to be mitigated under any circumstances, the latter, being particular applications, observations and recommendations, can allow for plurality of opinion and diversity of focus in the case of specific social, political and opinion and diversity of focus in the case of specific social, political and moral issues.(f.1) Peacemaking aligns itself with this second category. The objectives of this review essay are the following: to summarize the main topics and themes, of some of the recently-published documents on Catholic political thought, relating to peacemaking and peacekeeping; and to provide a brief critique of their main contents, recommendations and suggestions.\nThe Directions of Peacemaking: As in the earlier documents, so too are the virtues of faith, hope, courage, compassion, humility, kindness, patience, perseverance, civility and charity emphasized, in The Harvest of Justice, as definite aids in peacemaking and peacekeeping. The visions of global common good, social and economic development consistent with securing and nurturing conditions for justice and peace, solidarity among people, as well as cooperation among the industrial rich and the poor developing nations are also emphasized as positive enforcements in the peacemaking and peacekeeping processes. All of these are laudable commitments, so long as they are pursued through completely pacifist perspectives. The Harvest of Justice also emphasizes that, \"as far as possible, justice should be sought through nonviolent means;\" however, \"when sustained attempt at nonviolent action fails, then legitimate political authorities are permitted as a last resort to employ limited force to rescue the innocent and establish justice.\"(f.13) The document also frankly admits that \"the vision of Christian nonviolence is not passive.\"(f.14) Such a position may disturb many pacifists. Even though some restrictive conditions--such as a \"just cause,\" \"comparative justice,\" legitimate authority\" to pursue justice issues, \"right intentions,\" probability of success, proportionality of gains and losses in pursuing justice, and the use of force as last resort--are indicated and specified in the document, the use of violence and devastation are sanctioned, nevertheless, by its reaffirmation of the use of force in setting issues and by its support of the validity of the \"just war\" tradition.\nThe first section, entitled \"Theology, Morality, and Foreign Policy in A New World,\" contains four essays. These deal with the new challenges of peace, the illusion of control, creating peace conditions through a theological framework, as well as moral reasoning and foreign policy after the containment. The second, comprising six essays, is entitled \"Human Rights, Self-Determination, and Sustainable Development.\" These essays deal with effective human rights agenda, religious nationalism and human rights, identity, sovereignty, and self-determination, peace and the moral imperatives of democracy, and political economy of peace. The two essays which comprise the third section, entitled \"Global Institutions,\" relate the strengthening of the global institutions and action for the future. The fourth, entitled \"The Use of Force After the Cold War,\" is both interesting and controversial. Its six essays discuss ethical dilemmas in the use of force, development of the just-war tradition, in a multicultural world, casuistry, pacifism, and the just-war tradition, possibilities and limits of humanitarian intervention, and the challenge of peace and stability in a new international order. The last section, devoted to \"Education and Action for Peace,\" contains three essays, which examine the education for peacemaking, the challenge of conscience and the pastoral response to ongoing challenge of peace.",
				"libraryCatalog": "ProQuest",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Peacemaking"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/hnpnewyorktimes/docview/122485317/abstract/1357D8A4FC136DF28E3/11?accountid=12861",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "F. Stephen",
						"lastName": "Larrabee",
						"creatorType": "author"
					},
					{
						"firstName": "R. G.",
						"lastName": "Livingston",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"General Interest Periodicals--United States"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"ISSN": "03624331",
				"language": "English",
				"rights": "Copyright New York Times Company Aug 22, 1984",
				"url": "http://search.proquest.com/hnpnewyorktimes/docview/122485317/abstract/1357D8A4FC136DF28E3/11?accountid=12861",
				"place": "New York, N.Y., United States",
				"abstractNote": "For some months now, a gradual thaw has been in the making between East Germany and West Germany. So far, the United States has paid scant attention -- an attitude very much in keeping with our neglect of East Germany throughout the postwar period. We should reconsider this policy before things much further -- and should in particular begin to look more closely at what is going on in East Germany.",
				"libraryCatalog": "ProQuest",
				"title": "Rethinking Policy on East Germany",
				"publicationTitle": "New York Times (1923-Current file)",
				"pages": "A23",
				"date": "Aug 22, 1984"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/docview/129023293/abstract?accountid=12861",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [
					"Business And Economics--Banking And Finance"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "THE PRESIDENT AND ALDRICH.: Railway Age Relates Happenings Behind the Scenes Regarding Rate Regulation.",
				"publicationTitle": "Wall Street Journal (1889-1922)",
				"pages": "7",
				"numPages": "1",
				"publisher": "Dow Jones & Company Inc",
				"language": "English",
				"rights": "Copyright Dow Jones & Company Inc Dec 5, 1905",
				"url": "http://search.proquest.com/docview/129023293/abstract?accountid=12861",
				"place": "New York, N.Y., United States",
				"date": "Dec 5, 1905",
				"abstractNote": "The Railway Age says: \"The history of the affair (railroad rate question) as it has gone on behind the scenes, is about as follows.",
				"libraryCatalog": "ProQuest",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "THE PRESIDENT AND ALDRICH."
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/dissertations/pagepdf/251755786/fulltextPDF",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Valleri Jane",
						"lastName": "Robinson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Communication and the arts",
					"Konstantin",
					"Konstantin Stanislavsky",
					"Modernism",
					"Russian",
					"Stanislavsky",
					"Theater"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"numPages": "233",
				"university": "The Ohio State University",
				"thesisType": "Ph.D.",
				"language": "English",
				"rights": "Copyright UMI - Dissertations Publishing 2001",
				"url": "http://search.proquest.com/dissertations/docview/251755786/abstract?accountid=14541",
				"place": "United States -- Ohio",
				"abstractNote": "Russian modernist theatre greatly influenced the development of American theatre during the first three decades of the twentieth century. Several developments encouraged the relationships between Russian artists and their American counterparts, including key tours by Russian artists in America, the advent of modernism in the American theatre, the immigration of Eastern Europeans to the United States, American advertising and consumer culture, and the Bolshevik Revolution and all of its domestic and international ramifications. Within each of these major and overlapping developments, Russian culture became increasingly acknowledged and revered by American artists and thinkers, who were seeking new art forms to express new ideas. This study examines some of the most significant contributions of Russian theatre and its artists in the early decades of the twentieth century. Looking beyond the important visit of the Moscow Art Theatre in 1923, this study charts the contributions of various Russian artists and their American supporters.\nCertainly, the influence of Stanislavsky and the Moscow Art Theatre on the modern American theatre has been significant, but theatre historians' attention to his influence has overshadowed the contributions of other Russian artists, especially those who provided non-realistic approaches to theatre. In order to understand the extent to which Russian theatre influenced the American stage, this study focuses on the critics, intellectuals, producers, and touring artists who encouraged interaction between Russians and Americans, and in the process provided the catalyst for American theatrical experimentation. The key figures in this study include some leaders in the Yiddish intellectual and theatrical communities in New York City, Morris Gest and Otto H. Kahn, who imported many important Russian performers for American audiences, and a number of Russian émigré artists, including Jacob Gordin, Jacob Ben-Ami, Benno Schneider, Boris Aronson, and Michel Fokine, who worked in the American theatre during the first three decades of the twentieth century.",
				"libraryCatalog": "ProQuest",
				"shortTitle": "Beyond Stanislavsky",
				"title": "Beyond Stanislavsky: The influence of Russian modernism on the American theatre",
				"date": "2001"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/dissertations/docview/251755786/previewPDF",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Valleri Jane",
						"lastName": "Robinson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Communication and the arts",
					"Konstantin",
					"Konstantin Stanislavsky",
					"Modernism",
					"Russian",
					"Stanislavsky",
					"Theater"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"numPages": "233",
				"university": "The Ohio State University",
				"thesisType": "Ph.D.",
				"language": "English",
				"rights": "Copyright UMI - Dissertations Publishing 2001",
				"url": "http://search.proquest.com/dissertations/docview/251755786/abstract?accountid=14541",
				"place": "United States -- Ohio",
				"abstractNote": "Russian modernist theatre greatly influenced the development of American theatre during the first three decades of the twentieth century. Several developments encouraged the relationships between Russian artists and their American counterparts, including key tours by Russian artists in America, the advent of modernism in the American theatre, the immigration of Eastern Europeans to the United States, American advertising and consumer culture, and the Bolshevik Revolution and all of its domestic and international ramifications. Within each of these major and overlapping developments, Russian culture became increasingly acknowledged and revered by American artists and thinkers, who were seeking new art forms to express new ideas. This study examines some of the most significant contributions of Russian theatre and its artists in the early decades of the twentieth century. Looking beyond the important visit of the Moscow Art Theatre in 1923, this study charts the contributions of various Russian artists and their American supporters.\nCertainly, the influence of Stanislavsky and the Moscow Art Theatre on the modern American theatre has been significant, but theatre historians' attention to his influence has overshadowed the contributions of other Russian artists, especially those who provided non-realistic approaches to theatre. In order to understand the extent to which Russian theatre influenced the American stage, this study focuses on the critics, intellectuals, producers, and touring artists who encouraged interaction between Russians and Americans, and in the process provided the catalyst for American theatrical experimentation. The key figures in this study include some leaders in the Yiddish intellectual and theatrical communities in New York City, Morris Gest and Otto H. Kahn, who imported many important Russian performers for American audiences, and a number of Russian émigré artists, including Jacob Gordin, Jacob Ben-Ami, Benno Schneider, Boris Aronson, and Michel Fokine, who worked in the American theatre during the first three decades of the twentieth century.",
				"libraryCatalog": "ProQuest",
				"shortTitle": "Beyond Stanislavsky",
				"title": "Beyond Stanislavsky: The influence of Russian modernism on the American theatre",
				"date": "2001"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.proquest.com/docview/925553601/137CCF69B9E7916BDCF/1?accountid=14541",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Lian",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Shixia",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "Kaiya",
						"lastName": "Zhou",
						"creatorType": "author"
					},
					{
						"firstName": "Guang",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Michael W.",
						"lastName": "Bruford",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"CABSCLASS",
					"84.5.22",
					"GENETICS AND MOLECULAR BIOLOGY",
					"EUKARYOTIC GENETICS",
					"Ecological and Population Genetics",
					"CABSCLASS",
					"84.5.34",
					"GENETICS AND MOLECULAR BIOLOGY",
					"EUKARYOTIC GENETICS",
					"Mammalian Genetics",
					"CABSCLASS",
					"92.7.2",
					"PLANT SCIENCE",
					"DEVELOPMENT",
					"Growth Regulators"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Microsatellite variation and significant population genetic structure of endangered finless porpoises (Neophocaena phocaenoides) in Chinese coastal waters and the Yangtze River",
				"publicationTitle": "Marine Biology",
				"volume": "157",
				"issue": "7",
				"pages": "1453-1462",
				"numPages": "10",
				"ISSN": "0025-3162",
				"language": "English",
				"DOI": "http://dx.doi.org/10.1007/s00227-010-1420-x",
				"url": "http://search.proquest.com/docview/925553601/137CCF69B9E7916BDCF/1?accountid=14541",
				"date": "2020",
				"abstractNote": "The finless porpoise (Neophocaena phocaenoides) inhabits a wide range of tropical and temperate waters of the Indo-Pacific region. Genetic structure of finless porpoises in Chinese waters in three regions (Yangtze River, Yellow Sea, and South China Sea) was analyzed, including the Yangtze finless porpoise which is widely known because of its highly endangered status and unusual adaptation to freshwater. To assist in conservation and management of this species, ten microsatellite loci were used to genotype 125 individuals from the three regions. Contrary to the low genetic diversity revealed in previous mtDNA control region sequence analyses, relatively high levels of genetic variation in microsatellite profiles (HE= 0.732-0.795) were found. Bayesian clustering analysis suggested that finless porpoises in Chinese waters could be described as three distinct genetic groups, which corresponded well to population \"units\" (populations, subspecies, or species) delimited in earlier studies, based on morphological variation, distribution, and genetic analyses. Genetic differentiation between regions was significant, with FST values ranging from 0.07 to 0.137. Immigration rates estimated using a Bayesian method and population ancestry analyses suggested no or very limited gene flow among regional types, even in the area of overlap between types. These results strongly support the classification of porpoises in these regions into distinct evolutionarily significant units, including at least two separate species, and therefore they should be treated as different management units in the design and implementation of conservation programmes. © 2010 Springer-Verlag.",
				"libraryCatalog": "ProQuest",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/