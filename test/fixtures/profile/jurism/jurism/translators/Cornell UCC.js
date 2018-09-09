{
	"translatorID": "5a664db4-9a5b-43df-83d7-b17434f427dc",
	"label": "Cornell UCC",
	"creator": "Frank Bennett",
	"target": "https://www.law.cornell.edu/ucc/[0-9]/[-0-9]+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsiv",
	"lastUpdated": "2018-05-06 10:28:11"
}

function detectWeb(doc, url) {
	return "statute"
}

function tidy(str){
	return str.trim().replace(/\.$/, "");
}

function doWeb(doc, url) {
	var item = new Z.Item("statute");
	item.code = "Uniform Commercial Code";
	var titleNode = doc.getElementById("page-title");
	var txt = titleNode.textContent;
	var m = txt.match(/^\s*§\s*([-\.0-9]+)\s+(.*)$/);
	if (m) {
		var section = tidy(m[1]);
		section = section.split("-").join("\\-");
		item.section = "sec. " + section;
		item.abstractNote = ZU.capitalizeTitle(tidy(m[2]), true);
		item.url = url;
	}
	item.attachments.push({
		title: "Cornell UCC snapshot",
		mimeType: "text/html",
		url: url,
		snapshot: true
	});
	item.complete();
}
