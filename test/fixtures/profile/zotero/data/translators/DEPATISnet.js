{
	"translatorID": "d76fea32-fe20-4c00-b5b9-bea8c688c2b0",
	"label": "DEPATISnet",
	"creator": "Klaus Flittner",
	"target": "^https?://depatisnet\\.dpma\\.de/DepatisNet/depatisnet",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-12 04:43:57"
}

/*
	***** BEGIN LICENSE BLOCK *****

	DEPATISnet translator - Copyright © 2014 Klaus Flittner

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.indexOf("action=bibdat") !== -1) {
		return "patent";
	}
	if (url.indexOf("action=treffer") !== -1 && Object.keys(getSearchResults(doc)).length) {
		return "multiple";
	}
}

function getSearchResults(doc) {
	var results = {}
	
	var rows = ZU.xpath(doc, '//div[@id="inhalt"]/form/table/tbody/tr');
	
	for (var i=0, n=rows.length; i<n; i++) {
		var columns = ZU.xpath(rows[i], './td');
		
		var href = ZU.xpath(columns[0], './a')[0].href;	
		var name = ZU.trimInternal(columns[0].textContent);
		name = name + " \"" + cleanTitle(columns[1]) +"\"";
		
		results[href] = name;
	}
	return results;
}



var labelMap = {
	"AN": "applicationNumber",
	"AB": "abstractNote",
};

function cleanTitle(value) {
	var titles = value.textContent.split(/\[[A-Z]{2}\]/);

	if (titles.length < 2) {
		return "";
	}
	var title = ZU.trimInternal(titles[1]);
	if (title == title.toUpperCase()) {
		title = ZU.capitalizeTitle(title, true);
	}
	return title;
}

function cleanName(name, inventors) {
	name = ZU.trimInternal(name);
	if (name == "") return "";
	
	var parts = name.split(",");

	parts = parts.map(
		function(part) {
			part = ZU.trimInternal(part);
			if (part.toUpperCase() == part) {
				part = ZU.capitalizeTitle(part, true);
			}
			return part;
		}
	);

	// Last is always country code, so only return first part if there are only two
	// if second part starts with a number it is a postal code and first part is 
	// eithe a company name or a name without delimiter between last and given name
	if (parts.length <= 2 || parts[1].match(/^[0-9]/)) {
		if (inventors) {
			name = parts[0].split(/ /);
			return name.shift()+", "+name.join(" ");
		} else {
			return parts[0];
		}
	} else {
		return parts[0]+", "+parts[1];
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("patent");

	var ipcs = [];

	var rows = ZU.xpath(doc, '//table[@class="ergebnis"]/tbody/tr');
	
	for (var i=0, n=rows.length; i<n; i++) {
		var columns = ZU.xpath(rows[i], './td');

		if (columns.length == 4) {
			var label = columns[2].textContent;
			var value = columns[3];
		} else if (columns.length == 3) {
			var label = columns[1].textContent;
			var value = columns[2];			
		}
		if (!value) continue;
		
		//Z.debug("label: " + label);
		//Z.debug("value: " + value.textContent);
		
		switch(label) {
			case "TI":
				newItem.title = cleanTitle(value);
			break;
			case "IN":
				var names = value.textContent.split(";");
				names.forEach(
					function(name) {
						name = cleanName(name, true);
						if (name != "") {
							newItem.creators.push(ZU.cleanAuthor(name, "inventor", true));
						}
					}
				)
			break;
			case "PA":
				var names = [];
				value.textContent.split(";").forEach(
					function(name) {
						name = cleanName(name, false);
						if (name != "") {
							names.push(name);
						}
					}
				)
				newItem.assignee = names.join("; ");
			break;
			case "ICM":
			case "ICS":
				var ipc = ZU.xpathText(value, './a');
				ipc = ipc.split(",");
				ipc.forEach(
					function(name) {
						name = ZU.trimInternal(name);
						if (name) {
							ipcs.push(name);
						}
					}
				);
			break;
			case "PUB":
				var date = value.textContent.replace(/\s+/g, '').split(".");
				newItem.date = date[2]+"-"+date[1]+"-"+date[0];
			break;
			case "AD":
				var date = value.textContent.replace(/\s+/g, '').split(".");
				newItem.filingDate = date[2]+"-"+date[1]+"-"+date[0];
			break;
			default:
				if (labelMap[label]) {
					newItem[labelMap[label]] = ZU.trimInternal(value.textContent);
				}
		}
	}

	var pn = url.match(/\bdocid=([^&#]*)/)[1];
	
	newItem.url = "http://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid="+pn;
	
	newItem.patentNumber = pn.replace(/^([A-Z]{2})[0]*(.*)$/,"$1$2");

	// some entries (especially JP and RU patents) have no titles listed in DepatisNet
	// use the patentnumber instead for these entries
	if (!newItem.title) {
		newItem.title = newItem.patentNumber;
	}

	newItem.extra = "IPC: " + ipcs.join("; ");

	newItem.attachments.push({
		title: "DEPATISnet patent record",
		document: doc
	});
	
	var pages = ZU.xpathText(doc, '//table[@class="ergebnis"]/caption[1]');
	pages = pages.match(/(Seiten|Pages):\s*([0-9]+)/)[2];

	if (pages > 0) {
		var pdfurl = "https://register.dpma.de/pdfschrift/"+pn+".pdf?dpi=300";
		
		newItem.attachments.push({
			title: newItem.patentNumber,
			url: pdfurl,
			mimeType: "application/pdf"
		});
	}

	newItem.complete();
}

function doWeb(doc, url) {

	if (detectWeb(doc, url) == "multiple"){

		var results = getSearchResults(doc);

		Z.selectItems(results, 
			function (items) {
				if (!items) return true;

				var urls = [];
				for (var j in items) {
					urls.push(j);
				}
				ZU.processDocuments(urls, scrape);
			}
		);
	} else {
		scrape(doc, url);	
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=DE000004446098C2",
		"items": [
			{
				"itemType": "patent",
				"title": "Elektrischer Verbinder mit Abschirmung",
				"creators": [
					{
						"firstName": "Jacques",
						"lastName": "Longueville",
						"creatorType": "inventor"
					},
					{
						"firstName": "Gerhard",
						"lastName": "Meyer",
						"creatorType": "inventor"
					}
				],
				"date": "1998-11-26",
				"accessDate": "CURRENT_TIMESTAMP",
				"applicationNumber": "4446098",
				"assignee": "Philips Patentverwaltung GmbH; Siemens AG",
				"extra": "IPC: H01R 23/68; H01R 4/24; H01R 13/648; H01R 13/652",
				"filingDate": "1994-12-22",
				"libraryCatalog": "DEPATISnet",
				"patentNumber": "DE4446098C2",
				"url": "http://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=DE000004446098C2",
				"attachments": [
					{
						"title": "DEPATISnet patent record"
					},
					{
						"title": "DE4446098C2",
						"mimeType": "application/pdf"
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
		"url": "https://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=EP000000871998A1",
		"items": [
			{
				"itemType": "patent",
				"title": "Elektrischer Verbinder Mit Abschirmung",
				"creators": [
					{
						"firstName": "Jacques",
						"lastName": "Longueville",
						"creatorType": "inventor"
					},
					{
						"firstName": "Gerhard",
						"lastName": "Meyer",
						"creatorType": "inventor"
					}
				],
				"date": "1998-10-21",
				"accessDate": "CURRENT_TIMESTAMP",
				"applicationNumber": "95942705",
				"assignee": "Koninkl Philips Electronics Nv; Philips Patentverwaltung; Siemens Ag",
				"extra": "IPC: H01R 12/16",
				"filingDate": "1995-12-20",
				"libraryCatalog": "DEPATISnet",
				"patentNumber": "EP871998A1",
				"url": "http://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=EP000000871998A1",
				"attachments": [
					{
						"title": "DEPATISnet patent record"
					},
					{
						"title": "EP871998A1",
						"mimeType": "application/pdf"
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
		"url": "https://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=AR000000047789A1",
		"items": [
			{
				"itemType": "patent",
				"title": "Sistema De Inyeccion De Odorizante En El Gas Natural",
				"creators": [],
				"issueDate": "2006-02-22",
				"abstractNote": "[XX] Un sistema de inyeccion de odorizante en el gas natural, para inyectar odorizante en un conducto de gas natural, que incluye un conducto de derivacion, un tanque de odorizante, un medidor de caudal, una válvula de control y un controlador acoplado para comunicarse con el medidor de caudal y con la válvula de control. El conducto de derivacion incluye una entrada que está en comunicacion fluida con una seccion corriente abajo del conducto de gas, y una salida que está en comunicacion fluida con una seccion corriente abajo del conducto de gas. El tanque de odorizante, la válvula de control y el medidor de caudal están dispuestos en el conducto de derivacion. El medidor de caudal detecta una característica de una corriente de fluido que lo atraviesa y genera una senal de flujo de fluido correspondiente. El controlador está programado para operar la válvula de control en base a la senal de flujo de fluido recibida del medidor de caudal.",
				"applicationNumber": "P 050100188",
				"assignee": "Fisher Controls Int",
				"extra": "IPC: F17D 5/02; F17D 1/04; F17D 3/12; G01M 3/28; F17D 5/00",
				"filingDate": "2005-01-19",
				"patentNumber": "AR47789A1",
				"url": "http://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=AR000000047789A1",
				"attachments": [
					{
						"title": "DEPATISnet patent record"
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
		"url": "https://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=JP002007522283A",
		"items": [
			{
				"itemType": "patent",
				"title": "JP2007522283A",
				"creators": [],
				"date": "2007-08-09",
				"accessDate": "CURRENT_TIMESTAMP",
				"applicationNumber": "2006551227",
				"extra": "IPC: C10L 3/10",
				"filingDate": "2005-01-18",
				"libraryCatalog": "DEPATISnet",
				"patentNumber": "JP2007522283A",
				"url": "http://depatisnet.dpma.de/DepatisNet/depatisnet?action=bibdat&docid=JP002007522283A",
				"attachments": [
					{
						"title": "DEPATISnet patent record"
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