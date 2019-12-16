{
	"translatorID": "176948f7-9df8-4afc-ace7-4c1c7318d426",
	"label": "ESpacenet",
	"creator": "Sebastian Karcher and Aurimas Vinckevicius",
	"target": "^https?://worldwide\\.espacenet\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-07 20:15:16"
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

function detectWeb(doc, url) {
	if (url.includes("searchResults?")
		&& getSearchResults(doc).length) {
			return "multiple";
	}
	
	Z.monitorDOMChanges(doc.getElementById("pagebody"), {childList: true});
	
	if (url.indexOf("biblio") !== -1
		&& getTitle(doc)) {
		return "patent";
	}
}

function getSearchResults(doc) {
	return ZU.xpath(doc,'//span[@class="resNumber"]/a[starts-with(@id,"publicationId")]');
}

function getTitle(doc) {
	var title = ZU.xpathText(doc, '//div[@id="pagebody"]/h3[1]');
	if (title) {
		if (title.toUpperCase() == title) {
			title = ZU.capitalizeTitle(title, true);
		}
		return title.trim();
	}
}

//locale labels from URL
var i18n = {
	/** German **/
	de_EP: {
		"Erfinder:": "Inventor(s):",
		"Anmelder:": "Applicant(s):",
		"Klassifikation:": "Classification:",
		"Internationale": "international",
		"Europäische": "Euro",
		"Anmeldenummer:": "Application number:",
		"Prioritätsnummer(n):": "Priority number(s):",
		"Bookmark zur Seite": "Page bookmark"
	},
	/** French **/
	fr_EP: {
		"Inventeur(s)": "Inventor(s):",
		"Demandeur(s)": "Applicant(s):",
		"Classification:": "Classification:",
		"internationale": "international",
		"européenne": "Euro",
		"Numéro de demande": "Application number:",
		"Numéro(s) de priorité:": "Priority number(s):",
		"Signet": "Page bookmark"
	}
};

function initLocale(url) {
	var m = url.match(/[?&]locale=([a-zA-Z_]+)/);
	if (m && i18n[m[1]]) {
		i18n = i18n[m[1]];	
	} else {
		i18n = {};	//English
	}
}

function L(label, fromEN) {
	if (fromEN) {
		for (var l in i18n) {
			if (i18n[l] == label) {
				return l;
			}
		}
		return label;
	}
	return i18n[label] || label;
}

var labelMap = {
	"Application number:": "applicationNumber",
	"Priority number(s):": "priorityNumbers",
	"Page bookmark": "url"
};

function applyValue(newItem, label, value) {
	if (value && labelMap[label]) {
		newItem[labelMap[label]] = value;
	}
}

//clean up names list and call callback with a clean name
function cleanNames(names, callback) {
	if (names) {
		//Z.debug(names)
		names = names.replace(/\[[a-zA-Z]*\]/g, "").trim(); // to eliminate country code in square brackets after inventors' and applicants' names
		names = ZU.capitalizeTitle(names.toLowerCase(), true);
		names = names.split(/\s*;\s*/);
		for (var j=0, m=names.length; j<m; j++) {
			callback(names[j].replace(/\s*,$/, ''));
		}
	}
}

function scrape(doc) {
	var newItem = new Zotero.Item("patent");
	newItem.title = getTitle(doc);

	var rows = ZU.xpath(doc,
		'//tr[@class="noPrint" or ./th[@class="printTableText"]]');

	for (var i=0, n=rows.length; i<n; i++) {
		var label = L(rows[i].firstElementChild.textContent.trim());
		var value = rows[i].firstElementChild.nextElementSibling;
		if (!value) continue;
		switch (label) {
			case "Inventor(s):":
				cleanNames(ZU.xpathText(value, './span[@id="inventors"]'), 
					function(name) {
						newItem.creators.push(
							ZU.cleanAuthor(name.replace(/,?\s/, ', '),	//format displayed is LAST FIRST MIDDLE, so we add a comma after LAST
								"inventor", true));
					});
			break;
			case "Applicant(s):":
				var assignees = [];
				cleanNames(ZU.xpathText(value, './span[@id="applicants"]'),
				  	function(name) {
				  		assignees.push(name);
				  	});
				newItem.assignee = assignees.join('; ');
			break;
			case "Classification:":
				var CIB = ZU.trimInternal(
					ZU.xpathText(value,
						'.//td[preceding-sibling::th[contains(text(),"'
						+ L("international", true) + '")]]') || '');
				var ECLA = ZU.trimInternal(ZU.xpathText(value,
						'.//td[preceding-sibling::th[contains(text(),"'
						+ L("Euro", true) + '")]]/a', null, '; ') || '');
				if (CIB || ECLA) {
					newItem.extra = [];
					if (CIB) newItem.extra.push('CIB: ' + CIB);
					if (ECLA) newItem.extra.push('ECLA: ' + ECLA);
					newItem.extra = newItem.extra.join('\n');
				}
			break;
			case "Page bookmark":
				applyValue(newItem, label, value.firstElementChild.href)
			break;
			case "Application number:":
				applyValue(newItem, label, ZU.xpathText(value, './text()[1]'));
			break;
			default:
				applyValue(newItem, label, ZU.trimInternal(value.textContent));
		}
	}

	var date = ZU.xpathText(doc, '//div[@id="pagebody"]/h1[1]');
	if (date && (date = date.match(/\d{4}-\d{2}-\d{2}/))) {
		newItem.date = date[0];
	}
	newItem.patentNumber = ZU.xpathText(doc, '//span[@class="sel"]');
	newItem.abstractNote = ZU.trimInternal(
		ZU.xpathText(doc, '//p[@class="printAbstract"]') || '');

	newItem.attachments.push({
		title:"Espacenet patent record",
		document: doc
	});

	newItem.complete();
}

function doWeb(doc, url) {
	initLocale(url);

	if (detectWeb(doc, url) == "multiple"){
		var hits = {};
		var results = getSearchResults(doc);
		for (var i=0, n=results.length; i<n; i++) {
			hits[results[i].href] = results[i].textContent.trim();
		}

		Z.selectItems(hits, function(items) {
			if (!items) return true;

			var urls = [];
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);	
	}
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
				"extra": "CIB: G06F3/033; G09G5/08",
				"patentNumber": "WO2012054443 (A1)",
				"priorityNumbers": "US20100394879P 20101020 ; US20100394013P 20101018",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=20120426&DB=worldwide.espacenet.com&locale=en_EP&CC=WO&NR=2012054443A1&KC=A1&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record"
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
				"extra": "CIB: G06Q20/00",
				"patentNumber": "US2012101951 (A1)",
				"priorityNumbers": "US201113172170 20110629 ; US20100406097P 20101022",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=20120426&DB=worldwide.espacenet.com&locale=en_EP&CC=US&NR=2012101951A1&KC=A1&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record"
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
				"abstractNote": "Un tube de choc de secteur conique (202) génère un secteur d'ondes de choc sphériques, divergentes, classiques qui émanent radialement d'une source ponctuelle effective d'une manière non focalisante mais hautement directionnelle. Un front de compression (208) ayant un rayon de courbure égal à sa séparation par rapport au sommet du tube de choc de secteur définit le bord d'attaque d'un ''choc de coiffe'' (306) d'une intensité que l'on peut prédire et commander de manière précise. Un front de raréfaction de fuite (314) du choc de coiffe (306) est défini par la diffraction provoquée par le bord (312) du tube (202) de choc de secteur. Le front de raréfaction (314) érode progressivement le choc de coiffe (306) lorsque celui-ci est projeté vers le calcul cible (128) définissant la largeur et la durée du choc de coiffe de propagation (306).; Le choc de coiffe (306) pulvérise uniformément le calcul cible (128) en appliquant une quantité relativement petite d'ondes de choc par rapport au nombre plus grand (d'un ordre de grandeur deux fois plus grand) de chocs utilisés dans des procédés connus par ondes de choc ellipsoïdales focalisées.",
				"applicationNumber": "AU19890028143 19891108",
				"assignee": "William S Filler",
				"extra": "CIB: A61B17/22; A61B17/225; G10K11/32; G10K15/04; (IPC1-7): A61B17/22",
				"patentNumber": "AU2814389 (A)",
				"priorityNumbers": "US19870118325 19871109",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=19890601&DB=EPODOC&locale=de_EP&CC=AU&NR=2814389A&KC=A&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record"
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
				"abstractNote": "Un tube de choc de secteur conique (202) génère un secteur d'ondes de choc sphériques, divergentes, classiques qui émanent radialement d'une source ponctuelle effective d'une manière non focalisante mais hautement directionnelle. Un front de compression (208) ayant un rayon de courbure égal à sa séparation par rapport au sommet du tube de choc de secteur définit le bord d'attaque d'un ''choc de coiffe'' (306) d'une intensité que l'on peut prédire et commander de manière précise. Un front de raréfaction de fuite (314) du choc de coiffe (306) est défini par la diffraction provoquée par le bord (312) du tube (202) de choc de secteur. Le front de raréfaction (314) érode progressivement le choc de coiffe (306) lorsque celui-ci est projeté vers le calcul cible (128) définissant la largeur et la durée du choc de coiffe de propagation (306).; Le choc de coiffe (306) pulvérise uniformément le calcul cible (128) en appliquant une quantité relativement petite d'ondes de choc par rapport au nombre plus grand (d'un ordre de grandeur deux fois plus grand) de chocs utilisés dans des procédés connus par ondes de choc ellipsoïdales focalisées.",
				"applicationNumber": "AU19890028143 19891108",
				"assignee": "William S Filler",
				"extra": "CIB: A61B17/22; A61B17/225; G10K11/32; G10K15/04; (IPC1-7): A61B17/22",
				"patentNumber": "AU2814389 (A)",
				"priorityNumbers": "US19870118325 19871109",
				"url": "https://worldwide.espacenet.com/publicationDetails/biblio?FT=D&date=19890601&DB=EPODOC&locale=fr_EP&CC=AU&NR=2814389A&KC=A&ND=4",
				"attachments": [
					{
						"title": "Espacenet patent record"
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
