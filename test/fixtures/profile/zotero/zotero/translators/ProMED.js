{
	"translatorID": "3e9dbe21-10f2-40be-a921-f6ec82760927",
	"label": "ProMED",
	"creator": "Brandon Minich",
	"target": "^https?://www\\.promedmail\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-11-19 00:12:31"
}

function detectWeb(doc, url)  {
	if (url.toLowerCase().indexOf("direct.php?id=") != -1)  {
		return "email";
	}
} 
function doWeb(doc, url) {
		var newItem = new Zotero.Item('email');
		var info = ZU.xpathText(doc, '//div[@id="content_container"]//div/p[1]');
		Z.debug(info)
		var infos = info.replace(/Published Date:/, "").split(/Subject:|Archive Number:/)
		newItem.title = infos[1];
		newItem.date =infos[0];
		newItem.extra = "Archive Number: " + infos[2];
		newItem.url = doc.location.href;
		newItem.attachments = [{document:doc, title:"ProMED Email Snapshot", mimeType: "text/html"}]
		newItem.creators = [{lastName:"Internataional Society for Infection Diseases", fieldMode:true}]
	newItem.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.promedmail.org/direct.php?id=20130307.1574810",
		"items": [
			{
				"itemType": "email",
				"creators": [
					{
						"lastName": "Internataional Society for Infection Diseases",
						"fieldMode": true
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ProMED Email Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "PRO/AH/EDR> Chronic wasting disease, cervid - USA (03): (PA), 2012",
				"date": "2013-03-07 15:18:20",
				"extra": "Archive Number:  20130307.1574810",
				"url": "http://www.promedmail.org/direct.php?id=20130307.1574810",
				"libraryCatalog": "ProMED",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "PRO/AH/EDR> Chronic wasting disease, cervid - USA (03)"
			}
		]
	}
]
/** END TEST CASES **/