{
	"translatorID": "58a778cc-25e2-4884-95b3-6b22d7571183",
	"label": "Gmail",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://mail\\.google\\.com/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2017-01-01 16:53:13"
}

function detectWeb(doc, url) {
	//only trigger on print pages
	var docOnLoad = doc.body.attributes.onload;
	if (docOnLoad && docOnLoad.textContent == 'Print()') {
		return 'email';
	}
	var scriptNodesText = ZU.xpathText(doc, '//script');
	if (scriptNodesText.indexOf("window.print()")>-1) {
		return 'email';
	}
}

function doWeb(doc, url) {
	var item = new Zotero.Item("email");
	item.title = ZU.xpathText(doc,'(//div[@class="maincontent"]/table[1]//font)[1]');
//	item.subject = item.title;

	//use "to" and "from" from the first message in the thread
	var from = ZU.xpathText(doc,
		'(//div[@class="maincontent"]/table[@class="message"][1]//tr)[1]/td[1]//b');
	if (from) item.creators.push(ZU.cleanAuthor(ZU.trimInternal(from), "author"));

	//To, CC, and BCC(?) fields
	var to = ZU.xpath(doc,
		'//div[@class="maincontent"]/table[@class="message"][1]\
			//font[@class="recipient"]/div[not(@class="replyto")]');
	for (var j=0, m=to.length; j<m; j++) {
		var rec = to[j].textContent
			.replace(/^[\s\S]+?:\s*/,'')	// remove "To:", "CC:", etc.,
											//   but it could be something else in other languages
			.replace(/\s*<.+?>\s*/g,'')		// remove email addresses if name exists
			.split(/\s*,\s*/);				// There can be more than one email
		for (var i=0, n=rec.length; i<n; i++) {
			item.creators.push(ZU.cleanAuthor(ZU.trimInternal(rec[i]), "recipient"));
		}
	}

	item.date = ZU.xpathText(doc,
		'(//div[@class="maincontent"]/table[@class="message"][1]//tr[1]/td[2])[1]');
	if (item.date) item.date = ZU.trimInternal(item.date);

	//clear the automatic Print popup
	doc.body.removeAttribute('onload');
	item.attachments.push({
		title:"Email Snapshot",
		document: doc
	});

	item.complete();
}