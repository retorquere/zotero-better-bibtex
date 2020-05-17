{
	"translatorID": "176948f7-9df8-4afc-ace7-4c1c7318d426",
	"label": "ESpacenet",
	"creator": "Sebastian Karcher, Aurimas Vinckevicius, Philipp Zumstein",
	"target": "^https?://(worldwide|[a-z][a-z])\\.espacenet\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-12-08 21:20:32"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	ESpacenet translator - Copyright © 2011 Sebastian Karcher
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/


// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	// multiples are not working (easily) because the website
	// has to fully load before Zotero can extract its
	// metadata
	if (doc.getElementById("pagebody")) {
		Z.monitorDOMChanges(doc.getElementById("pagebody"), { childList: true });
	}
	if (doc.getElementById("application-content")) {
		Z.monitorDOMChanges(doc.getElementById("application-content"));
	}
	
	if ((url.includes("/biblio?") || url.includes("/publication/"))
		&& getTitle(doc)) {
		return "patent";
	}
	return false;
}


function getTitle(_doc) {
	var title = text('#pagebody>h3, #biblio-title-content');
	if (title) {
		if (title.toUpperCase() == title) {
			title = ZU.capitalizeTitle(title, true);
		}
		return title.trim();
	}
	return false;
}


// clean up names list and call callback with a clean name
function cleanNames(names, callback) {
	if (names) {
		// Z.debug(names)
		names = names.replace(/\[[a-zA-Z]*\]/g, "").trim(); // to eliminate country code in square brackets after inventors' and applicants' names
		names = ZU.capitalizeTitle(names.toLowerCase(), true);
		names = names.split(/\s*;\s*/);
		for (var j = 0, m = names.length; j < m; j++) {
			callback(names[j].replace(/\s*,$/, ''));
		}
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("patent");
	newItem.title = getTitle(doc);

	cleanNames(text('#inventors, #biblio-inventors-content'),
		function (name) {
			newItem.creators.push(
				ZU.cleanAuthor(name.replace(/,?\s/, ', '),	// format displayed is LAST FIRST MIDDLE, so we add a comma after LAST
					"inventor", true));
		});
	
	var assignees = [];
	cleanNames(text('#applicants, #biblio-applicants-content'),
		function (name) {
			assignees.push(name);
		});
	newItem.assignee = assignees.join('; ');
	
	var classifications = {
		ipc: [],
		cpc: []
	};
	var ipcClasses = doc.querySelectorAll('a.ipc, #biblio-international-content a');
	for (let ipc of ipcClasses) {
		classifications.ipc.push(ipc.textContent.replace(';', ''));
	}
	var cpcClasses = doc.querySelectorAll('a.classTT:not(.ipc), #biblio-cooperative-content a');
	for (let cpc of cpcClasses) {
		classifications.cpc.push(cpc.textContent.replace(';', ''));
	}
	var note = "<h1>Classifications</h1>\n<h2>IPC</h2>\n" + classifications.ipc.join('; ') + "<h2>CPC</h2>\n" + classifications.cpc.join('; ');
	newItem.notes.push({ note: note });

	var rows = ZU.xpath(doc, '//tr[@class="noPrint" or ./th[@class="printTableText"]]');

	var pn = text('#biblio-publication-number-content');
	if (pn) { // new design
		var datePnumber = pn.split('·');
		if (datePnumber.length == 2) {
			newItem.patentNumber = datePnumber[0];
		}
		newItem.issueDate = ZU.strToISO(datePnumber);
		var application = text('#biblio-application-number-content').split('·');
		if (application.length == 2) {
			newItem.applicationNumber = application[0];
			newItem.filingDate = application[1];
		}
		newItem.priorityNumbers = text('#biblio-priority-numbers-label ~ div');
	}
	else { // old design
		for (var i = 0, n = rows.length; i < n; i++) {
			var label = rows[i].firstElementChild.textContent.trim();
			var value = rows[i].firstElementChild.nextElementSibling;
			if (!value) continue;
			switch (label) {
				case "Page bookmark":
				case "Signet":
				case "Bookmark zur Seite":
					newItem.url = value.firstElementChild.href;
					break;
				case "Application number:":
				case "Numéro de demande":
				case "Anmeldenummer:":
					newItem.applicationNumber = ZU.xpathText(value, './text()[1]');
					break;
				case "Priority number(s):":
				case "Numéro(s) de priorité:":
				case "Prioritätsnummer(n):":
					newItem.priorityNumbers = ZU.trimInternal(value.textContent);
					break;
			}
		}
		
		var date = text('#pagebody>h1');
		if (date) {
			newItem.issueDate = ZU.strToISO(date);
		}
		newItem.patentNumber = text('span.sel');
	}
	
	newItem.abstractNote = ZU.trimInternal(
		text('p.printAbstract, #biblio-abstract-content') || '');

	newItem.attachments.push({
		title: "Espacenet patent record",
		url: url,
		snapshot: false
	});

	newItem.complete();
}

function doWeb(doc, url) {
	// only single items need to be handled
	scrape(doc, url);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://worldwide.espacenet.com/data/publicationDetails/biblio?DB=worldwide.espacenet.com&II=2&ND=3&adjacent=true&locale=en_EP&FT=D&date=20120426&CC=WO&NR=2012054443A1&KC=A1",
		"items": [
			{
				"itemType": "patent",
				"title": "Electronic Control Glove",
				"creators": [
					{
						"firstName": "Willie Lee Jr",
						"lastName": "Blount",
						"creatorType": "inventor"
					}
				],
				"issueDate": "2012-04-26",
				"abstractNote": "Many people active and inactive can't readily control their audio experience without reaching into a pocket or some other location to change a setting or answer the phone. The problem is the lack of convenience and the inaccessibility when the user is riding his motorcycle, skiing, bicycling, jogging, or even walking with winter gloves on, etc. The electronic control glove described here enables enhanced control over electronic devices wirelessly at all times from the user's fingertips. The glove is manufactured with electrical conducive materials along the fingers and the thumb, where contact with the thumb and finger conductive materials creates a closed circuit which is transmitted to a control device on the glove that can then wirelessly transmit messages to remote electronic devices such as cell phones, audio players, garage door openers, military hardware and software, in work environments, and so forth.",
				"applicationNumber": "WO2011US56657 20111018",
				"assignee": "Blue Infusion Technologies Llc; Blount Willie Lee Jr",
				"patentNumber": "WO2012054443 (A1)",
				"priorityNumbers": "US20100394879P 20101020 ; US20100394013P 20101018",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=20120426&DB=worldwide.espacenet.com&locale=en_EP&CC=WO&NR=2012054443A1&KC=A1&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nG06F3/033; G09G5/08<h2>CPC</h2>\nG06F3/014 (EP, KR); G08C17/02 (KR, US); H01H2009/0221 (EP, KR); H01H2203/0085 (EP, KR)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://worldwide.espacenet.com/data/publicationDetails/biblio?DB=worldwide.espacenet.com&II=4&ND=3&adjacent=true&locale=en_EP&FT=D&date=20120426&CC=US&NR=2012101951A1&KC=A1",
		"items": [
			{
				"itemType": "patent",
				"title": "Method and System for Secure Financial Transactions Using Mobile Communications Devices",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Li",
						"creatorType": "inventor"
					},
					{
						"firstName": "Yuri",
						"lastName": "Shakula",
						"creatorType": "inventor"
					},
					{
						"firstName": "Martin",
						"lastName": "Rodriguez",
						"creatorType": "inventor"
					}
				],
				"issueDate": "2012-04-26",
				"abstractNote": "The present invention employs public key infrastructure to electronically sign and encrypt important personal information on a mobile communications device (MCD), without disclosing private, personal information to the transaction counterparts and middleman, thus preserving highly elevated and enhanced security and fraud protection. In one embodiment, the present invention can use a mobile device identifier, such as a cell phone number or email address, for example, as an index/reference during the entire transaction, so that only the account holder and the account issuer know the underlying account number and other private information.",
				"applicationNumber": "US201113172170 20110629",
				"assignee": "Li Michael; Shakula Yuri; Rodriguez Martin",
				"patentNumber": "US2012101951 (A1)",
				"priorityNumbers": "US201113172170 20110629 ; US20100406097P 20101022",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=20120426&DB=worldwide.espacenet.com&locale=en_EP&CC=US&NR=2012101951A1&KC=A1&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nG06Q20/00<h2>CPC</h2>\nG06Q20/3223 (EP); G06Q20/3829 (EP)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://worldwide.espacenet.com/data/publicationDetails/biblio?locale=de_EP&II=9&FT=D&CC=AU&DB=EPODOC&NR=2814389A&date=19890601&ND=3&KC=A&adjacent=true",
		"items": [
			{
				"itemType": "patent",
				"title": "Eswl Employing Non-Focused Spherical-Sector Shock Waves",
				"creators": [
					{
						"firstName": "William S.",
						"lastName": "Filler",
						"creatorType": "inventor"
					}
				],
				"issueDate": "1989-06-01",
				"abstractNote": "A conical sector shock tube (202) generates a sector of a classical diverging spherical shock wave which emanates radially from an effective point source in a non-focusing but highly directional manner. A compression front (208) having a radius of curvature equal to its separation from the apex of the sector shock tube defines the leading edge of a ''cap shock'' (306) of accurately controllable and predictable intensity. A trailing rarefaction front (314) of the cap shock (306) is defined by the diffraction caused by the rim (312) of the sector shock tube (202). The rarefaction front (314) progressively erodes the cap shock (306) as it is projected toward the target calculus (128), defining the width and duration of the propagating cap shock (306). The cap shock (306) uniformly pulverizes the target calculus (128) in a comparatively small quantity of shock wave applications, as compared with the larger (two orders of magnitude greater) number of shots employed in known ellipsoidal focused shock wave methods.",
				"applicationNumber": "AU19890028143 19891108",
				"assignee": "William S Filler",
				"patentNumber": "AU2814389 (A)",
				"priorityNumbers": "US19870118325 19871109",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=19890601&DB=EPODOC&locale=de_EP&CC=AU&NR=2814389A&KC=A&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nA61B17/22; A61B17/225; G10K11/32; G10K15/04; A61B17/22<h2>CPC</h2>\nA61B17/225 (EP); G10K11/32 (EP); G10K15/043 (EP); A61B2017/22027 (EP)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://worldwide.espacenet.com/data/publicationDetails/biblio?locale=fr_EP&II=9&FT=D&CC=AU&DB=EPODOC&NR=2814389A&date=19890601&ND=3&KC=A&adjacent=true",
		"items": [
			{
				"itemType": "patent",
				"title": "Eswl Employing Non-Focused Spherical-Sector Shock Waves",
				"creators": [
					{
						"firstName": "William S.",
						"lastName": "Filler",
						"creatorType": "inventor"
					}
				],
				"issueDate": "1989-06-01",
				"abstractNote": "A conical sector shock tube (202) generates a sector of a classical diverging spherical shock wave which emanates radially from an effective point source in a non-focusing but highly directional manner. A compression front (208) having a radius of curvature equal to its separation from the apex of the sector shock tube defines the leading edge of a ''cap shock'' (306) of accurately controllable and predictable intensity. A trailing rarefaction front (314) of the cap shock (306) is defined by the diffraction caused by the rim (312) of the sector shock tube (202). The rarefaction front (314) progressively erodes the cap shock (306) as it is projected toward the target calculus (128), defining the width and duration of the propagating cap shock (306). The cap shock (306) uniformly pulverizes the target calculus (128) in a comparatively small quantity of shock wave applications, as compared with the larger (two orders of magnitude greater) number of shots employed in known ellipsoidal focused shock wave methods.",
				"applicationNumber": "AU19890028143 19891108",
				"assignee": "William S Filler",
				"patentNumber": "AU2814389 (A)",
				"priorityNumbers": "US19870118325 19871109",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=19890601&DB=EPODOC&locale=fr_EP&CC=AU&NR=2814389A&KC=A&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nA61B17/22; A61B17/225; G10K11/32; G10K15/04; A61B17/22<h2>CPC</h2>\nA61B17/225 (EP); G10K11/32 (EP); G10K15/043 (EP); A61B2017/22027 (EP)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://es.espacenet.com/publicationDetails/biblio?II=0&ND=3&adjacent=true&locale=es_ES&FT=D&date=20190830&CC=ES&NR=2723723T3&KC=T3#",
		"items": [
			{
				"itemType": "patent",
				"title": "Vehículo dirigido a dianas de células nerviosas",
				"creators": [
					{
						"firstName": "Andreas",
						"lastName": "Rummel",
						"creatorType": "inventor"
					},
					{
						"firstName": "Tanja",
						"lastName": "Weil",
						"creatorType": "inventor"
					},
					{
						"firstName": "Aleksandrs",
						"lastName": "Gutcaits",
						"creatorType": "inventor"
					}
				],
				"issueDate": "2019-08-30",
				"abstractNote": "Una proteína transportadora, que comprende una cadena pesada modificada de la neurotoxina que tiene el número de base de datos AAA23211 que está formada por el serotipo B de Clostridium botulinum, en donde el aminoácido en la posición glutamato 1191 se reemplaza por leucina.",
				"assignee": "Ipsen Bioinnovation Ltd",
				"patentNumber": "ES2723723 (T3)",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nA61K38/00; C07K14/195; C07K14/33<h2>CPC</h2>\nC07K14/33 (EP, US); C12N9/52 (EP, US); A61K38/00 (EP, US); C12Y304/24069 (EP, US); Y02A50/469 (EP, US); Y02A50/473 (EP, US)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://worldwide.espacenet.com/patent/search/family/068096681/publication/US2019311023A1?q=pn%3DUS2019311023A1",
		"items": [
			{
				"itemType": "patent",
				"title": "Automated Reference List Builder",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Burba",
						"creatorType": "inventor"
					},
					{
						"firstName": "Gerardo",
						"lastName": "Fratini",
						"creatorType": "inventor"
					},
					{
						"firstName": "Frank",
						"lastName": "Griessbaum",
						"creatorType": "inventor"
					}
				],
				"issueDate": "2019-10-10",
				"abstractNote": "A device for managing a reference list. The device includes one or more processors, which alone or in combination are configured to facilitate performing: (a) running one or more applications; (b) selecting the reference list; (c) monitoring activities in the one or more applications to identify citable processes; (d) receiving citable information from the one or more applications based on the citable processes; (e) determining a type of citable information received; and (f) modifying the reference list based on the type of citable information received.",
				"applicationNumber": "US201916372808A",
				"assignee": "Li Cor Inc",
				"filingDate": "2019-04-02",
				"patentNumber": "US2019311023A1",
				"priorityNumbers": "US201862654087P·2018-04-06; US201916372808A·2019-04-02",
				"attachments": [
					{
						"title": "Espacenet patent record",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h1>Classifications</h1>\n<h2>IPC</h2>\nG06F16/38; G06F17/21; G06F17/22; G06F17/24<h2>CPC</h2>\nG06F16/382 (US); G06F17/218 (US); G06F17/2205 (US); G06F17/2235 (EP); G06F17/24 (US); G06F17/241 (EP)"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
