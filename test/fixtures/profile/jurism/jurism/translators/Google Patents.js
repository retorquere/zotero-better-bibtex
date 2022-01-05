{
	"translatorID": "d71e9b6d-2baa-44ed-acb4-13fe2fe592c0",
	"label": "Google Patents",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?patents\\.google\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-13 08:27:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


/* 
   Test cases for new interface does not work within Scaffold
   Thus, one has to test them outside.
   
   Another test case:
   https://patents.google.com/patent/US20090197681A1/en?q=networks&q=G06Q30%2f02
 
*/


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	// The subtree changes from multiple search results to a single result
	// when clicking on one entry or back to the search results, and thus
	// we have to monitor this.
	Z.monitorDOMChanges(ZU.xpath(doc, '//search-app')[0]);

	// Plural with "s" vs. singular without
	if (ZU.xpathText(doc, '//search-app/search-results')) {
		return "multiple";
	}
	if (ZU.xpathText(doc, '//search-app/search-result')) {
		return "patent";
	}
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var urlParts = url.split('/?');
		var jsonUrl = urlParts[0] + '/xhr/query?url=' + encodeURIComponent(urlParts[1]);
		//Z.debug(jsonUrl);
		ZU.doGet(jsonUrl, function(text) {
			var json = JSON.parse(text);
			var results = json.results.cluster[0].result;
			var selectResults = {};
			for (let i=0; i<results.length; i++) {
				selectResults[i] = ZU.cleanTags(results[i].patent.title);
			}
			Zotero.selectItems(selectResults, function(items) {
				if (!items) return true;
				for (var i in items) {
					let resultUrl = urlParts[0] + '/patent/' + results[i].patent.publication_number;
					scrapeJson(results[i].patent, resultUrl);
				}
			});
		});
	} else {
		// Some old urls miss the language part, which we have to add before
		// calling other urls.
		var includeLanguageCode = url.match(/\/patent\/[^\/\?#]+\/[a-z][a-z]\b/);
		if (!includeLanguageCode) {
			url = url.replace(/(\/patent\/[^\/\?#]+)\b/, "$1/en");
		}
		var xhrUrl = url.replace('/patent/', '/xhr/result?id=patent/');
		ZU.doGet(xhrUrl, function(text) {
			//Z.debug(text);
			var parser = new DOMParser();
			var doc = parser.parseFromString(text, "text/html");
			scrape(doc, url);
		});
	}
}

function scrape(doc, url) {
	var metadata = doc.querySelectorAll('*[itemprop]');
	var json = {};
	for (let i=0; i<metadata.length; i++) {
		let label = metadata[i].getAttribute('itemprop');
		// We stop before going into the publications, related entries etc.
		if (label=='description' || label=='pubs') break;
		let value = microdataValue(metadata[i], true);
		if (label && value) {
			if (metadata[i].getAttribute('repeat')==='') {
				if (!json[label]) json[label] = [];
				json[label].push(value);
			} else {
				// don't overwrite values
				if (!json[label]) json[label] = value;
				//else Z.debug(label)
			}
		}
	}
	scrapeJson(json, url, doc);
}


function microdataValue(propertyNode, firstCall) {
	if (propertyNode.hasAttribute("itemscope") && firstCall) {
		var metadata = propertyNode.querySelectorAll('*[itemprop]');
		var innerJson = {};
		for (let i=0; i<metadata.length; i++) {
			let label = metadata[i].getAttribute('itemprop');
			let value = microdataValue(metadata[i], false);
			innerJson[label] = value;
		}
		return innerJson;
	}
	switch (propertyNode.tagName.toLowerCase()) {
		case "meta":
			return propertyNode.getAttribute("content");
			break;
		case "audio":
		case "embed":
		case "iframe":
		case "img":
		case "source":
		case "track":
		case "video":
			return propertyNode.getAttribute("src");
			break;
		case "a":
		case "area":
		case "link":
			return propertyNode.getAttribute("href");
			break;
		case "object":
			return propertyNode.getAttribute("data");
			break;
		case "data":
		case "meter":
			return propertyNode.getAttribute("value");
			break;
		case "time":
			return propertyNode.getAttribute("datetime");
			break;
		case "span"://non-standard, but can occur
			if (propertyNode.childNodes.length > 1 && propertyNode.getAttribute("content")) {
				return propertyNode.getAttribute("content");
				break;
			}
		default:
			return propertyNode.textContent;
	}
}


function scrapeJson(json, url, doc) {
	//Z.debug(json);
	var item = new Zotero.Item('patent');
	item.title = ZU.cleanTags(json.title).replace(/\.\s*$/, '');
	if (json.inventor) {
		if (typeof json.inventor === 'string') json.inventor = [json.inventor];
		for (let i=0; i<json.inventor.length; i++) {
			item.creators.push(ZU.cleanAuthor(json.inventor[i], 'inventor'));
		}
	}
	item.issueDate = json.publicationDate || json.publication_date;
	item.filingDate = json.filingDate || json.filing_date;
	item.patentNumber = json.publicationNumber || json.publication_number;
	if (json.assigneeOriginal && !(typeof json.assigneeOriginal === 'string')) {
		item.assignee = json.assigneeOriginal.join(', '); // or assigneeCurrent
	} else {
		item.assignee = json.assigneeOriginal || json.assignee;
	}
	item.applicationNumber = json.applicationNumber;
	// This status is sometimes not what would be expected
	//if (json.legalStatusIfi) item.legalStatus = json.legalStatusIfi.status;
	item.country = json.countryCode;
	if (item.country) item.issuingAuthority = getPatentOffice(item.country);
	item.language = json.primaryLanguage;
	
	// Keywords
	if (json.priorArtKeywords) {
		for (let i=0; i<json.priorArtKeywords.length; i++) {
			item.tags.push(json.priorArtKeywords[i]);
		}
	}
	
	// Abstract
	if (json.abstract) {
		item.abstractNote = json.abstract.content;
	} else if (doc) {
		item.abstractNote = attr(doc, 'meta[name="description"]', 'content');
	}
	
	// Classifications
	if (json.cpcs) {
		var classifications = [];
		for (let i=0; i<json.cpcs.length; i++) {
			if (json.cpcs[i].Leaf && !json.cpcs[i].cpcs) {
				classifications.push(json.cpcs[i].Code + ': ' + json.cpcs[i].Description);
			}
		}
		if (classifications.length>0) {
			item.notes.push({note: "<h2>Classifications</h2>\n" + classifications.join("<br/>\n")});
		}
	}
	
	item.url = url;
	let pdfurl = json.pdfLink || json.pdf;
	if (pdfurl) {
		//Relative links don't resolve correctly in all cases. Let's make sure we're getting this all from 
		//the right place on the google API
		if (!pdfurl.includes("https://")) {
			pdfurl = "https://patentimages.storage.googleapis.com/" + pdfurl;
		}
		//Z.debug(pdfurl);
		item.attachments.push({
			url: pdfurl,
			title: "Fulltext PDF",
			mimeType: "application/pdf"
		});
	}
	
	item.complete();
}


function getPatentOffice(number) {
	//get the PatentOffice from the first two letters of the patentNumber
	var country;
	if (number.indexOf('EP') === 0) {
		country = 'European Union';
	} else if (number.indexOf('US') === 0) {
		country = 'United States';
	} else if (number.indexOf('WO') === 0) {
		country = 'World Intellectual Property Organization';
	} else if (number.indexOf('CN') === 0) {
		country = 'China';
	} else if (number.indexOf('CA') === 0) {
		country = 'Canada';
	} else if (number.indexOf('DE') === 0) {
		country = 'Germany';
	}
	return country;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://patents.google.com/?q=book&oq=book",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US1065211",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US1065211/en",
				"accessDate": "2018-02-25 20:11:54",
				"assignee": "William T Brook",
				"patentNumber": "US1065211A",
				"issueDate": "1913-06-17",
				"country": "US",
				"title": "Bottle-stopper",
				"issuingAuthority": "United States",
				"filingDate": "1912-08-03 1912-08-03",
				"creators": [
					{
						"firstName": "William T.",
						"lastName": "Brook",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "bottle"
					},
					{
						"tag": "neck"
					},
					{
						"tag": "stopper"
					},
					{
						"tag": "wire"
					},
					{
						"tag": "yoke"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nB01L3/5021: Test tubes specially adapted for centrifugation purposes<br/>\nB65D39/04: Cup-shaped plugs or like hollow flanged members"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US1120656",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US1120656/en",
				"accessDate": "2018-02-25 20:19:00",
				"assignee": "Hunt Specialty Mfg Company",
				"patentNumber": "US1120656A",
				"issueDate": "1914-12-08",
				"country": "US",
				"title": "Push-pin",
				"issuingAuthority": "United States",
				"filingDate": "1914-01-14 1914-01-14",
				"creators": [
					{
						"firstName": "Jonathan A.",
						"lastName": "Hunt",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "end"
					},
					{
						"tag": "fig"
					},
					{
						"tag": "head"
					},
					{
						"tag": "pin"
					},
					{
						"tag": "push"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nF16B15/00: Nails; Staples<br/>\nY10T24/4696: Pin or separate essential cooperating device therefor having distinct head structure"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US7123498",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US7123498/en",
				"accessDate": "2018-02-25 20:23:20",
				"assignee": "International Business Machines Corp",
				"patentNumber": "US7123498B2",
				"issueDate": "2006-10-17",
				"language": "en",
				"country": "US",
				"applicationNumber": "US10964352",
				"title": "Non-volatile memory device",
				"issuingAuthority": "United States",
				"filingDate": "2004-10-12 2004-10-12",
				"creators": [
					{
						"firstName": "Hisatada",
						"lastName": "Miyatake",
						"creatorType": "inventor"
					},
					{
						"firstName": "Kohki",
						"lastName": "Noda",
						"creatorType": "inventor"
					},
					{
						"firstName": "Toshio",
						"lastName": "Sunaga",
						"creatorType": "inventor"
					},
					{
						"firstName": "Hiroshi",
						"lastName": "Umezaki",
						"creatorType": "inventor"
					},
					{
						"firstName": "Hideo",
						"lastName": "Asano",
						"creatorType": "inventor"
					},
					{
						"firstName": "Koji",
						"lastName": "Kitamura",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "memory"
					},
					{
						"tag": "bit"
					},
					{
						"tag": "cell"
					},
					{
						"tag": "line"
					},
					{
						"tag": "resistive"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nG11C11/16: Digital stores characterised by the use of particular electric or magnetic storage elements; Storage elements therefor using magnetic elements using elements in which the storage effect is based on magnetic spin effect"
					}
				],
				"abstractNote": "MRAM has read word lines WLR and write word line WLW extending in the y direction, write/read bit line BLW/R and write bit line BLW extending in the x direction, and the memory cells MC disposed at the points of the intersection of these lines. The memory MC includes sub-cells SC1 and SC2. The sub-cell SC1 includes magneto resistive elements MTJ1 and MTJ2 and a selection transistor Tr1, and the sub-cell SC2 includes magneto resistive elements MTJ3 and MTJ4 and a selection transistor Tr2. The magneto resistive elements MTJ1 and MTJ2 are connected in parallel, and the magneto resistive elements MTJ3 and MTJ4 are also connected in parallel. Further, the sub-cells SC1 and SC2 are connected in series between the write/read bit line BLW/R and the ground.",
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US4390992#v=onepage&q&f=false",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US4390992/en",
				"accessDate": "2018-02-25 20:26:31",
				"assignee": "US Department of Energy",
				"patentNumber": "US4390992A",
				"issueDate": "1983-06-28",
				"country": "US",
				"applicationNumber": "US06284151",
				"title": "Plasma channel optical pumping device and method",
				"issuingAuthority": "United States",
				"filingDate": "1981-07-17 1981-07-17",
				"creators": [
					{
						"firstName": "O'Dean P.",
						"lastName": "Judd",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "energy"
					},
					{
						"tag": "laser"
					},
					{
						"tag": "lasing"
					},
					{
						"tag": "medium"
					},
					{
						"tag": "sub"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nH01S3/091: Processes or apparatus for excitation, e.g. pumping using optical pumping"
					}
				],
				"abstractNote": "A device and method for optically pumping a gaseous laser using blackbody radiation produced by a plasma channel which is formed from an electrical discharge between two electrodes spaced at opposite longitudinal ends of the laser. A preionization device which can comprise a laser or electron beam accelerator produces a preionization beam which is sufficient to cause an electrical discharge between the electrodes to initiate the plasma channel along the preionization path. The optical pumping energy is supplied by a high voltage power supply rather than by the preionization beam. High output optical intensities are produced by the laser due to the high temperature blackbody radiation produced by the plasma channel, in the same manner as an exploding wire type laser. However, unlike the exploding wire type laser, the disclosed invention can be operated in a repetitive manner by utilizing a repetitive pulsed preionization device.",
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/?q=ordinateur&oq=ordinateur",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/EP1808414A1/fr?oq=water",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/EP1808414A1/fr?oq=water",
				"accessDate": "2018-02-25 20:45:06",
				"assignee": "Michel Billon",
				"patentNumber": "EP1808414A1",
				"issueDate": "2007-07-18",
				"language": "fr",
				"country": "EP",
				"applicationNumber": "EP20060447010",
				"title": "Installation pour le recyclage d'eaux sanitaires",
				"issuingAuthority": "European Union",
				"filingDate": "2006-01-16 2006-01-16",
				"creators": [
					{
						"firstName": "Michel",
						"lastName": "Billon",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "bowl"
					},
					{
						"tag": "comprises"
					},
					{
						"tag": "tank"
					},
					{
						"tag": "valve"
					},
					{
						"tag": "water"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nE03D5/003: Grey water flushing systems<br/>\nE03B1/04: Methods or layout of installations for water supply for domestic or like local supply<br/>\nE03B1/042: Details thereof, e.g. valves or pumps<br/>\nE03D5/006: Constructional details of cisterns for using greywater<br/>\nC02F2103/002: Grey water, e.g. from clothes washers, showers or dishwashers<br/>\nC02F2209/005: Processes using a programmable logic controller [PLC]<br/>\nC02F2209/42: Liquid level<br/>\nE03B2001/045: Greywater supply systems using household water<br/>\nE03B2001/047: Greywater supply systems using rainwater<br/>\nY02A20/108: <br/>\nY02A20/148: <br/>\nY02A20/304:"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/EP0011951A1/en?oq=water",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/EP0011951A1/en?oq=water",
				"accessDate": "2018-02-25 20:50:40",
				"assignee": "Merck Sharp & Dohme Corp",
				"patentNumber": "EP0011951A1",
				"issueDate": "1980-06-11",
				"language": "en",
				"country": "EP",
				"applicationNumber": "EP19790302482",
				"title": "Cold-water soluble tamarind gum, process for its preparation and its application in sizing textile warp",
				"issuingAuthority": "European Union",
				"filingDate": "1979-11-06 1979-11-06",
				"creators": [
					{
						"firstName": "Joseph S.",
						"lastName": "Racciato",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "cold"
					},
					{
						"tag": "cwstg"
					},
					{
						"tag": "tamarind"
					},
					{
						"tag": "tkp"
					},
					{
						"tag": "water"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nD06M15/01: Treating fibres, threads, yarns, fabrics, or fibrous goods made from such materials, with macromolecular compounds; Such treatment combined with mechanical treatment with natural macromolecular compounds or derivatives thereof<br/>\nC08B37/0087: Glucomannans or galactomannans; Tara or tara gum, i.e. D-mannose and D-galactose units, e.g. from Cesalpinia spinosa; Tamarind gum, i.e. D-galactose, D-glucose and D-xylose units, e.g. from Tamarindus indica; Gum Arabic, i.e. L-arabinose, L-rhamnose, D-galactose and D-glucuronic acid units, e.g. from Acacia Senegal or Acacia Seyal; Derivatives thereof"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US4748058",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US4748058/en",
				"accessDate": "2018-02-25 20:53:33",
				"assignee": "Craig Jr Chester L",
				"patentNumber": "US4748058A",
				"issueDate": "1988-05-31",
				"country": "US",
				"applicationNumber": "US07013056",
				"title": "Artificial tree",
				"issuingAuthority": "United States",
				"filingDate": "1987-02-10 1987-02-10",
				"creators": [
					{
						"firstName": "Chester L. Craig",
						"lastName": "Jr",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "limb"
					},
					{
						"tag": "pole"
					},
					{
						"tag": "ring"
					},
					{
						"tag": "support"
					},
					{
						"tag": "tree"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nA47G33/06: Artificial Christmas trees"
					}
				],
				"abstractNote": "An artificial tree assembly, and a tree constructed therefrom, are provided. The assembly comprises a collapsible three-piece pole; a base member formed by the bottom of a box for storing the tree assembly and including a pole support member secured thereto for supporting the pole; and a plurality of limb sections and interconnecting garlands. The limb-sections each comprise a central ring portion and a plurality of limb members extending radially outwardly from the central ring portions. The ring portions of the limb sections are stacked, when not in use, on the pole support member and are disposed, in use, along the length of pole in spaced relationship therealong. The garlands interconnect the limb portions so that as the ring portions are lifted, from the top, from the stacked positions thereof on the pole support member and slid along the pole, the garlands between adjacent limb section are tensioned, in turn, and thus serve to lift the next adjacent limb section until the tree is fully erected.",
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US5979603?oq=tree",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US5979603/en?oq=tree",
				"accessDate": "2018-02-25 20:55:32",
				"assignee": "Summit Specialties Inc",
				"patentNumber": "US5979603A",
				"issueDate": "1999-11-09",
				"language": "en",
				"country": "US",
				"applicationNumber": "US08369434",
				"title": "Portable tree stand having fiber composite platform",
				"issuingAuthority": "United States",
				"filingDate": "1995-01-06 1995-01-06",
				"creators": [
					{
						"firstName": "Ronald R.",
						"lastName": "Woller",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "fig"
					},
					{
						"tag": "fiber"
					},
					{
						"tag": "fibers"
					},
					{
						"tag": "foam"
					},
					{
						"tag": "mold"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nA01M31/02: Shooting stands<br/>\nA45F3/26: Hanging seats"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US2970959",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US2970959/en",
				"accessDate": "2018-02-25 20:57:47",
				"assignee": "Pan American Petroleum Corp",
				"patentNumber": "US2970959A",
				"issueDate": "1961-02-07",
				"country": "US",
				"title": "Composition and method for inhibiting scale",
				"issuingAuthority": "United States",
				"filingDate": "1958-06-17 1958-06-17",
				"creators": [
					{
						"firstName": "Loyd W.",
						"lastName": "Jones",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Google Patents PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "water"
					},
					{
						"tag": "cmc"
					},
					{
						"tag": "per"
					},
					{
						"tag": "scale"
					},
					{
						"tag": "sodium"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nC02F5/105: Treatment of water with complexing chemicals or other solubilising agents for softening, scale prevention or scale removal, e.g. adding sequestering agents using organic substances combined with inorganic substances<br/>\nY10S507/927: Well cleaning fluid"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US6239091",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US6239091/en",
				"accessDate": "2018-02-25 21:01:35",
				"assignee": "Lever Brothers Co",
				"patentNumber": "US6239091B1",
				"issueDate": "2001-05-29",
				"country": "US",
				"applicationNumber": "US09075548",
				"title": "Machine dishwashing compositions with a polymer having cationic monomer units",
				"issuingAuthority": "United States",
				"filingDate": "1998-05-11 1998-05-11",
				"creators": [
					{
						"firstName": "Alla",
						"lastName": "Tartakovsky",
						"creatorType": "inventor"
					},
					{
						"firstName": "Joseph Oreste",
						"lastName": "Carnali",
						"creatorType": "inventor"
					},
					{
						"firstName": "John Robert",
						"lastName": "Winters",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Google Patents PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "water"
					},
					{
						"tag": "invention"
					},
					{
						"tag": "acid"
					},
					{
						"tag": "alkyl"
					},
					{
						"tag": "preferably"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nC11D3/3796: Amphoteric polymers; Zwitterionic polymers<br/>\nC11D3/0073: Anticorrosion compositions<br/>\nC11D3/3719: Polyamides; Polyimides<br/>\nC11D3/3723: Polyamines, polyalkyleneimines<br/>\nC11D3/3769: (Co)polymerised monomers containing nitrogen, e.g. carbonamides, nitriles, amines<br/>\nC11D3/3776: Heterocyclic compounds, e.g. lactam<br/>\nC23F11/173: Macromolecular compounds"
					}
				],
				"abstractNote": "A detergent or rinse aid composition which reduces spotting and filming on glassware cleaned in an automatic dishwashing machine is described. The composition contains an effective amount of a water soluble cationic or amphoteric polymer having at least one monomer unit having a cationic charge over a portion of the pH range of about 2 to about 11 in the wash or rinse cycle.",
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://patents.google.com/patent/US20110172136",
		"items": [
			{
				"itemType": "patent",
				"url": "https://patents.google.com/patent/US20110172136/en",
				"accessDate": "2018-02-25 21:04:06",
				"assignee": "Rhodia Operations Sas",
				"patentNumber": "US20110172136A1",
				"issueDate": "2011-07-14",
				"language": "en",
				"country": "US",
				"applicationNumber": "US13071376",
				"title": "Detergent composition with hydrophilizing soil-release agent and methods for using same",
				"issuingAuthority": "United States",
				"filingDate": "2011-03-24 2011-03-24",
				"creators": [
					{
						"firstName": "Tobias Johannes",
						"lastName": "Fütterer",
						"creatorType": "inventor"
					},
					{
						"firstName": "Lawrence Alan",
						"lastName": "HOUGH",
						"creatorType": "inventor"
					},
					{
						"firstName": "Robert Lee",
						"lastName": "Reierson",
						"creatorType": "inventor"
					}
				],
				"attachments": [
					{
						"title": "Google Patents PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "alkyl"
					},
					{
						"tag": "cotton"
					},
					{
						"tag": "group"
					},
					{
						"tag": "oil"
					},
					{
						"tag": "soil"
					}
				],
				"notes": [
					{
						"note": "<h2>Classifications</h2>\nC11D3/0036: Soil deposition preventing compositions; Antiredeposition agents<br/>\nC11D1/342: Phosphonates; Phosphinates; Phosphonites<br/>\nC11D1/345: Phosphates; Phosphites<br/>\nC11D11/0017: \"Soft\" surfaces, e.g. textiles<br/>\nC11D3/361: Phosphonates, phosphinates, phosphonites<br/>\nC11D3/362: Phosphates, phosphites<br/>\nC11D3/3784: (Co)polymerised monomers containing phosphorus"
					}
				],
				"abstractNote": "Laundry detergent compositions that provide soil release benefits to all fabric comprising an organophosphorus soil release agents and optional non-cotton secondary soil release agents. The present invention further relates to a method for providing soil release benefits to cotton fabric by contacting cotton articles with a water soluble and/or dispersible organophosphorus material. The contacting can be during washing or by pretreating by applying the composition directly to stains or by presoaking the clothing in the composition prior to washing. The present invention further relates to providing soil release benefits to all fabric in the laundry wash load in the presence of a bleaching agent.",
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
