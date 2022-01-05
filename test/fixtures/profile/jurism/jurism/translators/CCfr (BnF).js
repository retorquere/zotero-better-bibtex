{
	"translatorID": "899d10f5-3f35-40e6-8dfb-f8ee2dfb1849",
	"label": "CCfr (BnF)",
	"creator": "Sylvain Machefert, Aurimas Vinckevicius",
	"target": "^https?://ccfr\\.bnf\\.fr/portailccfr/.*\\b(action=search|menu=menu_view_grappage|search\\.jsp)\\b",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2014-09-18 14:08:05"
}

function detectWeb(doc, url) {
	if (getSearchResults(doc))
	{
		return "multiple";
	}
	else if (url.indexOf("menu=menu_view_grappage") != -1) {
		return CCFRTypeDoc(doc);
	}
}

function doWeb(doc, url)
{
	var items = getSearchResults(doc);
	if (items)
	{
		Z.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var links = new Array();
			for (var i in selectedItems) {
				links.push(getMarcUrl(i));
			}
			ZU.processDocuments(links, scrape);
		});
	} else {
		// Looking for ID
		var memRecordId = ZU.xpathText(doc, '(//input[@id="memRecordId"])[1]/@value');
		var urlMarc = getMarcUrl(memRecordId);
		if (urlMarc)
		{
			ZU.processDocuments(urlMarc, scrape);	
		}
	}
}

function getMarcUrl(memRecordId)
{
	if (match = memRecordId.match(/^([^:]*):(.*)$/))
	{
		var url = '/portailccfr/jsp/ccfr/view/';
		if (memRecordId.indexOf('oai') == 0)
		{
			url = url + "oai/";
		}
		url = url + encodeURIComponent(match[1]) + '_pro.jsp?recordId=' + encodeURIComponent(memRecordId);
		return url;
	}
	else
	{
		return false;
	}
}

function scrape(newDoc, uri)
{
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {
		
		var record = new marc.record();
		
		var xpath = '//table/tbody/tr';
		var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
		while (elmt = elmts.iterateNext()) {
			var field = newDoc.evaluate('./th[1]/text()[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue;
			var ind = newDoc.evaluate('./td[1]/text()[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue;
			ind = ZU.trimInternal(ind);
			var value = newDoc.evaluate('./td[2]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			value = ZU.trimInternal(value);
			value = value.replace(/\$/g, marc.subfieldDelimiter);

			if (field == "LABEL")
			{
				record.leader = value;
			}
			else
			{
				record.addField(field, ind, value);
			}
		}
		var newItem = new Zotero.Item();
		record.translate(newItem);
		newItem.complete();
	});
}

function CCFRTypeDoc(doc)
{
	if ( (ZU.xpathText(doc, "//div[@class='notice-contenu']")) && (ZU.xpathText(doc, "//div[@id='vueCourante']/table/tbody/tr")) )
	{
		var xpath = "//div[@id='vueCourante']/table/tbody/tr";
		var rows = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		while (row = rows.iterateNext()) 
		{
			var label = ZU.trimInternal(doc.evaluate("./th[@class='view-field-label-ccfr']", row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
			
			if (label == "Type document")
			{
				var value = doc.evaluate("./td[@class='view-field-value-ccfr']", row, null, XPathResult.ANY_TYPE, null).iterateNext();
				var valueTxt = ZU.trimInternal(value.textContent);
				
				switch (valueTxt) {
					case "Livre":
						return "book";
						break;
					case "Document électronique":
						return "book";
						break;
					case "Document sonore":
						return "audioRecording";
						break;
					case "Images Animées":
						return "film";
					case "Carte":
						return "map";
					default:
						Zotero.debug("Unmanaged doc type : " + valueTxt);
						return "book";
				}
			}
		}
	}
	else
	{
		return null;
	}
}

function getSearchResults(doc) {
	var items = {},
		rec = doc.getElementsByName('record');
	if (!doc.getElementById('sourceResultsPane')) return false;

	var xpath = "//form[@name='frmSearchResult']/table";
	var rows = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
	var row;

	var found = false;
	
	while (row = rows.iterateNext()) 
	{
		found = true;
		var id = doc.evaluate(".//td[@class='ident-check']/input[@type='checkbox']", row, null, XPathResult.ANY_TYPE, null).iterateNext().value;
		var title = ZU.trimInternal(doc.evaluate(".//td[@class='Ident']/span/a[@title='Voir la Notice']", row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		items[id] = title;
	}
	return found ? items : false;
}
