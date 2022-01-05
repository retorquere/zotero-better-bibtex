{
	"translatorID": "930d49bc-44a1-4c22-9dde-aa6f72fb11e5",
	"label": "Cornell LII",
	"creator": "Bill McKinney",
	"target": "^https?://www\\.law\\.cornell\\.edu/supct/.+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-02-09 12:09:10"
}

function detectWeb(doc, url) {
	var liiRegexp = /\/supct\/html\/.+/
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


function scrape(doc, url) {

	var caselawCourt = "U.S. Supreme Court";
	var caselawJurisdiction = "Federal";
	var caselawSourceReporter = "U.S.";
	var caselawSourceVolume = "___";
	var caselawSourceStartPage = "___";
	var caselawParallelSourceVolume = "___";
	var caselawParallelSourceStartPage = "___";
	var caselawParallelSourceReporter = "___";
	var caselawDecisionYear = "";
	
	var newItem = new Zotero.Item("case");
	newItem.url = doc.location.href;
	newItem.language = "en-us";
	newItem.court = "U.S. Supreme Court";
	newItem.reporter = "U.S.";
	
	/*
	// LII provides a bunch of meta tags to harvest - left this here for future use
	//associateMeta(newItem, metaTags, "DOCKET", "caselawDocket");
	//associateMeta(newItem, metaTags, "PARTY1", "caselawParty1");
	//associateMeta(newItem, metaTags, "PARTY2", "caselawParty2");
	//associateMeta(newItem, metaTags, "ARGDATE", "caselawArguedDate");
	//associateMeta(newItem, metaTags, "DECDATE", "dateDecided");
	//associateMeta(newItem, metaTags, "ACTION", "caselawCourtAction");
	*/
	var casename;
	if (casename = ZU.xpathText(doc, '//meta[@name="CASENAME"]/@content')){
	newItem.title = casename;
	newItem.caseName= casename;
	var tmpCasename = newItem.caseName;
	tmpCasename = Zotero.Utilities.capitalizeTitle(tmpCasename.toLowerCase(), true);
	tmpCasename = tmpCasename.replace("V.", "v.");
	newItem.caseName = tmpCasename;
	newItem.shortTitle = tmpCasename; 
	}
	
	var history;
	if (history = ZU.xpathText(doc, '//meta[@name="COURTBELOW"]/@content')){
		newItem.history = history;
	}

	// judge
	var j = ZU.xpathText(doc, '//meta[contains(@name,"AUTHOR")]/@content');
	if (j) {
		// Some entries the AUTHOR meta tag content is empty, this makes zotero unhappy, adding a default
		newItem.creators.push({lastName:j ? j : "Author Not Provided", creatorType:"judge", fieldMode:true});
	}

	// group meta tags
	var tags = ZU.xpath(doc, '//meta[contains(@name,"GROUP")]/@content');
	for (var i in tags) {
		var value =tags[i].textContent;
			newItem.tags.push(value);		
	}
	
	// parse year out of decision date
	var decdateField =  ZU.xpathText(doc, '//meta[contains(@name,"DECDATE")]/@content');   
	if (decdateField ) {
		var decisionYearRegex = /(\w+)\s+(\d+),\s+(\d+)/
		var decisionDateMatch = decisionYearRegex.exec(decdateField);
		var dy;
		var dm;
		var dd;
		if (decisionDateMatch ) {
			dm = decisionDateMatch[1];
			dd = decisionDateMatch[2];
			dy = decisionDateMatch [3];
			caselawDecisionYear = dy;
			newItem.dateDecided = dy + " " + dm + " " + dd;
		}
	}

	// create attachment to pdf
	var dyRegex = /^(.+)\/html\/(.+)(\.Z\w+)\.html$/;
	var dyMatch = dyRegex.exec(newItem.url);
	if (dyMatch) {
		var pdfUrl = dyMatch[1]+"/pdf/"+dyMatch[2]+"P"+dyMatch[3];
		newItem.attachments.push({url:pdfUrl, title:"PDF version", mimeType:"application/pdf", downloadable:true});
	}

	// parse disposition
	var dis = doc.getElementsByTagName("DISPOSITION");
	if (dis.length > 0) {
		var tmpDis = dis[0].innerHTML;
		tmpDis = tmpDis.replace(/\s+/g, " ");
		newItem.title = newItem.title + " (" +	tmpDis + ")";	
		newItem.caseName= newItem.caseName + " (" +	tmpDis + ")";	
	}
	
	// parse citation into parts so that bluebook can be constructed
	var cite = doc.getElementsByTagName("CASENUMBER");
	if (cite.length > 0) {
			var citeRegex = /([0-9]+)\s+U\.S\.\s+([0-9]+)/;
			var citeMatch = citeRegex.exec(cite[0].innerHTML);
			if (citeMatch) {
				caselawSourceVolume = citeMatch[1];
				newItem.reporterVolume = citeMatch[1];
				caselawSourceStartPage = citeMatch[2];
				newItem.firstPage = citeMatch[2];
			}
	}
	
	// look for offcite span element
	var spanTags = doc.getElementsByTagName("span");
	if (spanTags.length > 0) {
		for (var i=0; i<spanTags.length; i++) {
			if (spanTags[i].className == "offcite") {
				var citeRegex = /([0-9]+)\s+U\.S\.\s+([0-9]+)/;
				var citeMatch = citeRegex.exec(spanTags[i].innerHTML);
				if (citeMatch) {
					caselawSourceVolume = citeMatch[1];
					newItem.reporterVolume = citeMatch[1];
					caselawSourceStartPage = citeMatch[2];
					newItem.firstPage = citeMatch[2];
				}
				break;	
			}
		}
	}
	
	// bluebook citation	
	var bbCite = newItem.shortTitle + ", " + 
		caselawSourceVolume + " " + 
		caselawSourceReporter + " " + 
		caselawSourceStartPage;
	// paralell cite	
	if (caselawParallelSourceVolume != "___") {
		bbCite = bbCite + ", " + caselawParallelSourceVolume +
		" " + caselawParallelSourceReporter + " " +
		caselawParallelSourceStartPage;
	}	
	// jurisdiction and year
	bbCite = bbCite + " (" + caselawDecisionYear + ")";
	// closing period
	bbCite = "Bluebook citation: " + bbCite + ".";
	newItem.notes.push({note:bbCite});
	
	// parse out publication notice
	var notice = doc.getElementsByTagName("NOTICE");
	if (notice .length > 0) {
		var tmpNotice= notice [0].innerHTML;
		tmpNotice= tmpNotice.replace(/\s+/g, " ");
		newItem.notes.push({note:tmpNotice});		
	}
	
	newItem.complete();
}

function doWeb(doc, url) {
	//sample search result URL:
	//http://www.law.cornell.edu/supct/search/display.html?terms=citizens&url=/supct/html/94-1340.ZS.html
	var liiRegexp = /\/supct\/html\/.+/
	if (liiRegexp.test(url)) {
		scrape(doc, url);
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
			Zotero.Utilities.processDocuments(urls, scrape, function () {});
		});
	}
		
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.law.cornell.edu/supct/html/01-618.ZD1.html",
		"items": [
			{
				"itemType": "case",
				"creators": [
					{
						"lastName": "Breyer",
						"creatorType": "judge",
						"fieldMode": true
					}
				],
				"notes": [
					{
						"note": "Bluebook citation: Eldred v. Ashcroft, 537 U.S. 186 (2003)."
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PDF version",
						"mimeType": "application/pdf",
						"downloadable": true
					}
				],
				"url": "http://www.law.cornell.edu/supct/html/01-618.ZD1.html",
				"language": "en-us",
				"court": "U.S. Supreme Court",
				"reporter": "U.S.",
				"title": "Eldred v. Ashcroft (Breyer, J., dissenting)",
				"caseName": "Eldred v. Ashcroft (Breyer, J., dissenting)",
				"shortTitle": "Eldred v. Ashcroft",
				"history": "ON WRIT OF CERTIORARI TO THE UNITED STATES COURT OF APPEALS FOR THE DISTRICT OF COLUMBIA CIRCUIT",
				"dateDecided": "2003 January 15",
				"reporterVolume": "537",
				"firstPage": "186",
				"libraryCatalog": "Cornell LII",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.law.cornell.edu/supct/search/index.html?query=animals&scope=onlysyllabi",
		"items": "multiple"
	}
]
/** END TEST CASES **/