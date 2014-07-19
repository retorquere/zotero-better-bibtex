{
	"translatorID": "7bdb79e-a47f-4e3d-b317-ccd5a0a74456",
	"label": "Factiva",
	"creator": "Philipp Zumstein",
	"target": "^https?://global\\.factiva\\.com/(?:[gh]a|redir|np)/default\\.aspx",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-03-10 21:57:48"
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
	Z.monitorDOMChanges(doc.body, { attributes: true });
	if(doc.body.className == 'articleView') return "newspaperArticle";
	if(ZU.xpath(doc, '//tr[@class="headline"] | //tr[td[@class="headline"]]').length>0 ) return "multiple";
	if(ZU.xpath(doc, '//div[contains(@class, "article")]').length>0) return "newspaperArticle";
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var articles = new Array();
		var rows = ZU.xpath(doc, '//tr[contains(@class,"headline")] | //tr[td[@class="headline"]]');
		for(var i=0; i<rows.length; i++) {
			var title = ZU.xpathText(rows[i], './td[contains(@class,"count")]') + ZU.xpathText(rows[i], './td/a') + " / " + ZU.xpathText(rows[i], './td/div/a');
			var link = ZU.xpathText(rows[i], './td/a/@href') + "&dfd=FULR&";
			items[link] = title;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		var rows = ZU.xpath(doc, '//div[contains(@class, "article")]//tr');
		if (rows.length > 0) {//works if the display options are either HLPI or FULLR
			scrape(doc, url);
		} else {//works if the search rows are invisible but still there
			var shareLink = doc.getElementById("shareLinkOtherAcctURLHRef").value;
			var id =  /[&?]an=([^&#]*)[&#]/.exec(shareLink)[1];
			//Z.debug(id);
			if (ZU.xpath(doc, '//tr[@class="headline"]').length>0 ) {
				var correspondingRow = doc.getElementById(id).parentNode.parentNode;
				var link = ZU.xpathText(correspondingRow, './td/a/@href') + "&dfd=FULR&";
				ZU.processDocuments(link, scrape);
			} else {//otherwise
				var post = "";
				var hiddenInputs = ZU.xpath(doc, '//form[@name="PageBaseForm"]//input[@type="hidden"]');
				for(var i=0; i<hiddenInputs.length; i++) {
					if (hiddenInputs[i].name != "dfd") {
						post += "&"+hiddenInputs[i].name+"="+encodeURIComponent(hiddenInputs[i].value);
					}
				}
				var selects = ZU.xpath(doc, '//form[@name="PageBaseForm"]//select');
				for(var i=0; i<selects.length; i++) {
					post += "&"+selects[i].name+"="+encodeURIComponent(selects[i].value);
				}
				post += "&dfd=FULR";//Full Article/Report, plus Indexing
				var hdlParameter = doc.getElementById("_hdl").value;
				post += "&hdl=" + encodeURIComponent(hdlParameter);
				
				if(url.indexOf('?') == -1) url += '?';
				ZU.processDocuments(url + post, scrape);
			}

		}
	}
}

function scrape(doc, url) {
	//Z.debug(url);
	var element = new Array();
	var elementInverse = new Array();
	var rows = ZU.xpath(doc, '//div[contains(@class, "article")]//tr');

	var maxLeft = 0;
	for(var i=0; i<rows.length; i++) {
		var fieldShortcut = ZU.trimInternal(ZU.xpathText(rows[i], './/td[1]'));
		var fieldContent = ZU.trimInternal(ZU.xpathText(rows[i], './/td[2]'));
		element[fieldShortcut] = fieldContent;
		elementInverse[fieldContent] = fieldShortcut;
		maxLeft = Math.max(fieldShortcut.length, maxLeft);
	}
	if (maxLeft > 4) {//right-to-left language, e.g. arabic
		element = elementInverse;
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
	
	var authors = new Array();
	if (element["AU"]) {
		authors = element["AU"].split(",");
	} else if (element["BY"]) {
		var byline = ZU.trimInternal(element["BY"].replace(/By/i, ""));
		authors = byline.split(/(?:\&| and |,| et )/i);
	}
	for(var i=0; i<authors.length; i++) {
		newItem.creators.push(ZU.cleanAuthor(authors[i], "author"));
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
		for(var i=0; i<tagArray.length; i++) {
			var tagCodeNamePair = tagArray[i].split(":");
			newItem.tags.push(ZU.trimInternal(tagCodeNamePair[1]));
		}
	}
	
	if (element["AN"]) {
		element["AN"] = element["AN"].split(" ")[1];
		var exportUrl = 'http://global.factiva.com/redir/default.aspx?P=sa&an=' + encodeURIComponent(element["AN"]) + '&cat=a&ep=ASE';
		newItem.url = exportUrl;
	}
	
	newItem.attachments = [{
		title: "Snapshot",
		document:doc
	}];

	newItem.complete();
}