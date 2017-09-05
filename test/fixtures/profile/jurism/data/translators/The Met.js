{
	"translatorID": "72dbad15-cd1a-4d52-b2ed-7d67f909cada",
	"label": "The Met",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://metmuseum\\.org/collection/the-collection-online/search",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-07-09 01:41:36"
}

function detectWeb(doc, url) {
	if(doc.getElementsByClassName('tombstone')[0]) return 'artwork';
	
	if(getSearchResults(doc)) return 'multiple';
}

function getSearchResults(doc) {
	var titles = doc.getElementsByClassName('objtitle');
	
	var items = {}, found = false;
	for(var i=0; i<titles.length; i++) {
		var a = titles[i].parentNode;
		if(!a || !a.href) continue;
		
		found = true;
		items[a.href] = ZU.trimInternal(titles[i].textContent);
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		var items = getSearchResults(doc);
		Z.selectItems(items, function(items) {
			if(!items) return true;
			
			var urls = [];
			for(var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item('artwork');
	var tmbstCont = doc.getElementsByClassName('tombstone-container')[0];
	item.title = ZU.trimInternal(tmbstCont.getElementsByTagName('h2')[0].textContent);
	
	var creator = tmbstCont.getElementsByTagName('h3')[0];
	if(creator) {
		item.creators.push(ZU.cleanAuthor(
			ZU.trimInternal(creator.firstChild.textContent),
			'author',
			false
		));
	}
	
	var meta = doc.getElementsByClassName('tombstone')[0].firstElementChild;
	
	do {
		var heading = ZU.trimInternal(meta.getElementsByTagName('strong')[0].textContent);
		heading = heading.toLowerCase().substr(0, heading.length-1);
		var content = ZU.trimInternal(meta.lastChild.textContent);
		switch(heading) {
			case 'date':
			case 'medium':
				item[heading] = content;
			break;
			case 'dimensions':
				item.artworkSize = content;
			break;
			case 'accession number':
				item.callNumber = content;
			break;
			case 'classification':
			case 'period':
			case 'culture':
				item.tags.push(content);
			break;
		}
	} while(meta = meta.nextElementSibling);
	
	var desc = doc.getElementById('gallery-label');
	if(desc) {
		item.abstractNote = ZU.trimInternal(desc.textContent);
	}
	item.libraryCatalog = 'The Metropolitan Museum of Art';
	item.url = doc.getElementsByClassName('permalink')[0].href;
	
	var download = doc.getElementsByClassName('download')[0];
	if(download) {
		item.attachments.push({
			title: 'Met Image',
			url: download.href
		});
	}
	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});
	
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://metmuseum.org/collection/the-collection-online/search/328877?rpp=30&pg=1&rndkey=20140708&ft=*&who=Babylonian&pos=4",
		"items": [
			{
				"itemType": "artwork",
				"title": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a: field rental",
				"creators": [],
				"date": "ca. 1749–1712 B.C.",
				"artworkMedium": "Clay",
				"artworkSize": "2.1 x 4.4 x 2.9 cm (7/8 x 1 3/4 x 1 1/8 in.)",
				"callNumber": "86.11.214b",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"shortTitle": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a",
				"url": "http://metmuseum.org/collection/the-collection-online/search/328877",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Babylonian",
					"Clay-Tablets-Inscribed-Seal Impressions",
					"Old Babylonian"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://metmuseum.org/collection/the-collection-online/search/328877",
		"items": [
			{
				"itemType": "artwork",
				"title": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a: field rental",
				"creators": [],
				"date": "ca. 1749–1712 B.C.",
				"artworkMedium": "Clay",
				"artworkSize": "2.1 x 4.4 x 2.9 cm (7/8 x 1 3/4 x 1 1/8 in.)",
				"callNumber": "86.11.214b",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"shortTitle": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a",
				"url": "http://metmuseum.org/collection/the-collection-online/search/328877",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Babylonian",
					"Clay-Tablets-Inscribed-Seal Impressions",
					"Old Babylonian"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://metmuseum.org/collection/the-collection-online/search/436243?rpp=30&pg=1&ft=albrecht+d%c3%bcrer&pos=1",
		"items": [
			{
				"itemType": "artwork",
				"title": "Salvator Mundi",
				"creators": [
					{
						"firstName": "Albrecht",
						"lastName": "Dürer",
						"creatorType": "author"
					}
				],
				"date": "ca. 1505",
				"abstractNote": "This picture of Christ as Salvator Mundi, Savior of the World, who raises his right hand in blessing and in his left holds a globe representing the earth, can be appreciated both as a painting and as a drawing. Albrecht Dürer, the premier artist of the German Renaissance, probably began this work shortly before he departed for Italy in 1505, but completed only the drapery. His unusually extensive and meticulous preparatory drawing on the panel is visible in the unfinished portions of Christ's face and hands.",
				"artworkMedium": "Oil on wood",
				"artworkSize": "22 7/8 x 18 1/2in. (58.1 x 47cm)",
				"callNumber": "32.100.64",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"url": "http://metmuseum.org/collection/the-collection-online/search/436243",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Paintings"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://metmuseum.org/collection/the-collection-online/search?ft=albrecht+d%C3%BCrer&noqs=true",
		"items": "multiple"
	}
]
/** END TEST CASES **/