{
	"translatorID": "b10bf941-12e9-4188-be04-f6357fa594a0",
	"label": "Old Bailey Online",
	"creator": "Adam Crymble & Sharon Howard",
	"target": "^https?://www\\.oldbaileyonline\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-12 23:37:03"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2018 Sharon Howard
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
// URLs
// trial: div=t18000115-12
// session: name=16900430
// OA: can use either name= or div=  !
// div/name excludes dir= pages in browse.jsp

function detectWeb(doc, url) {
	if (url.includes('browse.jsp')  && ( url.includes('div=OA') || url.includes('name=') ) ) {
		return "book";
	} else if (url.includes('browse.jsp')  && ( url.includes('div=') ) ) {
		return "case";
	} else if ( url.includes("search.jsp") &&  getSearchResults(doc, true)) {
		return "multiple";
	}
}

// to do:  not trials...
// div=f16740429-1 - front matter
// div=a16860520-1 - advertisements
// div=s16740717-1 - punishment summary
// div=o16751208-1 - supplementary material



function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li/p[@class="srchtitle"]/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

 

function scrape(doc, url) {

if (url.includes('browse.jsp')  && ( url.includes('div=OA') || url.includes('name=') ) ) {
		var newItem = new Zotero.Item("book");
	} else {
		var newItem = new Zotero.Item("case");
	}

	
	var trialTitle = ZU.xpathText(doc, '//div[@class="sessionsPaper"]/div[@class="sessions-paper-main-title"]');   // updated @class name
	
	
	
	newItem.url = url;
	
	var sessDate = ZU.xpathText(doc, '//div[@class="sessionsPaper"]/div[@class="sessions-paper-date"]'); // add session date, as the date is now in a gettable node
	
	newItem.date = ZU.strToISO(sessDate);
	
	if (newItem.itemType == "case" && trialTitle) {
 		if (trialTitle == trialTitle.toUpperCase()) {
  			newItem.title = ZU.capitalizeTitle(trialTitle, true);
   		} else {
      			newItem.title = trialTitle;
   		}
	} else if (newItem.itemType == "book") {
		newItem.title = trialTitle + " " + sessDate;
	}

	newItem.title = newItem.title.trim().replace(/[,.]+$/, "");
	if (!newItem.title) {
		newItem.title = "[no title]";
	}
	
	var referenceNo = ZU.xpathText(doc, '//div[@class="ob-panel"][1]/table[@class="ob-info-table"][1]/tbody/tr[th[contains(text(),"Reference")]]/td').trim(); // changed fetching Reference number
	
	newItem.extra = "Reference Number: " + referenceNo; // putting the ref number in the Extra field had a particular function, was it for Voyant? or the defunct DMCI plugin? retain it at least for now (non trials will want it anyway)
	
	if (newItem.itemType == "case") {
		newItem.docketNumber = referenceNo;
	}
	
	if (newItem.itemType == "book") {
		newItem.place = "London";
	}


// tags for trials

if (newItem.itemType == "case") {

// offence info is under sessions-paper-sub-title; verdicts/sentences under ob-info-table

	var off = ZU.xpath(doc, '//div[@class="sessionsPaper"]/div[@class="sessions-paper-sub-title"]/a');
	for (let o of off){
		newItem.tags.push(o.textContent)
	}

	var verdict = ZU.xpathText(doc, '//div[@class="ob-panel"]/table[@class="ob-info-table"][1]/tbody/tr[th[contains(text(),"Verdict")]]/td');

	if(verdict) {
		verdict = verdict.split(';');
		for (let v of verdict ) {
			newItem.tags.push(v)
		}
	}

	var sentence = ZU.xpathText(doc, '//div[@class="ob-panel"]/table[@class="ob-info-table"][1]/tbody/tr[th[contains(text(),"Sentence")]]/td');

	if(sentence) {
		sentence = sentence.split(';');
		for (let s of sentence ) {
			newItem.tags.push(s)
		}
	}
}

// use print-friendly URLs for snapshots

	var attachmentUrl = "https://www.oldbaileyonline.org/print.jsp?div=" + referenceNo;
	newItem.attachments.push({ url  : attachmentUrl,    title : "OBO Snapshot",    mimeType : "text/html" });

	newItem.complete();
}



// todo: replace save result set url

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
	} else if (url.includes('browse.jsp') && ( url.includes('div=') || url.includes('name=') ) )  {
		scrape(doc, url);
	}
}



/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.oldbaileyonline.org/search.jsp?form=custom&_divs_fulltext=animal&kwparse=and&_persNames_surname=&_persNames_given=&_persNames_alias=&_persNames_gender=&fromAge=&toAge=&_occupations_value=&_persNames_home=&_offences_offenceCategory_offenceSubcategory=&_offences_offenceDescription=&_verdicts_verdictCategory_verdictSubcategory=&_punishments_punishmentCategory_punishmentSubcategory=&_punishments_punishmentDescription=&_crimeDates_value=&_offences_crimeLocation=&_divs_div0Type_div1Type=&fromMonth=&fromYear=&toMonth=&toYear=&ref=&submit.x=0&submit.y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.oldbaileyonline.org/browse.jsp?div=t18000115-12",
		"items": [
			{
				"itemType": "case",
				"caseName": "Peter Asterbawd, Andrew Forsman",
				"creators": [],
				"dateDecided": "1800-01-15",
				"docketNumber": "t18000115-12",
				"extra": "Reference Number: t18000115-12",
				"url": "https://www.oldbaileyonline.org/browse.jsp?div=t18000115-12",
				"attachments": [
					{
						"title": "OBO Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": " Miscellaneous > fine"
					},
					{
						"tag": " Not Guilty"
					},
					{
						"tag": "Guilty > lesser offence"
					},
					{
						"tag": "Imprisonment > house of correction"
					},
					{
						"tag": "Theft"
					},
					{
						"tag": "burglary"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.oldbaileyonline.org/browse.jsp?div=OA17110421",
		"items": [
			{
				"itemType": "book",
				"title": "Ordinary's Account.  21st April 1711",
				"creators": [],
				"date": "1711-04-21",
				"extra": "Reference Number: OA17110421",
				"libraryCatalog": "Old Bailey Online",
				"place": "London",
				"url": "https://www.oldbaileyonline.org/browse.jsp?div=OA17110421",
				"attachments": [
					{
						"title": "OBO Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.oldbaileyonline.org/browse.jsp?name=OA17110421",
		"items": [
			{
				"itemType": "book",
				"title": "Ordinary's Account.  21st April 1711",
				"creators": [],
				"date": "1711-04-21",
				"extra": "Reference Number: OA17110421",
				"libraryCatalog": "Old Bailey Online",
				"place": "London",
				"url": "https://www.oldbaileyonline.org/browse.jsp?name=OA17110421",
				"attachments": [
					{
						"title": "OBO Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.oldbaileyonline.org/browse.jsp?name=17100418",
		"items": [
			{
				"itemType": "book",
				"title": "Old Bailey Proceedings.  18th April 1710",
				"creators": [],
				"date": "1710-04-18",
				"extra": "Reference Number: 17100418",
				"libraryCatalog": "Old Bailey Online",
				"place": "London",
				"url": "https://www.oldbaileyonline.org/browse.jsp?name=17100418",
				"attachments": [
					{
						"title": "OBO Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.oldbaileyonline.org/browse.jsp?id=t16780828-12&div=t16780828-12&terms=hog#highlight",
		"items": [
			{
				"itemType": "case",
				"caseName": "[no title]",
				"creators": [],
				"dateDecided": "1678-08-28",
				"docketNumber": "t16780828-12",
				"extra": "Reference Number: t16780828-12",
				"url": "https://www.oldbaileyonline.org/browse.jsp?id=t16780828-12&div=t16780828-12&terms=hog#highlight",
				"attachments": [
					{
						"title": "OBO Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Guilty"
					},
					{
						"tag": "Theft"
					},
					{
						"tag": "animal theft"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
