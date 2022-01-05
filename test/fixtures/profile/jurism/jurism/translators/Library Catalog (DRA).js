{
	"translatorID": "fb12ae9e-f473-cab4-0546-27ab88c64101",
	"label": "Library Catalog (DRA)",
	"creator": "Simon Kornblith",
	"target": "/web2/tramp2\\.exe/(see\\_record/|authority\\_hits/|do_keyword_search|form/|goto/.*\\?.*screen=(MARC)?Record\\.html)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 260,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2016-12-04 12:47:41"
}

/*
Sample URLs: 
  http://libraries.nc-pals.org --> not working anymore
  http://web2.libraries.vermont.gov/web2/tramp2.exe/log_in?SETTING_KEY=English
  http://catalogues.toulouse.fr/web2/tramp2.exe/log_in?setting_key=BMT1
  https://sdb-web2.biblio.usherbrooke.ca/web2/tramp2.exe/log_in?setting_key=french
 */

function detectWeb(doc, url) {
	if (url.indexOf('/see_record/')>-1 || url.indexOf('/goto/')>-1 || url.indexOf('/do_keyword_search/')>-1 || url.indexOf('/authority_hits/')>-1 || url.indexOf('/form/')>-1) {
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ol//tr/td|//ol/li//ul/li');
	for (var i=0; i<rows.length; i++) {
		var href = ZU.xpathText(rows[i], './/a[contains(@href, "/web2/tramp2.exe/goto") or contains(@href, "/web2/tramp2.exe/see_record")]/@href');
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
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
		var marclink = ZU.xpathText(doc, '//td[@class="enrichcontent"]/a[contains(@href, "MARCRecord")]/@href');
		var metalink = ZU.xpathText(doc, '//meta[@http-equiv="REFRESH"]/@content');
		if (url.indexOf("/do_keyword_search/")!=-1 || url.indexOf("/form/")>-1) {
			//Here we need first to go to another website which will then also
			//create a session to continue.
			if (marclink) {
				url = "//" + doc.location.host + marclink;
			} else {
				var pos = metalink.indexOf("URL=");
				var link = metalink.substring(pos+4).replace('/log_out/', '/see_record/');
				url = "//" + doc.location.host + link;
			}
			ZU.processDocuments([url], scrape);
		} else {
			scrape(doc, url);
		}
	}
}


function scrape(doc, uri) {
	var uriRegexp = /^((?:https?:\/\/.*)?\/web2\/tramp2\.exe\/)(?:goto|see\_record|authority\_hits)(\/.*)\?(?:screen=Record\.html\&)?(.*)$/i;
	var m = uriRegexp.exec(uri);
	if (uri.indexOf("/authority_hits") < 0) {
		var newUri = m[1]+"download_record"+m[2]+"/RECORD.MRC?format=marc&"+m[3];
	} else {
		var newUri = m[1]+"download_record"+m[2]+"/RECORD.MRC?format=marc";
	}
	
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	
	var domain = uri.match(/https?:\/\/([^/]+)/);
	translator.setHandler("itemDone", function(obj, item) {
		item.repository = domain[1]+" Library Catalog";
		item.complete();
	});
	
	var encoding = "UTF-8";
	//Sometimes the encoding is not UTF-8 but some multibyte extension of ASCII
	//which uses besides the ASCII characters two bytes for encoding letters
	//with diacritics. Before dealing with these we need to load the page as
	//ISO-8859-1 encoded.
	if (uri.indexOf("web2.libraries.vermont.gov/web2/tramp2.exe/")>-1 ||
		uri.indexOf("catalogues.toulouse.fr/web2/tramp2.exe/")>-1) {
		encoding = "ISO-8859-1";
	}
	
	Zotero.Utilities.HTTP.doGet(newUri, function(text) {
		text = encode(text);
		translator.setString(text);
		translator.translate();	
	}, null, encoding);
}


function encode(text) {
	//This encodes the multibyte extension of ASCII which uses two bytes to 
	//encode letters with diacritics. The first one is always of the form \xE..
	//in the same manner as \xC.. in ISO/IEC 6937.
	//cf. https://en.wikipedia.org/wiki/ISO/IEC_6937
	//
	//This map is not complete, but focuses on the most used ones in French.
	var map = {
		//Grave
		'\xE1A' : 'À',
		'\xE1E' : 'È',
		'\xE1I' : 'Ì',
		'\xE1O' : 'Ò',
		'\xE1U' : 'Ù',
		'\xE1a' : 'à',
		'\xE1e' : 'è',
		'\xE1i' : 'ì',
		'\xE1o' : 'ò',
		'\xE1u' : 'ù',
		//Acute
		'\xE2A' : 'Á',
		'\xE2E' : 'É',
		'\xE2a' : 'á',
		'\xE2e' : 'é',
		//Circumflex
		'\xE3E' : 'Ê',
		'\xE3O' : 'Ô',
		'\xE3E' : 'ê',
		'\xE3o' : 'ô',
		//Umlaut or diaresis
		'\xE8A' : 'Ä',
		'\xE8I' : 'Ï',
		'\xE8O' : 'Ö',
		'\xE8U' : 'Ü',
		'\xE8a' : 'ä',
		'\xE8i' : 'ï',
		'\xE8o' : 'ö',
		'\xE8u' : 'ü',
		//Cedilla
		'\xEBC' : 'Ç',
		'\xEBC' : 'ç',
		//Ring
		'\xEA ' : '° '
	};
	for (var s in map) {
		var re = new RegExp(s ,"g");
		text = text.replace(re, map[s]);
	}
	return text;
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://catalogues.toulouse.fr/web2/tramp2.exe/do_keyword_search/log_in?setting_key=BMT1&servers=1home&query=9782211035965&screen=hitlist.html",
		"items": [
			{
				"itemType": "book",
				"title": "Voyage à Pitchipoï",
				"creators": [
					{
						"firstName": "Jean-Claude",
						"lastName": "Moscovici",
						"creatorType": "author"
					}
				],
				"date": "1995",
				"ISBN": "9782211035965",
				"callNumber": "RJ MOS",
				"libraryCatalog": "catalogues.toulouse.fr Library Catalog",
				"numPages": "131",
				"place": "Paris",
				"publisher": "l'École des loisirs",
				"series": "Médium",
				"attachments": [],
				"tags": [
					"Roman pour les jeu"
				],
				"notes": [
					{
						"note": "Analyse dans :LJBMT,1996- LJ n° 78,1996- RLE n° 172,1996- NVL n° 115,1"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/