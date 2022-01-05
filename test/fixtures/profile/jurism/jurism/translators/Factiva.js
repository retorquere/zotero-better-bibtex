{
	"translatorID": "7bdb79e-a47f-4e3d-b317-ccd5a0a74456",
	"label": "Factiva",
	"creator": "Philipp Zumstein and Aurimas Vinckevicius",
	"target": "^https?://(global\\.factiva\\.com|[^/]*\\bglobal-factiva-com\\b[^/]+)/([gh]a|redir|np)/default\\.aspx",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2015-02-13 21:54:59"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Factiva Translator, Copyright © 2014 Philipp Zumstein
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
	if (doc.body.classList.contains('articleView')) {
		// This is not sufficient for multiples, because the class does not change when filtering results
		Z.monitorDOMChanges(doc.body, {attributes: true, attributeFilter: ['class']});
		return "newspaperArticle";
	}
	
	var splitter = doc.getElementById('hldSplitter');
	if (splitter) Z.monitorDOMChanges(splitter, { attributes: true, attributeFilter: ['style'] });
	if (getSearchResults(doc, true)) return "multiple";
}

function getSearchResults(doc, checkOnly) {
	var items = {}, found = false;
	var rows = doc.getElementById('headlines');
	if (!rows) return false;
	rows = rows.getElementsByTagName('tr');
	for (var i=0; i<rows.length; i++) {
		var count = rows[i].getElementsByClassName('count')[0];
		if (!count) count = "";
		else count = count.textContent.replace(/^\s*(\d+)[\s\S]*/, '$1') + '. ';
		
		var title = rows[i].getElementsByTagName('a')[0];
		if (!title) continue;
		
		var hdl = rows[i].getElementsByTagName('input')[0];
		if (!hdl) continue;
		
		if (checkOnly) return true;
		found = true;
		
		var link = title.href.replace(/#.*/, '');
		items[hdl.value] = ZU.trimInternal(title.textContent);
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			
			var hdls = [];
			for (var i in items) {
				hdls.push(i);
			}
			scrape(doc, hdls, url);
		});
	} else {
		var hdl = doc.getElementById('_hdl');
		if (!hdl) throw new Error('Could not locate hdl');
		scrape(doc, [hdl.value], url);
	}
}

/*
 * Gather form values. Very closely follows behavior of FACTIVA itself
 */
function getPostParams(doc) {
	var form = doc.forms.namedItem('PageBaseForm');
	if (!form) throw new Error('Could not find PageBaseForm');
	
	var params = [],
		fetchFromForm = ['_XFORMSESSSTATE', 'hls', 'elks', 'istphst', 'sri', 'usageAggregator'],
		fetchById = ['ao', 'aod', 'iisac', 'ipfCtrl', 'hideahdr'],
		name, input, value;
	
	for (var i=0; i<fetchFromForm.length; i++) {
		name = fetchFromForm[i];
		input = form.elements.namedItem(name);
		if (!input) continue;
		
		value = input.value;
		
		if (name == '_XFORMSESSSTATE') {
			value = value.replace(/\+/g, "%2b").replace(/\=/g, "%3d");
		} else if (name == 'usageAggregator') {
			name = 'fdn';
		} else if (name == 'hls') {
			value = value.replace(/\+/g, "%2b").replace(/\=/g, "%3d").replace(/&/g, "%26");
		}
		
		params.push(name + '=' + value);
	}
	
	for (var i=0; i<fetchById.length; i++) {
		name = fetchById[i];
		input = doc.getElementById(name);
		if (!input && name != 'iisac') continue;
		
		if (name != 'iisac') {
			value = input.value;
		} else {
			value = input ? input.value : 0;
		}
		
		if (name == 'ipfCtrl') {
			name = 'ipf'
			value = input.getAttribute('value'); // Not actually inputs
		}
		
		params.push(name + '=' + value);
	}
	
	return params;
}

function buildQueries(baseParams, hdls) {
	var hdlSet,
		arc = hdls.length,
		ari = 1,
		baseStr = baseParams.join('&') + (baseParams.length ? '&' : ''),
		queries = [];
	while ((hdlSet = hdls.splice(0, Math.min(hdls.length, (ari == 1 ? 1 : 14)))).length) {
		queries.push(
			baseStr
			+ 'hdl=[' + escape(hdlSet.join(',')) + ']'
			+ '&enableAd=' + (ari == 1)
			+ '&arc=' + arc + '&ari=' + ari
			+ '&dfd=FULR'
		);
		ari += hdlSet.length;
	}
	return queries;
}

function scrape(doc, hdls) {
	var queries = buildQueries(getPostParams(doc), hdls),
		headers = {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		};
	fetchQueries('/ha/haservice.aspx', queries, headers, doc);
}

function fetchQueries(url, queries, headers, doc) {
	if (!queries.length) return;
	ZU.doPost(url, queries.shift(), function(text) {
		var div = doc.createElement('div');
		div.innerHTML = text;
		var articles = div.getElementsByClassName('article');
		if (!articles.length) {
			Z.debug('Could not locate metadata');
			Z.debug(text);
		}
		
		scrapeArticles(articles);
		if (queries.length) fetchQueries(url, queries, headers, doc);
	}, headers)
}

function scrapeArticles(articles) {
	for (var i=0; i<articles.length; i++) {
		if (articles[i].id.indexOf('article-') != 0) continue; // nested div
		var rows = articles[i].getElementsByTagName('tr');
		var element = {};
		for (var j=0; j<rows.length; j++) {
			var data = rows[j].getElementsByTagName('td');
			if (data.length != 2) continue;
			
			var index, value;
			if (data[0].classList.contains('index')) {
				index = data[0];
				value = data[1];
			} else {
				// left-to-right languages
				index = data[1];
				value = data[0];
			}
			
			index = index.textContent.trim();
			if (index != 'TD') value = ZU.trimInternal(value.textContent);
			element[index] = value;
		}
		
		var newItem = new Zotero.Item("newspaperArticle");
		
		newItem.title = element["HD"];
		newItem.publicationTitle = element["SN"];
		newItem.section = element["SE"];
			
		if (element["PD"]) {
			dateArray = element["PD"].split(/ |\. ?/);
			if (dateArray.length == 5) {//in Spanish e.g. [8 de diciembre de 2013
				dateArray = [dateArray[0], dateArray[2], dateArray[4] ];
			}
			if (dateArray.length == 3) {//e.g. [8, December, 2013]
				//order: German, English, French, Italian, Spanish (no dublicates)
				var monthsMap = {	"Januar":"01", "January":"01", "janvier":"01", "gennaio":"01", "enero":"01",
									"Februar":"02", "February":"02", "février":"02", "febbraio":"02", "febrero":"02",
									"März":"03", "March":"03", "mars":"03", "marzo":"03",
									"April":"04", "avril":"04", "aprile":"04", "april":"04",
									"Mai":"05", "May":"05", "mai":"05", "maggio":"05", "mayo":"05",
									"Juni":"06", "June":"06", "juin":"06", "giugno":"06", "junio":"06",
									"Juli":"07", "July":"07", "juillet":"07", "luglio":"07", "julio":"07",
									"August":"08", "août":"08", "agosto":"08",
									"September":"09", "septembre":"09", "settembre":"09", "septiembre":"09", 
									"Oktober":"10", "October":"10", "octobre":"10", "ottobre":"10", "octubre":"10",
									"November":"11", "novembre":"11", "noviembre":"11", 
									"Dezember":"12", "December":"12", "décembre":"12", "dicembre":"12", "dicembre":"12", "diciembre":"12"
										   
				};
				if (dateArray[1] in monthsMap) dateArray[1] = monthsMap[dateArray[1]];
				if (dateArray[0].length == 1) dateArray[0] = "0"+dateArray[0];
				var dateString = dateArray[2]+"-"+dateArray[1]+"-"+dateArray[0];
				newItem.date = dateString;
			} else {
				newItem.date = element["PD"];
			}
		}

		newItem.edition = element["ED"];
		newItem.abstractNote = element["LP"];
		newItem.pages = element["PG"];
		newItem.publisher = element["PUB"];
		newItem.language = element["LA"];
		newItem.volume = element["VOL"];
		newItem.rights = element["CY"];
		
		// Eventually replace this with PDF of the "Full Article" view
		if (element['TD']) {
			var html = element['TD'].innerHTML
				.replace(/<\/?b>/g, '')
				.replace(/<\/?a[^>]*>/g, '');
			newItem.notes.push({note:ZU.trimInternal(html)});
		}
		
		var authors = new Array();
		if (element["AU"]) {
			authors = element["AU"].split(",");
		} else if (element["BY"]) {
			var byline = ZU.trimInternal(element["BY"].replace(/By/i, ""));
			authors = byline.split(/(?:\&| and |,| et )/i);
		}
		for (var j=0; j<authors.length; j++) {
			newItem.creators.push(ZU.cleanAuthor(authors[j], "author"));
		}
		
		//company: element["CO"] --> seems fine as tags
		//industry: element["IN"] --> broad but still okay
		//element["NS"] --> too messy
		//regions: element["RE"] --> too broad, messy
		var tagString = element["CO"];
		if (!tagString) {
			tagString = element["IN"];
		} else if (element["IN"]) {
			tagString += " | "+element["IN"];
		}
		if (tagString) {
			var tagArray = tagString.split("|");
			for (var j=0; j<tagArray.length; j++) {
				var tagCodeNamePair = tagArray[j].split(":");
				newItem.tags.push(ZU.trimInternal(tagCodeNamePair[1]));
			}
		}
		
		if (element["AN"]) {
			element["AN"] = element["AN"].split(" ")[1];
			var exportUrl = 'http://global.factiva.com/redir/default.aspx?P=sa&an=' + encodeURIComponent(element["AN"]) + '&cat=a&ep=ASE';
			newItem.url = exportUrl;
		}
		
		newItem.complete();
	}
}