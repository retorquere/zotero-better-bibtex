{
	"translatorID": "1f40baef-eece-43e4-a1cc-27d20c0ce086",
	"label": "Engineering Village",
	"creator": "Ben Parr, Sebastian Karcher",
	"target": "^https?://(www\\.)?engineeringvillage(2)?\\.(com|org)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2017-02-12 17:40:59"
}

function detectWeb(doc, url) {
	Z.monitorDOMChanges(doc.getElementById("resultsarea"), {childList: true});
	var downloadLink = doc.getElementById('oneclickDL');
	if(downloadLink && getDocIDs(downloadLink.href)) {
		return "journalArticle";
	}
	
	if(getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getDocIDs(url) {
	var m = url.match(/\bdocidlist=([^&#]+)/);
	if (!m) return false;
	
	return decodeURIComponent(m[1]).split(',');
}

function getSearchResults(doc, checkOnly) {
	var rows = doc.getElementsByClassName('result'),
		items = {},
		found = false;
	
	for (var i=0; i<rows.length; i++) {
		var checkbox = rows[i].querySelector('input[name="cbresult"]');
		if (!checkbox) continue;
		
		var docid = checkbox.getAttribute('docid');
		if (!docid) continue;
		
		var title = rows[i].querySelector('h3.resulttitle');
		if (!title) continue;
		
		if (checkOnly) return true;
		found = true;
		
		items[docid] = {
			title: ZU.trimInternal(title.textContent),
			checked: checkbox.checked
		}
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			
			var ids = [];
			for (var i in items) {
				ids.push(i);
			}
			
			fetchRIS(doc, ids);
		});
	} else {
		var downloadLink = doc.getElementById('oneclickDL');
		fetchRIS(doc, getDocIDs(downloadLink.href));
	}
}

function fetchRIS(doc, docIDs) {
	Z.debug(docIDs);
	
	// handlelist to accompany the docidlist. Seems like it just has to be a
	// list of numbers the same size as the docid list.
	var handleList = new Array(docIDs.length);
	for (var i=0; i<docIDs.length; i++) {
		handleList[i] = i+1;
	}
	
	// The database we're currently using. Compendex is 1
	// Not tested with multi-database search
	var db = doc.getElementsByName('database')[0];
	if (db) db = db.value;
	if (!db) db = "1";
	
	var url = '/delivery/download/submit.url?downloadformat=ris'
		+ '&filenameprefix=Engineering_Village&displayformat=abstract'
		+ '&database=' + encodeURIComponent(db)
		+ '&docidlist=' + encodeURIComponent(docIDs.join(','))
		+ '&handlelist=' + encodeURIComponent(handleList.join(','));
	
	// This is what their web page does. It also sends Content-type and
	// Content-length parameters in the body, but seems like we can skip that
	// part
	ZU.doPost(url, "", function(text) {
		Z.debug(text);
		
		var translator = Zotero.loadTranslator("import");
		// RIS
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler('itemDone', function(obj, item) {
			item.attachments = [];
			item.notes = [];
			
			item.complete();
		})
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
