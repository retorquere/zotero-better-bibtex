{
	"translatorID": "d3b1d34c-f8a1-43bb-9dd6-27aa6403b217",
	"label": "YouTube",
	"creator": "Sean Takats, Michael Berkowitz, Matt Burton and Rintze Zelle",
	"target": "https?://[^/]*youtube\\.com\\/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-03-22 22:52:29"
}

function detectWeb(doc, url){
	/*var xpath = '//input[@type="hidden" and @name="video_id"]';
	if(doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "videoRecording";
	}*/
	if (url.match(/\/watch\?(?:.*)v=([0-9a-zA-Z]+)/)) {
		return "videoRecording";
	}
	//Search results
	if ( ZU.xpath(doc, '//ol[@id="search-results"]//a[contains(@href, "/watch?v=")]').length ){
		return "multiple";
	}
	//playlists
	if ( ZU.xpath(doc, '//td[@class="pl-video-title"]/a[contains(@class,"sessionlink") and contains(@href,"/watch?")]').length ){	
		return "multiple";
	}
	//user page
	if ( ZU.xpath(doc, '//div[contains(@class, "feed-item-main")]//a[contains(@href, "/watch?v=")]').length ){
		return "multiple";
	}
	// still used?
	if ( ZU.xpath(doc,'//div[@class="vltitle"]/div[@class="vlshortTitle"]/a[contains(@href, "/watch?v=")]').length ){	
		return "multiple";
	}
	
}

function doWeb(doc, url){
	var host = doc.location.host;
	var video_ids = new Array();
	var video_id;
	var videoRe = /\/watch\?(?:.*)v=([0-9a-zA-Z_-]+)/;
	if(video_id = videoRe.exec(url)) {
		//single video
		video_ids.push(video_id[1]);
		getData(video_ids, host);
	} else {
		// multiple videos
		var items = new Object();
		var isPlaylist = false;
		// search results and community/user pages
		var elmts = ZU.xpath(doc, '//ol[@id="search-results"]//a[contains(@href, "/watch?v=")]|//div[contains(@class, "feed-item-main")]//a[contains(@href, "/watch?v=")]')
		if (!elmts.length) {
			//playlists
			elmts = ZU.xpath(doc, '//td[@class="pl-video-title"]/a[contains(@class,"sessionlink") and contains(@href,"/watch?")]');
			if(elmts.length==0 ) {
				// still used?
				elmts = ZU.xpath(doc, '//div[@class="vltitle"]/div[@class="vlshortTitle"]/a[contains(@href, "/watch?v=")]');
			}
		}

		if( !elmts ) return false;

		var elmt, title, link;
		for (var i=0, n=elmts.length; i<n; i++) {
			elmt = elmts[i];
			title = elmt.textContent;
			title = Zotero.Utilities.trimInternal(title);
			link = elmt.href;
			//Zotero.debug(link);
			video_id = videoRe.exec(link)[1];
			items[video_id] = title;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) return true;

			for (var i in items) {
				video_ids.push(i);
			}
			getData(video_ids, host);
		});
	}
}

function getData(ids, host){
	var uris = new Array();	
	var url = "http://gdata.youtube.com/feeds/videos/";
	for each(var id in ids){
		uris.push(url+id);
	}
	Zotero.Utilities.HTTP.doGet(uris, function(text) {	
		var ns = {"default":"http://www.w3.org/2005/Atom", "media":"http://search.yahoo.com/mrss/", "yt":"http://gdata.youtube.com/schemas/2007"};
		
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, "text/xml");

		var newItem = new Zotero.Item("videoRecording");
		
		var title;
		if ((title = ZU.xpathText(doc, '//media:group/media:title', ns))) {
			newItem.title = ZU.trimInternal(title);
		} else {
			newItem.title = " ";
		}
		var keywords;
		if ((keywords = ZU.xpathText(doc, '//media:group/media:keywords', ns))) {
			keywords = keywords.split(",");
			for each(var tag in keywords){
				newItem.tags.push(Zotero.Utilities.trimInternal(tag));
			}
		}
		var date;
		if ((date = ZU.xpathText(doc, '//default:published', ns))) {
			newItem.date = date.substr(0, 10);
		}
		var author;
		if ((author = ZU.xpathText(doc, '//default:author/default:name', ns))) {
			author = ZU.cleanAuthor(author, "contributor", true);
			if (!author.firstName) {
				author.fieldMode = 1;
			}
			newItem.creators.push(author);
		}
		var url;
		if ((url = ZU.xpathText(doc, '//media:group/media:player/@url', ns))) {
			newItem.url = url;
		}
		var runningTime;
		if ((runningTime = ZU.xpathText(doc, '//media:group/yt:duration/@seconds', ns))) {
			newItem.runningTime = runningTime + " seconds";
		}
		var description;
		if ((description = ZU.xpathText(doc, '//media:group/media:description', ns))) {
			newItem.abstractNote = description;
		}
		newItem.complete();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.youtube.com/results?search_query=zotero&oq=zotero&aq=f&aqi=g4&aql=&gs_sm=3&gs_upl=60204l61268l0l61445l6l5l0l0l0l0l247l617l1.2.1l4l0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/watch?v=pq94aBrc0pY",
		"items": [
			{
				"itemType": "videoRecording",
				"creators": [
					{
						"lastName": "Zoteron",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Zotero Intro",
				"date": "2007-01-01",
				"url": "http://www.youtube.com/watch?v=pq94aBrc0pY&feature=youtube_gdata_player",
				"runningTime": "173 seconds",
				"abstractNote": "Zotero is a free, easy-to-use research tool that helps you gather and organize resources (whether bibliography or the full text of articles), and then lets you to annotate, organize, and share the results of your research. It includes the best parts of older reference manager software (like EndNote)—the ability to store full reference information in author, title, and publication fields and to export that as formatted references—and the best parts of modern software such as del.icio.us or iTunes, like the ability to sort, tag, and search in advanced ways. Using its unique ability to sense when you are viewing a book, article, or other resource on the web, Zotero will—on many major research sites—find and automatically save the full reference information for you in the correct fields.",
				"libraryCatalog": "YouTube",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/playlist?list=PL793CABDF042A9514",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/user/Zoteron",
		"items": "multiple"
	}
]
/** END TEST CASES **/