{
	"translatorID": "fb12ae9e-f473-cab4-0546-27ab88c64101",
	"label": "Library Catalog (DRA)",
	"creator": "Simon Kornblith",
	"target": "/web2/tramp2\\.exe/(?:see\\_record/|authority\\_hits/|do_keyword_search|form/|goto/.*\\?.*screen=(MARC)?Record\\.html)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-06-09 12:35:22"
}

/* No more libraries with permalinks that I know of
sample URLs: http://libraries.nc-pals.org
http://web2.libraries.vermont.gov/web2/tramp2.exe/log_in?SETTING_KEY=English
 */

function detectWeb(doc, url) {
	if(doc.location.href.search(/\/authority_hits|\/form\//) > 0) {
		return "multiple";
	} else {
		return "book";
	}
}

function doWeb(doc, url) {
	var checkItems = false;
	if(detectWeb(doc, url)== "multiple") {
		checkItems = Zotero.Utilities.gatherElementsOnXPath(doc, doc, "//ol//tr/td|//ol/li//ul/li", null);
	}
	
	if(checkItems && checkItems.length) {
		var items = Zotero.Utilities.getItemArray(doc, checkItems, 'https?://.*/web2/tramp2\.exe/(goto|see\_record)');
		uris=[];
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				uris.push(i);
			}
			scrape(uris)
			});

	} else {
		if (url.indexOf("/do_keyword_search/")!=-1){
			url = "http://" + doc.location.host + ZU.xpathText(doc, '//td[@class="enrichcontent"]/a[contains(@href, "MARCRecord")]/@href');
		}
		scrape([url]);
	}
}
function scrape(uris){
	for(var i in uris) {
		var uri = uris[i];
		var uriRegexp = /^(https?:\/\/.*\/web2\/tramp2\.exe\/)(?:goto|see\_record|authority\_hits)(\/.*)\?(?:screen=Record\.html\&)?(.*)$/i;
		var m = uriRegexp.exec(uri);
		if(uri.indexOf("/authority_hits") < 0) {
			var newUri = m[1]+"download_record"+m[2]+"/RECORD.MRC?format=marc&"+m[3];
		} else {
			var newUri = m[1]+"download_record"+m[2]+"/RECORD.MRC?format=marc";
		}
		
		// Keep track of how many requests have been completed
		var j = 0;
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		
		var domain = uri.match(/https?:\/\/([^/]+)/);
		translator.setHandler("itemDone", function(obj, item) {
			item.repository = domain[1]+" Library Catalog";
			item.complete();
		});
		
		Zotero.Utilities.HTTP.doGet(newUri, function(text) {
			translator.setString(text);
			translator.translate();		
			j++;
			if(j == uris.length) {
				Zotero.done();
			}
		});
	}
}/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/