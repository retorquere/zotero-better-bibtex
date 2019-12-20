{
	"translatorID": "fc9e5c87-2a77-450c-8a05-d48c58dbca69",
	"label": "Westlaw",
	"creator": "DavidH",
	"target": "^.*westlaw.*",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 10,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-19 13:20:08"
}

var detectWeb = function (doc, url) {
	// Icon shows only for search results and law cases
	var head = ZU.xpathText(doc, '//title');
	if (!head) return;
	if (head.indexOf('| Cases |') != -1) {
		return "case";
	}
	if (head.indexOf('| Statutes |') != -1) {
		return "statute";
	}
	if (head.indexOf('| Regulations |') != -1) {
		return "regulation";
	}
}
function getXPathStr(attr, elem, path) {
	var res = ZU.xpath(elem, path);
	res = res.length ? res[0][attr] : '';
	return res ? res : '';
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	var NewItem = new Zotero.Item(type)
	/*if (type == "statute") {
		var Code = ZU.xpathText(doc, '//span[@id="codeSetName"]/text()')
		var Title = ZU.xpathText(doc, '//span[@id="titleDesc"]/text()')
		var Section = ZU.xpathText(doc, '//h2[@id="co_docHeaderTitleLine"]/@title')
		var effectiveDate = ZU.xpathText(doc, '//span[@id="effectiveDate"]/text()')
		var codeNum = Title.match(/([0-9]*[A-Z]?)(?=\.)/)[1]
		Section = Section.match(/(?:§ )([0-9A-Za-z\-\.]*)(?=\.\s)/)[1]
		//NewItem.title = "TEST"
		NewItem.codeNumber = codeNum
		NewItem.datePublished = governmentDate(effectiveDate)
		Zotero.debug(codeNum)
		if (statuteCompilations[Code]) {
			NewItem.code = statuteCompilations[Code]
		} else {NewItem.code = Code}
		NewItem.section = Section
		NewItem.complete()
		Zotero.debug(Code)
		Zotero.debug(Title)
		Zotero.debug(Section)
	} */
	if (type == "case") {
		var name = ZU.xpathText(doc, '//h2[@id="co_docHeaderTitleLine"]/@title')
		var cite1 = ZU.xpathText(doc, '//span[@id="cite0"]/text()')
		var cite2 = ZU.xpathText(doc, '//span[@id="cite1"]/text()')
		var decided = ZU.xpathText(doc, '//span[@id="filedate"]/text()')
		var court = ZU.xpathText(doc, '//span[@id="courtline"]/text()')
		//var extra = ZU.xpathText(doc, '//input[@id="co_document_starPageMetadata"]/@value')
		var citationArray = citationChecker(cite1, cite2)
		court = court.replace(/(\.$)/g,"")
		Zotero.debug(citationArray)
		Zotero.debug(name)
		Zotero.debug(decided)
		Zotero.debug(court)
		//Zotero.debug(extra)
		var juris = jurisdictionParser(court)
		if (fedMap[court]) {
			court = ""
		}
		if (unambiguousReporter.indexOf(citationArray[2]) > -1) {juris = ""}
		NewItem.caseName = name
		NewItem.date = decided
		NewItem.reporter = citationArray[2]
		NewItem.reporterVolume = citationArray[1]
		NewItem.firstPage = citationArray[3]
		NewItem.jurisdiction = juris
		NewItem.court = courtParser(court, juris)
		NewItem.url = "https://1.next.westlaw.com/Search/Results.html?query=find:" + NewItem.reporterVolume + "%20" + NewItem.reporter + "%20" + NewItem.firstPage + "#autoLogin"
		if (unambiguousReporter.indexOf(citationArray[2]) > -1) {
			NewItem.court = ""
		}
		/*try {
			doc = html_cleaner(doc)
			NewItem.attachments.push({
				document: doc,
				title: 'Page',
			})
		} catch(err) {}*/
		NewItem.complete()
	}
	if (type == "regulation" || type == "statute") {
		var cite = ZU.xpathText(doc, '//div[@class="co_cites"]/text()')
		var effectiveDate = ZU.xpathText(doc, '//span[@id="effectiveDate"]/text()')
		//NewItem.title = "TEST"
		try {
			var code = cite.match(codeRex)[1]
			var codeNumPointer = codeRexMap[code][1]
			var sectionPointer = codeRexMap[code][2]
			if (codeNumPointer) {
				var codeNum = cite.match(codeRexMap[code][0])[codeNumPointer]
			}
			Zotero.debug("codeNum good")
			if (sectionPointer) {
				var section = cite.match(codeRexMap[code][0])[sectionPointer]
			}
			Zotero.debug("section good")
			if (!section) {section = cite}
			if (!codeNum) {codeNum = []}
			if (section) {section = section.replace("-","\\-")}
			if (abbrevMap[code]) {code = abbrevMap[code]}
			effectiveDate = governmentDate(effectiveDate, code)
			NewItem.codeNumber = codeNum
			NewItem.section = section
			NewItem.code = code
		} catch(err) {
			NewItem.title = cite
			effectiveDate = governmentDate(effectiveDate)
		}
		NewItem.publicationDate = effectiveDate
		/*try {
			html_cleaner(doc)
			NewItem.attachments.push({
				document: doc,
				title: 'Snapshot',
				mimeType: 'text/html',
				snapshot: false,
				url: ""
			})
		} catch(err) {}*/
		NewItem.url = "https://1.next.westlaw.com/Search/Results.html?query=find:" + NewItem.codeNum + "%20" + NewItem.code + "%20" + NewItem.section + "#autoLogin"
		NewItem.complete()
		Zotero.debug(NewItem)
	}
}

function citationChecker(first, second) {
	first = first.match(/([0-9]+)(?:\s)([A-Za-z0-9\.]+)(?:\s)([0-9]+)/)
	if (second) {
		second = second.match(/([0-9]+)(?:\s)([A-Za-z0-9\.]+)(?:\s)([0-9]+)/)
	}
	if (first == null) {
		return second
	} else {return first}
}

/*fuction regulationParser(cite) {
	var code = cite.match(/(C\.F\.R\.|NCAC)/)[1]
	var code
}*/

var codeRex = /(C\.F\.R\.|NCAC|U\.S\.C\.A\.|N\.C\.G\.S\.A\.|West\'s\sAnn\.Cal\.[a-zA-Z\.]+\sCode)/
var codeRexMap = {
	"NCAC" : [/([0-9]+)(?:\sNCAC\s)([0-9\.]*)/,1,2],
	"C.F.R." : [/([0-9]+)(?:\sC\.F\.R\.[\s§]*)([0-9\.\-\–]*)/,1,2],
	"U.S.C.A.": [/([0-9]+)(?:\sU\.S\.C\.A\.[\s§]*)([0-9\.\-\–a-z]*)/,1,2],
	"N.C.G.S.A.": [/(?:N\.C\.G\.S\.A\.[\s§]*)([0-9\.\-\–a-zA-Z]*)/,"",1],
	"West's Ann.Cal.Penal Code": [/(?:West's\sAnn\.Cal\.[a-zA-Z\.]*\sCode[\s§]*)([0-9a-z]*)/, "",1]
}
var abbrevMap = {
	"NCAC" : "N.C.A.C.",
	"U.S.C.A." : "U.S.C.",
	"N.C.G.S.A." : "N.C.G.S.",
	"West's Ann.Cal.Penal Code" :"Cal. Penal Code",
}

function jurisdictionParser(court) {
	if (fedMap[court]) {
		Zotero.debug(fedMap[court])
		return fedMap[court]
	}
	else if (court.match(staterex)) {
		var courtMatch = stateMap[court.match(staterex)[1]]
		Zotero.debug(courtMatch)
		return courtMatch
	}
}

function governmentDate(date, source = "") {
	if (source == "U.S.C.") {
		if (!date) {return "2012"}
		var year = date.match(/([0-9]{4})/)[1]
		if ("2013,2014,2015,2016,2017".indexOf(year) != -1) {return year}
		return "2012"
	}
	if (!date) {return "2016"}
	var year = date.match(/([0-9]{4})/)[1]
	return year
}

function html_cleaner(doc){
	var element = Zotero.Utilities.xpath(doc, '//div[@class="co_innertube"]')[0]
	var childelement = Zotero.Utilities.xpath(doc, '//div[@id="co_docHeaderContainer"]')[0]
	element.removeChild(childelement)
	var element = Zotero.Utilities.xpath(doc, '//div[@id="co_mainContainer"]')[0]
	var childelement = Zotero.Utilities.xpath(doc, '//div[@id="co_headerWrapper"]')[0]
	element.removeChild(childelement)
	try {
		var element = Zotero.Utilities.xpath(doc, '//div[@id="co_document_0"]')[0]
		var childelement = Zotero.Utilities.xpath(doc, '//div[@id="co_headnotes"]')[0]
		element.removeChild(childelement)
	} catch(err) {}
	return doc
}

function courtParser(court, jurisdiction) {
	if (court.indexOf("Supreme Court") != -1) {
		if (jurisdiction == "us:ny") {
			return "supreme.court"
		}
		else {return ""}
	}
	else if (court.indexOf("Appeals") != -1) {
		if (jurisdiction == "us:ny") {
			return ""
		}
		else {return "court.appeals"}
	}
	else if (court.indexOf("Superior") != -1) {
		return "superior.court"
	}
	else if (court.indexOf("District Court") != -1) {
		return "district.court"
	}
	else {return ""}
}
var fedrex = /.*?(N\.D\. Georgia|W\.D\. Michigan|D\. Maine|W\.D\. Tennessee|S\.D\. Ohio|D\. South Carolina|S\.D\. Illinois|S\.D\. Florida|E\.D\. New York|S\.D\. West Virginia|N\.D\. Alabama|D\. South Dakota|D\. New Hampshire|D\. Kansas|D\. Maryland|D\. Delaware|E\.D\. Louisiana|M\.D\. Georgia|E\.D\. Michigan|D\. Utah|N\.D\. Texas|S\.D\. New York|W\.D\. Pennsylvania|W\.D\. Texas|D\. Puerto Rico|N\.D\. Iowa|E\.D\. Washington|W\.D\. Kentucky|N\.D\. Oklahoma|M\.D\. Louisiana|D\. Rhode Island|S\.D\. Alabama|S\.D\. Georgia|D\. Connecticut|E\.D\. Kentucky|W\.D\. North Carolina|W\.D\. Virginia|S\.D\. Indiana|E\.D\. North Carolina|S\.D\. California|D\. Minnesota|N\.D\. New York|D\. Nebraska|W\.D\. New York|S\.D\. Iowa|W\.D\. Washington|D\. Alaska|D\. Idaho|D\. Wyoming|M\.D\. North Carolina|N\.D\. Illinois|N\.D\. Mississippi|E\.D\. Texas|E\.D\. Virginia|S\.D\. Mississippi|D\. North Dakota|E\.D\. Tennessee|D\. New Mexico|D\. Montana|N\.D\. Ohio|E\.D\. Missouri|W\.D\. Oklahoma|D\. Colorado|C\.D\. Illinois|D\. Oregon|E\.D\. Oklahoma|D\. District of Columbia|N\.D\. Florida|W\.D\. Missouri|M\.D\. Pennsylvania|D\. Hawaii|D\. Nevada|N\.D\. California|E\.D\. California|W\.D\. Wisconsin|W\.D\. Arkansas|M\.D\. Tennessee|D\. Vermont|N\.D\. West Virginia|D\. New Jersey|M\.D\. Alabama|D\. Arizona|D\. Massachusetts|S\.D\. Texas|E\.D\. Pennsylvania|N\.D\. Indiana|E\.D\. Wisconsin|E\.D\. Arkansas|W\.D\. Louisiana|M\.D\. Florida|C\.D\. California).*/;

var fedMap = {
	"United States Court of Appeals, First Circuit" :  "us:c1", 
	"United States Court of Appeals, Second Circuit" :  "us:c2", 
	"United States Court of Appeals, Third Circuit" :  "us:c3", 
	"United States Court of Appeals, Fourth Circuit" :  "us:c4", 
	"United States Court of Appeals, Fifth Circuit" :  "us:c5", 
	"United States Court of Appeals, Sixth Circuit" :  "us:c6", 
	"United States Court of Appeals, Seventh Circuit" :  "us:c7", 
	"United States Court of Appeals, Eighth Circuit" :  "us:c8", 
	"United States Court of Appeals, Ninth Circuit" :  "us:c9", 
	"United States Court of Appeals, Tenth Circuit" :  "us:c10", 
	"United States Court of Appeals, Eleventh Circuit" :  "us:c11", 
	"United States District Court, N.D. Georgia" :  "us:c11:ga.nd", 
	"United States District Court, W.D. Michigan" :  "us:c6:mi.wd", 
	"United States District Court, D. Maine" :  "us:c1:me.d", 
	"United States District Court, W.D. Tennessee" :  "us:c6:tn.wd", 
	"United States District Court, S.D. Ohio" :  "us:c6:oh.sd", 
	"United States District Court, D. South Carolina" :  "us:c4:sc.d", 
	"United States District Court, S.D. Illinois" :  "us:c7:il.sd", 
	"United States District Court, S.D. Florida" :  "us:c11:fl.sd", 
	"United States District Court, E.D. New York" :  "us:c2:ny.ed", 
	"United States District Court, S.D. West Virginia" :  "us:c4:wv.sd", 
	"United States District Court, N.D. Alabama" :  "us:c11:al.nd", 
	"United States District Court, D. South Dakota" :  "us:c8:sd.d", 
	"United States District Court, D. New Hampshire" :  "us:c1:nh.d", 
	"United States District Court, D. Kansas" :  "us:c10:ks.d", 
	"United States District Court, D. Maryland" :  "us:c4:md.d", 
	"United States District Court, D. Delaware" :  "us:c3:de.d", 
	"United States District Court, E.D. Louisiana" :  "us:c5:la.ed", 
	"United States District Court, M.D. Georgia" :  "us:c11:ga.md", 
	"United States District Court, E.D. Michigan" :  "us:c6:mi.ed", 
	"United States District Court, D. Utah" :  "us:c10:ut.d", 
	"United States District Court, N.D. Texas" :  "us:c5:tx.nd", 
	"United States District Court, S.D. New York" :  "us:c2:ny.sd", 
	"United States District Court, W.D. Pennsylvania" :  "us:c3:pa.wd", 
	"United States District Court, W.D. Texas" :  "us:c5:tx.wd", 
	"United States District Court, D. Puerto Rico" :  "us:c1:pr.d", 
	"United States District Court, N.D. Iowa" :  "us:c8:ia.nd", 
	"United States District Court, E.D. Washington" :  "us:c9:wa.ed", 
	"United States District Court, W.D. Kentucky" :  "us:c6:ky.wd", 
	"United States District Court, N.D. Oklahoma" :  "us:c10:ok.nd", 
	"United States District Court, M.D. Louisiana" :  "us:c5:la.md", 
	"United States District Court, D. Rhode Island" :  "us:c1:ri.d", 
	"United States District Court, S.D. Alabama" :  "us:c11:al.sd", 
	"United States District Court, S.D. Georgia" :  "us:c11:ga.sd", 
	"United States District Court, D. Connecticut" :  "us:c2:ct.d", 
	"United States District Court, E.D. Kentucky" :  "us:c6:ky.ed", 
	"United States District Court, W.D. North Carolina" :  "us:c4:nc.wd", 
	"United States District Court, W.D. Virginia" :  "us:c4:va.wd", 
	"United States District Court, S.D. Indiana" :  "us:c7:in.sd", 
	"United States District Court, E.D. North Carolina" :  "us:c4:nc.ed", 
	"United States District Court, S.D. California" :  "us:c9:ca.sd", 
	"United States District Court, D. Minnesota" :  "us:c8:mn.d", 
	"United States District Court, N.D. New York" :  "us:c2:ny.nd", 
	"United States District Court, D. Nebraska" :  "us:c8:ne.d", 
	"United States District Court, W.D. New York" :  "us:c2:ny.wd", 
	"United States District Court, S.D. Iowa" :  "us:c8:ia.sd", 
	"United States District Court, W.D. Washington" :  "us:c9:wa.wd", 
	"United States District Court, D. Alaska" :  "us:c9:ak.d", 
	"United States District Court, D. Idaho" :  "us:c9:id.d", 
	"United States District Court, D. Wyoming" :  "us:c10:wy.d", 
	"United States District Court, M.D. North Carolina" :  "us:c4:nc.md", 
	"United States District Court, N.D. Illinois" :  "us:c7:il.nd", 
	"United States District Court, N.D. Mississippi" :  "us:c5:ms.nd", 
	"United States District Court, E.D. Texas" :  "us:c5:tx.ed", 
	"United States District Court, E.D. Virginia" :  "us:c4:va.ed", 
	"United States District Court, S.D. Mississippi" :  "us:c5:ms.sd", 
	"United States District Court, D. North Dakota" :  "us:c8:nd.d", 
	"United States District Court, E.D. Tennessee" :  "us:c6:tn.ed", 
	"United States District Court, D. New Mexico" :  "us:c10:nm.d", 
	"United States District Court, D. Montana" :  "us:c9:mt.d", 
	"United States District Court, N.D. Ohio" :  "us:c6:oh.nd", 
	"United States District Court, E.D. Missouri" :  "us:c8:mo.ed", 
	"United States District Court, W.D. Oklahoma" :  "us:c10:ok.wd", 
	"United States District Court, D. Colorado" :  "us:c10:co.d", 
	"United States District Court, C.D. Illinois" :  "us:c7:il.cd", 
	"United States District Court, D. Oregon" :  "us:c9:or.d", 
	"United States District Court, E.D. Oklahoma" :  "us:c10:ok.ed", 
	"United States District Court, D. District of Columbia" :  "us:dc.d", 
	"United States District Court, N.D. Florida" :  "us:c11:fl.nd", 
	"United States District Court, W.D. Missouri" :  "us:c8:mo.wd", 
	"United States District Court, M.D. Pennsylvania" :  "us:c3:pa.md", 
	"United States District Court, D. Hawaii" :  "us:c9:hi.d", 
	"United States District Court, D. Nevada" :  "us:c9:nv.d", 
	"United States District Court, N.D. California" :  "us:c9:ca.nd", 
	"United States District Court, E.D. California" :  "us:c9:ca.ed", 
	"United States District Court, W.D. Wisconsin" :  "us:c7:wi.wd", 
	"United States District Court, W.D. Arkansas" :  "us:c8:ar.wd", 
	"United States District Court, M.D. Tennessee" :  "us:c6:tn.md", 
	"United States District Court, D. Vermont" :  "us:c2:vt.d", 
	"United States District Court, N.D. West Virginia" :  "us:c4:wv.nd", 
	"United States District Court, D. New Jersey" :  "us:c3:nj.d", 
	"United States District Court, M.D. Alabama" :  "us:c11:al.md", 
	"United States District Court, D. Arizona" :  "us:c9:az.d", 
	"United States District Court, D. Massachusetts" :  "us:c1:ma.d", 
	"United States District Court, S.D. Texas" :  "us:c5:tx.sd", 
	"United States District Court, E.D. Pennsylvania" :  "us:c3:pa.ed", 
	"United States District Court, N.D. Indiana" :  "us:c7:in.nd", 
	"United States District Court, E.D. Wisconsin" :  "us:c7:wi.ed", 
	"United States District Court, E.D. Arkansas" :  "us:c8:ar.ed", 
	"United States District Court, W.D. Louisiana" :  "us:c5:la.wd", 
	"United States District Court, M.D. Florida" :  "us:c11:fl.md", 
	"United States District Court, C.D. California" :  "us:c9:ca.cd",
	"Supreme Court of the United States" : "us"
}
var statuteCompilations = {
	"West's North Carolina General Statutes Annotated" : "N.C.G.S.", 
	"United States Code Annotated" : "U.S.C.",
	"Massachusetts General Laws Annotated" : "M.G.L."
}

var unambiguousReporter = [
	"N.C.",
	"N.C.App."
]

var staterex = /(?:^|.*\s+)(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)[.,]*(?:$|\s+.*)/;

var stateMap = {
	"Alabama" : "us:al",
	"Alaska" : "us:ak",
	"Arizona" : "us:az",
	"Arkansas" : "us:ar",
	"California" : "us:ca",
	"Colorado" : "us:co",
	"Connecticut" : "us:ct",
	"Delaware" : "us:de",
	"Florida" : "us:fl",
	"Georgia" : "us:ga",
	"Hawaii" : "us:hi",
	"Idaho" : "us:id",
	"Illinois" : "us:il",
	"Indiana" : "us:in",
	"Iowa" : "us:ia",
	"Kansas" : "us:ks",
	"Kentucky" : "us:ky",
	"Louisiana" : "us:la",
	"Maine" : "us:me",
	"Maryland" : "us:md",
	"Massachusetts" : "us:ma",
	"Michigan" : "us:mi",
	"Minnesota" : "us:mn",
	"Mississippi" : "us:ms",
	"Missouri" : "us:mo",
	"Montana" : "us:mt",
	"Nebraska" : "us:ne",
	"Nevada" : "us:nv",
	"New Hampshire" : "us:nh",
	"New Jersey" : "us:nj",
	"New Mexico" : "us:nm",
	"New York" : "us:ny",
	"North Carolina" : "us:nc",
	"North Dakota" : "us:nd",
	"Ohio" : "us:oh",
	"Oklahoma" : "us:ok",
	"Oregon" : "us:or",
	"Pennsylvania" : "us:pa",
	"Rhode Island" : "us:ri",
	"South Carolina" : "us:sc",
	"South Dakota" : "us:sd",
	"Tennessee" : "us:tn",
	"Texas" : "us:tx",
	"Utah" : "us:ut",
	"Vermont" : "us:vt",
	"Virginia" : "us:va",
	"Washington" : "us:wa",
	"West Virginia" : "us:wv",
	"Wisconsin" : "us:wi",
	"Wyoming" : "us:wy"
}

//code = code.match(/(?:[0-9]+\s)([A-Za-z\.]+)(?:\s*[§0-9]+)/)[1]
		//codeNum = codeNum.match(/([0-9\.\-]+)(?:[\.\s§]+)/)[1]
		//section = code.match(/()/)[1]
		//var code = ZU.xpathText(doc, '//div[@class="co_cites"]/text()')
		//var section = ZU.xpathText(doc, '//title/text()')/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/