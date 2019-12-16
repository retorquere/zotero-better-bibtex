{
	"translatorID": "5ae63913-669a-4792-9f45-e089a37de9ab",
	"label": "BAILII",
	"creator": "Bill McKinney",
	"target": "^https?://www\\.bailii\\.org(/cgi\\-bin/markup\\.cgi\\?doc\\=)?/\\w+/cases/.+",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-11-15 22:45:28"
}

/*
 * Puzzles
 *
 * http://www.bailii.org/ew/cases/EWHC/Ch/2000/1564.html
 * (This case lists a "neutral citation number" in the judgment text
 * itself, although as a High Court decision prior to 2002, under
 * OSCOLA it should have no neutral citation ... ?)
 */

var reports = {
	"AC": "Appeal Cases",
	"QB": "Queen's Bench",
	"Ch": "Chancery",
	"Fam": "Family",
	"P": "Privy Council",
	"All ER": "All England Law Reports",
	"ER": "English Reports",
	"BCC": "British Company Law Cases",
	"CMLR": "Common Market Law Reports",
	"Cr App R": "Criminal Appeal Reports",
	"Cr App R (S)": "Criminal Appeal Reports (Sentencing)",
	"CLY": "Current Law Yearbook",
	"EG": "Estates Gazette",	
	"EGLR": "Estates Gazette Law Reports",	
	"ECR": "European Court Reports",
	"EHRR": "European Human Rights Reports",
	"FLR": "Family Law Reports",
	"FTLR": "Financial Times Law Reports",
	"FSR": "Fleet Street Reports",
	"HLR": "Housing Law Reports",
	"ICR": "Industrial Cases Reports",
	"IRLR": "Industrial Relations Law Reports",
	"JPL": "Journal of Planning Law",
	"JP": "Justice of the Peace Reports",
	"L & TR": "Landlord and Tenant Reports",
	"LS Gaz": "Law Society Gazette",
	"Lloyd’s Rep": "Lloyd’s Law Reports",
	"Lloyd's Rep": "Lloyd’s Law Reports",
	"LGR": "Local Government Reports",
	"NPC": "New Property Cases",
	"P & CR": "Property and Compensation Reports",
	"P&CR": "Property and Compensation Reports",
	"PTSLR": "Public and Third Sector Law Reports",
	"RPC": "Reports of Patent Cases",
	"RTR": "Road Traffic Reports",
	"RVR": "Rating and Valuation Reporter",
	"SLT": "Scots Law Times",
	"SCLR": "Scottish Civil Law Reports",
	"SCCR": "Scottish Criminal Case Reports ",
	"SC": "Session Cases",
	"STC": "Simon’s Tax Cases",
	"STI": "Simon’s Tax Intelligence",
	"TC": "Tax Cases",
	"WLR": "Weekly Law Reports",
	"WTLR": "Wills & Trusts Law Reports"
}

var dict = {
	"England and Wales Court of Appeal (Civil Division) Decisions": {
		value: "Court of Appeal|Civil Division",
		start: 2001,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales Court of Appeal (Criminal Division) Decisions": {
		value: "Court of Appeal|Criminal Division",
		start: 2001,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Administrative Court) Decisions": {
		value: "High Court|Administrative Court",
		start: 2001,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Admiralty Division) Decisions": {
		value: "High Court|Admiralty Division",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Chancery Division) Decisions": {
		value: "High Court|Chancery Division",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Commercial Court) Decisions": {
		value: "High Court|Commercial Court",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Court of Protection) Decisions": {
		value: "High Court|Court of Protection",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Senior Court Costs Office) Decisions": {
		value: "High Court|Senior Court Costs Office",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Exchequer Court) Decisions": {
		value: "High Court|Exchequer Court",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Family Division) Decisions": {
		value: "High Court|Family Division",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (King's Bench Division) Decisions": {
		value: "High Court|King's Bench Division",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Mercantile Court) Decisions": {
		value: "High Court|Mercantile Court",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Patents Court) Decisions": {
		value: "High Court|Patents Court",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Queen's Bench Division) Decisions": {
		value: "High Court|Queen's Bench Division",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales High Court (Technology and Construction Court) Decisions": {
		value: "High Court|Technology and Construction Court",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales Patents County Court Decisions": {
		value: "County Court|Patents",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales Magistrates' Court (Family)": {
		value: "Magistrates' Court|Family",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales County Court (Family)": {
		value: "County Court|Family",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales Care Standards Tribunal Decisions": {
		value: "Care Standards Tribunal",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"England and Wales Lands Tribunal": {
		value: "Lands Tribunal",
		start: 2002,
		jurisdiction: "gb;england.and.wales"
	},
	"Supreme Court of Ireland Decisions": {
		value: "Supreme Court",
		start: 2005,
		jurisdiction: "ie"
	},
	"Irish Court of Criminal Appeal": {
		value: "Court of Criminal Appeal",
		start: 2005,
		jurisdiction: "ie"
	},
	"High Court of Ireland Decisions": {
		value: "High Court",
		start: 2005,
		jurisdiction: "ie"
	},
	"Irish Competition Authority Decisions": {
		value: "Competition Authority",
		start: 2005,
		jurisdiction: "ie"
	},
	"Irish Information Commissioner's Decisions": {
		value: "Information Commissioner",
		start:2005 ,
		jurisdiction: "ie"
	},
	"Irish Data Protection Commission Case Studies": {
		value: "Data Protection Commission",
		start: 2005,
		jurisdiction: "ie"
	},
	"Court of Appeal in Northern Ireland Decisions": {
		value: "Court of Appeal",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"Crown Court for Northern Ireland Decisions": {
		value: "Crown Court",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"High Court of Justice in Northern Ireland Chancery Division Decisions": {
		value: "High Court|Chancery Division",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"High Court of Justice in Northern Ireland Family Division Decisions": {
		value: "High Court|Family Division",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"High Court of Justice in Northern Ireland Queen's Bench Division Decisions": {
		value: "High Court|Queen's Bench Division",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"High Court of Justice in Northern Ireland Master's Decisions": {
		value: "High Court|Masters",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"Fair Employment Tribunal Northern Ireland Decisions": {
		value: "Fair Employment Tribunal",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"Industrial Tribunals Northern Ireland Decisions": {
		value: "Industrial Tribunals",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"Northern Ireland - Social Security and Child Support Commissioners' Decisions": {
		value: "Social Security and Child Support Commissioners",
		start: 2002,
		jurisdiction: "gb;northern.ireland"
	},
	"Scottish Court of Session Decisions": {
		value: "Court of Session",
		start: 2005,
		jurisdiction: "gb;scotland"
	},
	"Scottish High Court of Justiciary Decisons": {
		value: "High Court",
		start: 2005,
		jurisdiction: "gb;scotland"
	},
	"Scottish Sheriff Court Decisions": {
		value: "Sheriff Court",
		start: 2005,
		jurisdiction: "gb;scotland"
	},
	//"English Reports (on CommonLII)": {
	//    value: "United Kingdom|English Reports",
	//    start: ,
	//    jurisdiction: "gb"
	//},
	"Privy Council Decisions": {
		value: "Privy Council",
		start: 2001,
		jurisdiction: "gb"
	},
	"United Kingdom House of Lords Decisions": {
		value: "House of Lords",
		start: 2001,
		jurisdiction: "gb"
	},
	"United Kingdom Supreme Court": {
		value: "Supreme Court",
		start: 2001,
		jurisdiction: "gb"
	},

	"Upper Tribunal (Administrative Appeals Chamber)": {
		value: "Upper Tribunal|Administrative Appeals Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"Upper Tribunal (Tax and Chancery Chamber)": {
		value: "Upper Tribunal|Tax and Chancery Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"Upper Tribunal (Immigration and Asylum Chamber)": {
		value: "Upper Tribunal|Immigration and Asylum Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"Upper Tribunal (Lands Chamber)": {
		value: "Upper Tribunal|Lands Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"First-tier Tribunal (General Regulatory Chamber)": {
		value: "First-tier Tribunal|General Regulatory Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"First-tier Tribunal (Health Education and Social Care Chamber)": {
		value: "First-tier Tribunal|Health Education and Social Care Chamber",
		start: 2002,
		jurisdiction: "gb"
	},
	"First-tier Tribunal (Tax)": {
		value: "First-tier Tribunal|Tax",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Competition Appeals Tribunal": {
		value: "Competition Appeals Tribunal",
		start: 2002,
		jurisdiction: "gb"
	},
	"Nominet UK Dispute Resolution Service": {
		value: "Nominet Dispute Resolution Service",
		start: 2002,
		jurisdiction: "gb"
	},
	"Special Immigrations Appeals Commission": {
		value: "Special Immigrations Appeals Commission",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Employment Appeal Tribunal": {
		value: "Employment Appeal Tribunal",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Financial Services and Markets Tribunals Decisions": {
		value: "Financial Services and Markets Tribunals",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Asylum and Immigration Tribunal": {
		value: "Asylum and Immigration Tribunal",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Information Tribunal including the National Security Appeals Panel": {
		value: "Information Tribunal and National Security Appeals Panel",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom Special Commissioners of Income Tax Decisions": {
		value: "Special Commissioners of Income Tax",
		start: 2002,
		jurisdiction: "gb"
	},
	"UK Social Security and Child Support Commissioners' Decisions": {
		value: "Social Security and Child Support Commissioners",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom VAT &amp; Duties Tribunals Decisions": {
		value: "VAT and Duties Tribunals",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom VAT &amp; Duties Tribunals (Customs) Decisions": {
		value: "VAT and Duties Tribunals|Customs",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom VAT &amp; Duties Tribunals (Excise) Decisions": {
		value: "VAT and Duties Tribunals|Excise",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom VAT &amp; Duties Tribunals (Insurance Premium Tax) Decisions": {
		value: "VAT and Duties Tribunals|Insurance Premium Tax",
		start: 2002,
		jurisdiction: "gb"
	},
	"United Kingdom VAT &amp; Duties Tribunals (Landfill Tax) Decisions": {
		value: "VAT and Duties Tribunals|Landfill Tax",
		start: 2002,
		jurisdiction: "gb"
	},
	"Court of Justice of the European Communities (including Court of First Instance Decisions)": {
		value: "Court of Justice of the European Communities",
		start: 0,
		jurisdiction: "ec.lex"
	},
	"European Court of Human Rights": {
		value: "European Court of Human Rights",
		start: 0,
		jurisdiction: "coe.int"
	}
}

/*
 * It starts here.
*/

var liiRegexp= /^http:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/([^\/]+)\/.+/
// Not used
// var liiTocRegexp= /^http:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/.+\/toc[^\/]+\.html/
var liiCaseRegexp= /^http:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/([^\/]+)\/.+\.html/

function detectWeb(doc, url) {
	var liiRegexp= /^https?:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/.+\.html/
	if (liiRegexp.test(url)) {
		return "case";
	} else {
		var aTags = doc.getElementsByTagName("a");
		for (var i=0; i<aTags.length; i++) {
			if (liiRegexp.test(aTags[i].href)) {
				return "multiple";
			}
		}
	}
}

function processItem(citeinfo, container_title, count, isNeutralCite, doc) {
	var item = new  Zotero.Item("case");
	item.itemID = "" + count;
	var info = citeinfo[container_title];
	if (container_title && !isNeutralCite) {
		item.reporter = container_title;
		if (info.collection_number) {
			item.yearAsVolume = info.collection_number;
		}
	}
	if (isNeutralCite) {
		item.attachments.push({title:"BaiLII transcript", type:"text/html",
							  url:doc.location.href});
	}
	if (info.jurisdiction) {
		item.jurisdiction = info.jurisdiction;
	}
	if (info.issue) {
		item.issue = info.issue;
	}
	item.title = info.title;
	item.volume = info.volume;
	item.firstPage = info.page;
	item.number = info.number;
	item.date = info.date;
	item.url = info.url;
	item.court = info.court;
	
	return item;
};

function scrape(doc) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var title = doc.title;
	title = title.replace(/\[.*/, "");
	// exceptional force
	title = Zotero.Utilities.capitalizeTitle(title, true);

	var m;
	var number = false;
	m = title.match(/(.*)\s+-\s+([\/0-9]+)$/)
	if (m) {
		title = m[1];
		number = m[2];
	}

	m = doc.title.match(/.*\((\d+)(?:st|rd|nd|th)*\s+(.*?)[ ,]+(\d+)\)$/);
	var date = false;
	if (m) {
		date = m.slice(1).join(" ");
	}
	
	var reporterCode = false;
	m = doc.location.href.match(liiCaseRegexp);
	if (m) {
		reporterCode = m[1];
	}

	var jurisdiction = "gb";
	var start = 0;

	var court = "";

	var tdTag = false;
	var tableTags = doc.getElementsByTagName("table");
	for (var i = 0, ilen = tableTags.length; i < ilen; i += 1) {
		var trTags = tableTags[i].getElementsByTagName("tr");
		for (var j = 0, jlen = trTags.length; j < jlen; j += 1) {
			var tdTags = trTags[j].getElementsByTagName("td");
			for (var k = 0, klen = tdTags.length; k < klen; k += 1) {
				if (Zotero.Utilities.getTextContent(tdTags[k]).indexOf("You are here") > -1) {
					var tdTag = tdTags[k];
					break;
				}
			}
		}
	}

   	var str = "";
	if (tdTag) {
		var aTags = tdTag.getElementsByTagName("a");
		if (aTags && aTags.length) {
			var aTag = aTags[aTags.length - 1];
			var court_description = Zotero.Utilities.getTextContent(aTag);
			if (dict[court_description]) {
				court = dict[court_description].value;
				jurisdiction = dict[court_description].jurisdiction;
				start = dict[court_description].start;
			} else {
				court = court_description;
			}
		}
		
		var str = Zotero.Utilities.getTextContent(tdTag);
		var cites = str.split("\n");
		var useme = true;
		for (var i = cites.length - 1; i > -1; i += -1) {
			cites[i] = cites[i].replace(/^(?:\s*|,)/,"").replace(/(?:\s*|,)$/, "");
			if (cites[i] === "Cite as:") {
				useme = false;
			}
			if (!cites[i] || !useme) {
				cites = cites.slice(0, i).concat(cites.slice(i + 1));
			}
		}

		// Okay, great, that works, although we're getting some cruft.
		// This: http://www.bailii.org/eu/cases/ECHR/1980/1.html
		// Yields this: [1980] 2 EHRR 439,(1980) 2 EHRR 439,2 EHRR 439,[1980] ECHR 1
		var citeinfo = {};
		/*

		  citeinfo = {
			container_title: {
			  "court": court_description,
			  "title": casename,
			  "date": date,
			  "collection-number": collection_number,
			  "volume": volume,
			  "page": page
			}
		  }
		 */
		for (var i = 0, ilen = cites.length; i < ilen; i += 1) {
			//Zotero.debug("XXX TO MATCH: "+cites[i]);
			var m = cites[i].match(/^(?:([\(\[][0-9]+[\)\]])\s+)*(?:([0-9\(\)]+)\s+)*([^0-9_]+)(?:\s+\(*([ _A-Za-z]+)\)*)*(?:\s+([0-9]+))*(?:\s+\([a-zA-Z]+\))*$/);
			if (m) {
				var collection_number = "";
				if (m[1] && m[1][0] === "[") {
					collection_number = m[1].slice(1, m[1].length - 1);
				}
				var container_title = m[3];
				if (reports[container_title]) {
					container_title = reports[container_title];
				}
				if (container_title === "CSIH" && court) {
					court += "|Inner House"
				} else if (container_title === "CSOH" && court) {
					court += "|Outer House"
				}
				var volume = m[2];
				var issue = "";
				if (volume) {
					var mm = volume.match(/([0-9]+)\(([0-9]+)\)/);
					if (mm) {
						volume = mm[1];
						issue = mm[2];
					}
				}
				if (!number) {
					var number = m[4];
					if (number && number.match("_")) {
						number = number.replace("_", "/", "g");
					} else {
						number = false;
					}
				}
				if (!citeinfo[container_title]) {
					citeinfo[container_title] = {};
				}
				if (collection_number) {
					citeinfo[container_title].collection_number = collection_number;
				}
				citeinfo[container_title].volume = volume;
				citeinfo[container_title].issue = issue;
				citeinfo[container_title].number = number;
				citeinfo[container_title].date = date;
				citeinfo[container_title].author_supplement = m[4]
				citeinfo[container_title].page = m[5];

				citeinfo[container_title].jurisdiction = jurisdiction;

				citeinfo[container_title].title = title;
				citeinfo[container_title].url = doc.location.href;
				citeinfo[container_title].court = court;
			}
		}

		// Now cast the actual items
		// With a function that processes an item, this works:
		var itemlst = [];
		var idlst = [];
		count = 1;
		// We'll also need to know whether we have more than one item,
		// and what the year of the item is. If before the neutral cite
		// watershed, and if has some stuff here.
		var total = 0;
		for (var key in citeinfo) {
			total += 1;
		}
		var year = 0;
		var m = date ? date.match(/.*([0-9]{4}).*/) : null;
		if (m) {
			year = parseInt(m[1], 10);
		}
		var hasSetAttachment = false;
		for (var key in citeinfo) {
			isNeutralCite = false;
			if (reporterCode === key.replace(/ .*/, "")) {
				isNeutralCite = true;
				if (year < start && total > 1) {
					continue;
				}
			}
			var item = processItem(citeinfo, key, count, isNeutralCite, doc);
			itemlst.push(item);
			idlst.push(item.itemID);
			if (isNeutralCite) {
				hasSetAttachment = true;
			}
			count += 1;
		}
		if (!hasSetAttachment && itemlst.length) {
			itemlst[0].attachments.push({title:"BaiLII transcript", type:"text/html",
							  url:doc.location.href});
		}
		for (var i = 0, ilen = itemlst.length; i < ilen; i += 1) {
			for (var j = 0, jlen = idlst.length; j < jlen; j += 1) {
				if (idlst[j] === itemlst[i].itemID) {
					continue;
				}
				itemlst[i].seeAlso.push(idlst[j]);
			}
			itemlst[i].complete();
		}
	}
	
	// Later
	//var panel = doc.getElementsByTagName("PANEL");
	//if (panel.length > 0) {
	//	var tmp = panel[0].innerHTML;
	//	newItem.creators.push({lastName:tmp, creatorType:"judge", fieldMode:true});	
	//}
}

function doWeb(doc, url) {
	var liiRegexp= /https?:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/.+\.html/
	if (liiRegexp.test(url)) {
		scrape(doc);
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, liiRegexp);
		var urls = new Array();
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				urls.push(i);
			}
			Zotero.Utilities.processDocuments(urls, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
		"items": [
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "29",
				"itemID": "1",
				"jurisdiction": "ec.lex",
				"reporter": "Common Market Law Reports",
				"reporterVolume": "1",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [
					{
						"title": "BaiLII transcript",
						"type": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"2",
					"3",
					"4",
					"5",
					"6"
				]
			},
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "1",
				"itemID": "2",
				"jurisdiction": "ec.lex",
				"reporter": "Fleet Street Reports",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"3",
					"4",
					"5",
					"6"
				]
			},
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "242",
				"itemID": "3",
				"jurisdiction": "ec.lex",
				"reporter": "CEC",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2",
					"4",
					"5",
					"6"
				]
			},
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "1321",
				"itemID": "4",
				"jurisdiction": "ec.lex",
				"reporter": "Bus LR",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2",
					"3",
					"5",
					"6"
				]
			},
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "8",
				"itemID": "5",
				"jurisdiction": "ec.lex",
				"reporter": "ECDR",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2",
					"3",
					"4",
					"6"
				]
			},
			{
				"itemType": "case",
				"caseName": "Football Association Premier League & Ors (Freedom to Provide Services)",
				"creators": [],
				"dateDecided": "04 October 2011",
				"court": "Court of Justice of the European Communities",
				"firstPage": "629",
				"itemID": "6",
				"jurisdiction": "ec.lex",
				"reporter": "All ER (EC)",
				"url": "https://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"yearAsVolume": "2012",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2",
					"3",
					"4",
					"5"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bailii.org/eu/cases/EUECJ/2007/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "Donoghue v Stevenson",
				"creators": [],
				"dateDecided": "26 May 1932",
				"court": "House of Lords",
				"firstPage": "31",
				"itemID": "1",
				"jurisdiction": "gb",
				"reporter": "SC (HL)",
				"reporterVolume": "1932",
				"url": "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
				"attachments": [
					{
						"title": "BaiLII transcript",
						"type": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"2",
					"3"
				]
			},
			{
				"itemType": "case",
				"caseName": "Donoghue v Stevenson",
				"creators": [],
				"dateDecided": "26 May 1932",
				"court": "House of Lords",
				"firstPage": "100",
				"itemID": "2",
				"jurisdiction": "gb",
				"reporter": "UKHL",
				"url": "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
				"yearAsVolume": "1932",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"3"
				]
			},
			{
				"itemType": "case",
				"caseName": "Donoghue v Stevenson",
				"creators": [],
				"dateDecided": "26 May 1932",
				"court": "House of Lords",
				"firstPage": "562",
				"itemID": "3",
				"jurisdiction": "gb",
				"reporter": "Appeal Cases",
				"url": "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
				"yearAsVolume": "1932",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bailii.org/uk/cases/UKSC/2019/41.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "Miller, R (on the Application of) v The Prime Minister",
				"creators": [],
				"dateDecided": "24 September 2019",
				"court": "Supreme Court",
				"firstPage": "41",
				"itemID": "1",
				"jurisdiction": "gb",
				"reporter": "UKSC",
				"url": "https://www.bailii.org/uk/cases/UKSC/2019/41.html",
				"yearAsVolume": "2019",
				"attachments": [
					{
						"title": "BaiLII transcript",
						"type": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"2",
					"3"
				]
			},
			{
				"itemType": "case",
				"caseName": "Miller, R (on the Application of) v The Prime Minister",
				"creators": [],
				"dateDecided": "24 September 2019",
				"court": "Supreme Court",
				"firstPage": "1143",
				"itemID": "2",
				"jurisdiction": "gb",
				"reporter": "Scots Law Times",
				"reporterVolume": "2019",
				"url": "https://www.bailii.org/uk/cases/UKSC/2019/41.html",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"3"
				]
			},
			{
				"itemType": "case",
				"caseName": "Miller, R (on the Application of) v The Prime Minister",
				"creators": [],
				"dateDecided": "24 September 2019",
				"court": "Supreme Court",
				"firstPage": "589",
				"itemID": "3",
				"jurisdiction": "gb",
				"reporter": "Weekly Law Reports",
				"reporterVolume": "3",
				"url": "https://www.bailii.org/uk/cases/UKSC/2019/41.html",
				"yearAsVolume": "2019",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1",
					"2"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bailii.org/eu/cases/EUECJ/1963/R2662.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "NV Algemene Transport En Expeditie Onderneming Van Gend & Loos v Netherlands Inland Revenue Administration. (Procedure )",
				"creators": [],
				"dateDecided": "5 February 1963",
				"court": "Court of Justice of the European Communities",
				"firstPage": "105",
				"itemID": "1",
				"jurisdiction": "ec.lex",
				"reporter": "Common Market Law Reports",
				"url": "https://www.bailii.org/eu/cases/EUECJ/1963/R2662.html",
				"yearAsVolume": "1963",
				"attachments": [
					{
						"title": "BaiLII transcript",
						"type": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"2"
				]
			},
			{
				"itemType": "case",
				"caseName": "NV Algemene Transport En Expeditie Onderneming Van Gend & Loos v Netherlands Inland Revenue Administration. (Procedure )",
				"creators": [],
				"dateDecided": "5 February 1963",
				"court": "Court of Justice of the European Communities",
				"firstPage": "1",
				"itemID": "2",
				"jurisdiction": "ec.lex",
				"reporter": "European Court Reports",
				"url": "https://www.bailii.org/eu/cases/EUECJ/1963/R2662.html",
				"yearAsVolume": "1963",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"1"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bailii.org/ew/cases/Misc/2019/16.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "Bower V Brewdog Plc",
				"creators": [],
				"dateDecided": "23 May 2019",
				"court": "English and Welsh Courts - Miscellaneous",
				"firstPage": "16",
				"itemID": "1",
				"jurisdiction": "gb",
				"reporter": "EW Misc",
				"url": "https://www.bailii.org/ew/cases/Misc/2019/16.html",
				"yearAsVolume": "2019",
				"attachments": [
					{
						"title": "BaiLII transcript",
						"type": "text/html"
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
		"url": "https://www.bailii.org/cgi-bin/lucy_search_1.cgi?querytitle=re+baden",
		"items": "multiple"
	}
]
/** END TEST CASES **/
