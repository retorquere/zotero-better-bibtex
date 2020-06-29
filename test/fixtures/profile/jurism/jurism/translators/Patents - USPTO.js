{
	"translatorID": "232e24fe-2f68-44fc-9366-ecd45720ee9e",
	"label": "Patents - USPTO",
	"creator": "Bill McKinney",
	"target": "^https?://(patft|appft1)\\.uspto\\.gov/netacgi/nph-Parser.+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-04 10:11:27"
}

function detectWeb(doc, url) {
	var re = new RegExp("^https?://(patft|appft1)\.uspto\.gov/netacgi/nph-Parser");
	if (doc.title.match(/Search Results:/)){
		return "multiple"
	}
	else if (re.test(doc.location.href)) {
		return "patent";
	} else {
		return "multiple";
	}
}

function get_nextsibling(n)
  {
  var x=n.nextSibling;
  while (x.nodeType!=1)
   {
   x=x.nextSibling;
   }
  return x;
}

function scrape(doc) {

	var newItem = new Zotero.Item("patent");
	newItem.url = doc.location.href;
	var extraText = new String();
	var tmpStr = new String();
	var tmpRefs = "";
	var tmpTitle = doc.title;
	
	var fontTags = doc.getElementsByTagName("font");
	for (var i=0; i<fontTags.length; i++) {
		if (fontTags[i].getAttribute("size") == "+1") {
			tmpTitle = tmpTitle + " - " + fontTags[i].innerHTML;
		}
	}
	tmpTitle = Zotero.Utilities.trimInternal(tmpTitle);
	tmpTitle = tmpTitle.replace(/<[^>]+>/g, "");
	newItem.title = tmpTitle;
	
	var cellTags = doc.getElementsByTagName("td");
	for (var i=0; i<cellTags.length; i++) {

		var s = new String(cellTags[i].innerHTML);
		//Z.debug(s)
		if (s.indexOf("United States Patent") > -1) {
			
			tmpStr = cellTags[i+1].childNodes[0].innerHTML;
			tmpStr = tmpStr.replace(/<[^>]+>/gi, "");
			tmpStr = tmpStr.replace(/,/gi, "");
			newItem.patentNumber = tmpStr;
			
			tmpStr = cellTags[i+3].innerHTML;
			tmpStr = tmpStr.replace(/<[^>]+>/gi, "");
			newItem.issueDate = tmpStr;
			continue;
		}
	
		// references
		if (s.indexOf("<a href=\"/netacgi/nph-Parser?Sect2") > -1) {
				tmpRefs = tmpRefs + cellTags[i].childNodes[0].innerHTML + " ";
		}
		if (s.indexOf("<a href=\"http://appft1.uspto.gov/netacgi/nph-Parser?TERM1") > -1) {
				tmpRefs = tmpRefs + cellTags[i].childNodes[0].innerHTML + " ";
		}
	}
	
	var centerTags = doc.getElementsByTagName("center");
	for (var i=0; i<centerTags.length; i++) {
		var s = new String(centerTags[i].innerHTML);
		if (s.indexOf("Abstract") > -1) {
			//newItem.extra = "ok";
			var el = get_nextsibling(centerTags[i]);
			newItem.abstractNote = el.innerHTML;
		}
	
	}
	var inventors = ZU.xpath(doc, '//td[contains(text(), "Inventors")]/following-sibling::td/b|//th[contains(text(), "Inventors")]/following-sibling::td/b');
 	var inventor;

	for (i in inventors){
		Z.debug( inventors[i].textContent)
		var inventor = inventors[i].textContent.replace(/^\s*;\s*/, "").replace(/;/, ",")
		newItem.creators.push(ZU.cleanAuthor(inventor, "inventor", true))
	}
	
	var assignee = ZU.xpathText(doc, '//td[contains(text(), "Assignee")]/following-sibling::td/b|//th[contains(text(), "Assignee")]/following-sibling::td/b');
	newItem.assignee = assignee;
//References currenlty broken
	//newItem.references = tmpRefs;
	newItem.complete();
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "patent") {
		scrape(doc);
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, "^https?://(patft|appft1)\.uspto\.gov/netacgi/nph-Parser.+");
		var uris = new Array();
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				uris.push(i);
			}
			Zotero.Utilities.processDocuments(uris, scrape);	
		});
	}
}	/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r=0&f=S&l=50&TERM1=krypto&FIELD1=&co1=AND&TERM2=&FIELD2=&d=PTXT",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://patft.uspto.gov/netacgi/nph-Parser?Sect2=PTO1&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r=1&f=G&l=50&d=PALL&RefSrch=yes&Query=PN%2F7360954",
		"items": [
			{
				"itemType": "patent",
				"creators": [
					{
						"firstName": "Terry R.",
						"lastName": "Seaver",
						"creatorType": "inventor"
					},
					{
						"firstName": "Pirooz",
						"lastName": "Tooyserkani",
						"creatorType": "inventor"
					},
					{
						"firstName": "Donald B.",
						"lastName": "Stone",
						"creatorType": "inventor"
					},
					{
						"firstName": "Sharat",
						"lastName": "Prasad",
						"creatorType": "inventor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://patft.uspto.gov/netacgi/nph-Parser?Sect2=PTO1&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r=1&f=G&l=50&d=PALL&RefSrch=yes&Query=PN%2F7360954",
				"title": "United States Patent: 7360954 - Low speed data path for SFP-MSA interface",
				"patentNumber": "7360954",
				"issueDate": "April 22, 2008",
				"abstractNote": "Methods and apparatus for enabling a protected circuit path to be created\n     efficiently are disclosed. In accordance with one embodiment of the\n     present invention, a method for creating a protected circuit path within\n     an optical network system includes identifying a first node, a second\n     node, and a third node. Once the nodes are identified, a pseudo link or a\n     virtual link may be created between the second node and the third node. A\n     first circuit path is then routed between the first node and the second\n     node, and a second circuit path which protects that first circuit path is\n     routed between the first node and the third node using the pseudo link.",
				"assignee": "Cisco Technology, Inc.",
				"libraryCatalog": "Patents - USPTO",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "United States Patent"
			}
		]
	},
	{
		"type": "web",
		"url": "http://appft1.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r=1&f=G&l=50&co1=AND&d=PG01&s1=20130047261&OS=20130047261&RS=20130047261",
		"items": [
			{
				"itemType": "patent",
				"creators": [
					{
						"firstName": "Graeme John",
						"lastName": "Proudler",
						"creatorType": "inventor"
					},
					{
						"firstName": "Chris I.",
						"lastName": "Dalton",
						"creatorType": "inventor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://appft1.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r=1&f=G&l=50&co1=AND&d=PG01&s1=20130047261&OS=20130047261&RS=20130047261",
				"title": "United States Patent Application: 0130047261 - Data Access Control",
				"patentNumber": "20130047261",
				"issueDate": "A1",
				"abstractNote": "A set of data is provided to an application executed in an environment\n     within which the application is restricted from making its output\n     available outside the environment. An operation performed on the set of\n     data by the application is inspected. A determination of whether an\n     output of the application is satisfactory is reached based on the\n     inspection. If the output is determined satisfactory, the output of the\n     application is made available outside the environment.",
				"libraryCatalog": "Patents - USPTO",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "United States Patent Application"
			}
		]
	}
]
/** END TEST CASES **/