{
	"translatorID": "e8fc7ebc-b63d-4eb3-a16c-91da232f7220",
	"label": "Aluka",
	"creator": "Sean Takats, Sebastian Karcher",
	"target": "^https?://(?:www\\.)aluka\\.org/action/(?:showMetadata\\?doi=[^&]+|doSearch\\?|doBrowseResults\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-08-06 19:23:07"
}

function detectWeb(doc, url){
	var xpath = '//a[@class="title"]';
	var type = ZU.xpathText(doc, '//tr/td[contains(text(), "Resource type")]/following-sibling::td');
	Z.debug(type);
	var itemType = typeMap[type]
	if (itemType){
		return itemType
	}
	else if (url.match(/showMetadata\?doi=[^&]+/)){
		return "document";
	} else if(doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}
}

// Aluka types we can import
// TODO: Improve support for other Aluka item types?
// Correspondence, Circulars, Newsletters, Interviews, Pamphlets, Policy Documents, Posters, Press Releases, Reports, Testimonies, Transcripts
var typeMap = {
	"Books":"book",
	"Aluka Essays":"report",
	"photograph":"artwork",
	"Photographs":"artwork",
	"Slides (Photographs)": "artwork",
	"Panoramas":"artwork",
	"Journals (Periodicals)":"journalArticle",
	"Magazines (Periodicals)" : "magazineArticle",
	"Articles":"journalArticle",
	"Correspondence":"letter",
	"Letters (Correspondence)" : "letter",
	"Interviews":"interview",
	"Reports":"report"
}

function doWeb(doc, url){
	var urlString = "http://www.aluka.org/action/showPrimeXML?doi=" ;
	var uris = new Array();
	var m = url.match(/showMetadata\?doi=([^&]+)/);
	if (m) { //single page
		scrape(urlString+ m[1]);
	} else { //search results page
	
		var xpath = '//a[@class="title"]';
		var items = new Object();
		var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var elmt;
		while (elmt = elmts.iterateNext()) {
			var title = elmt.textContent;
			var link = elmt.href;
			var m = link.match(/showMetadata\?doi=([^&]+)/);
			if (title && m){
				items[m[1]] = title;
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				uris.push(urlString + i);
			}
			scrape(uris, function () {
				Zotero.done();
			});
		});
	}
}

function xpathTextTrimmed(contextElement, xpath) {
    var text = ZU.xpathText(contextElement, xpath);
    return text ? ZU.trimInternal(text) : undefined;
}
	
function scrape(uris){
	// http://www.aluka.org/action/showPrimeXML?doi=10.5555/AL.SFF.DOCUMENT.cbp1008
	Zotero.Utilities.HTTP.doGet(uris, function(text) {
		//Z.debug(text)
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, "text/xml");
		//var xml = new XML(text);
		var metadata = ZU.xpath(xml, '//MetadataDC');
		var itemType = "Unknown";
		if (metadata.length){
			itemType = "document";
			var value = ZU.xpathText(metadata[0], 'Type');
			if (value){
				if(typeMap[value]) {
					itemType = typeMap[value];
				} else {
					Zotero.debug("Unmapped Aluka Type: " + value);
				}		
			}
			var newItem = new Zotero.Item(itemType);
			var title = ZU.xpathText(metadata[0], 'Title');
			if (title){
				var title = Zotero.Utilities.trimInternal(title);}
			else {
					title = " ";
				}
			newItem.title = title;
			
			var subjects = ZU.xpath(metadata[0], 'Subject.Enriched');
			for(var i in subjects) {
			newItem.tags.push(Zotero.Utilities.trimInternal(subjects[i].textContent));
			}
			var coverage = ZU.xpath(metadata[0], 'Coverage.Spatial');
			for(var i in coverage) {
				newItem.tags.push(Zotero.Utilities.trimInternal(coverage[i].textContent));
			}
			var coverage_temp = ZU.xpath(metadata[0], 'Coverage.Temporal');
			for(var i in coverage_temp) {
				newItem.tags.push(Zotero.Utilities.trimInternal(coverage_temp[i].textContent));
			}

			var date = ZU.xpathText(metadata[0], 'Date[1]');
			if (date){
			 	if (date.match(/^\d{8}$/)){
					date = date.substr(0, 4) + "-" + date.substr(4, 2) + "-" + date.substr(6, 2);
				}
				newItem.date = date;
			}
			
			var authors = ZU.xpath(metadata[0], 'Creator');
			var type = "author";
			for(var i in authors) {
				Zotero.debug("author: " + authors[i].textContent);
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i].textContent,type,true));
			}
			var authors = ZU.xpath(metadata[0], 'Contributor');
			var type = "contributor";
			for(var i in authors) {
				Zotero.debug("author: " + authors[i].textContent);
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i].textContent,type,true));
			}
			
		
			newItem.extra = xpathTextTrimmed(metadata[0], 'Title.Alternative[1]');
			newItem.publisher = xpathTextTrimmed(metadata[0], 'Publisher[1]');
			newItem.medium =xpathTextTrimmed(metadata[0], 'Format.Medium[1]');
			newItem.language = xpathTextTrimmed(metadata[0], 'Language[1]');
			newItem.abstractNote = xpathTextTrimmed(metadata[0], 'Description[1]');
			newItem.numPages = xpathTextTrimmed(metadata[0], 'Format.Extent[1]');
			newItem.rights = xpathTextTrimmed(metadata[0], 'Rights[1]');
			newItem.repository = "Aluka: " + xpathTextTrimmed(metadata[0], 'Source[1]');
			newItem.callNumber = xpathTextTrimmed(metadata[0], 'Relation[1]');
			
			//If the rights aren't in the DC metadata try to get them otherwise
			var rights =   ZU.xpathText(xml, '//Rights/Attribution[1]');
			if (rights && !newItem.rights){
				newItem.rights = rights;
			}
			
			var doi = ZU.xpathText(xml, '//DOI[1]');
			if (doi){
				newItem.DOI = doi;
				var newUrl = "http://www.aluka.org/action/showMetadata?doi=" + doi;
				newItem.attachments.push({title:"Aluka Link", snapshot:false, mimeType:"text/html", url:newUrl});
				var pdfUrl = "http://ts-den.aluka.org/delivery/aluka-contentdelivery/pdf/" + doi + "?type=img&q=high";
				newItem.attachments.push({title: "Aluka PDF", url:pdfUrl});
				newItem.url = newUrl;
			}
			
			newItem.complete();
		} else {
			Zotero.debug("No Dublin Core XML data");
			return false;
		}
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.aluka.org/action/doSearch?sa=4&sa=xst&sa=xhr&searchText=argentina&submit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.aluka.org/action/showMetadata?doi=10.5555/AL.SFF.DOCUMENT.ydlwcc0342",
		"items": [
			{
				"itemType": "letter",
				"creators": [
					{
						"firstName": "Programme to Combat Racism",
						"lastName": "World Council of Churches",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Abrecht",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Regional And International Contexts",
					"Global",
					"Brazil",
					"Argentina",
					"United Kingdom",
					"Colombia",
					"1969"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Aluka Link",
						"snapshot": false,
						"mimeType": "text/html"
					},
					{
						"title": "Aluka PDF"
					}
				],
				"title": "[Letter from P. Abrecht (WCC, Geneva) to L. Nillus, Buenos Aires]",
				"date": "1968-12-13",
				"medium": "image/tiff",
				"language": "English",
				"numPages": "1 page(s)",
				"DOI": "10.5555/AL.SFF.DOCUMENT.ydlwcc0342",
				"url": "http://www.aluka.org/action/showMetadata?doi=10.5555/AL.SFF.DOCUMENT.ydlwcc0342",
				"rights": "By kind permission of the World Council of Churches (WCC).",
				"libraryCatalog": "Aluka: World Council of Churches Library and Archives: Programme to Combat Racism; microfilm created by the Yale University Divinity Library with funding from the Kenneth Scott Latourette Initiative for the Documentation of World Christianity.",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/