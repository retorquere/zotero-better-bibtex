{
	"translatorID": "88e11bcb-464d-4b6d-a446-8994e3b865c9",
	"label": "Web of Science",
	"creator": "Philipp Zumstein",
	"target": "^https?://([^/]+\\.)?webofknowledge\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2015-06-04 04:20:22"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if ( (url.includes("full_record.do")
		|| url.includes("CitedFullRecord.do")
		|| url.includes("InboundService.do") )
		&& getSingleItemId(doc)
	) {
		return "journalArticle";
	} else if (((doc.title.includes(" Results"))
		|| url.includes("search_mode="))
		&& getRecords(doc).length) {
		return "multiple";
	}
}

function getRecords(doc) {
	return ZU.xpath(doc, '//span[@id="records_chunks"]//div[starts-with(@id,"RECORD_")]');
}

function getSingleItemId(doc) {
	var form = doc.forms['records_form'];
	if (form) return (form.elements.namedItem('marked_list_candidates') || {}).value;

	return false;
}

function doWeb(doc, url) {
	var ids = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object;
		var records = getRecords(doc);
		var recordID, title;
		for (var i=0, n=records.length; i<n; i++) {
			recordID = ZU.xpathText(records[i], './/input[@name="marked_list_candidates"]/@value');
			title = ZU.xpathText(records[i], './/a[contains(@href, "/full_record.do?")]|.//a[contains(@href, "/CitedFullRecord.do?")]');
			
			if (!title || !recordID) continue;
			
			items[recordID] = title.trim();
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) return true;

			var ids = [];
			for (var i in items) {
				ids.push(i);
			}
			
			// Due to a long-standing bug in connectors, when no items are selected,
			// an empty object is returned instead of false, so we actually do get to
			// this point. Furthermore, WoS appears to export all results if no IDs
			// are supplied. So this is a hack to avoid this very special case.
			// See https://github.com/zotero/zotero-connectors/pull/36
			if (!ids.length) return true;
			
			fetchIds(ids, doc);
		});
	} else {
		fetchIds([getSingleItemId(doc)], doc);
	}
}

function getHiddenValues(form) {
	var inputs = form.elements;
	var values = {};
	var node;
	for (var i=0; node = inputs.item(i); i++) {
		if (node.type == 'hidden') {
			values[node.name] = node.value;
		}
	}
	return values;
}

function serializePostData(data) {
	var str = '';
	for (var i in data) {
		str += '&' + encodeURIComponent(i) + '='
			+ encodeURIComponent(data[i]).replace(/%20/g, "+");
	}
	return str.substr(1);
}

function getOutputForm(doc) {
	return doc.forms['output_form'] || doc.forms['records_form'] || doc.forms['summary_records_form'];
}

function importISIRecord(text) {
	Z.debug(text);
	var importer = Zotero.loadTranslator("import");
	importer.setTranslator("594ebe3c-90a0-4830-83bc-9502825a6810");
	importer.setString(text);
	importer.setHandler('itemDone', function(obj, item) {
		if (item.title.toUpperCase() == item.title) {
			item.title = ZU.capitalizeTitle(item.title, true);
		}
		
		var creator;
		for (var i=0, n=item.creators.length; i<n; i++) {
			creator = item.creators[i];
			if (creator.firstName.toUpperCase() == creator.firstName) {
				creator.firstName = ZU.capitalizeTitle(creator.firstName, true);
			}
			if (creator.lastName.toUpperCase() == creator.lastName) {
				creator.lastName = ZU.capitalizeTitle(creator.lastName, true);
			}
		}
		item.complete();
	});
	importer.translate();
}

function fetchIds(ids, doc) {
	var outputForm = getOutputForm(doc);
	var postData = getHiddenValues(outputForm);
	var filters = 'USAGEIND RESEARCHERID ACCESSION_NUM FUNDING SUBJECT_CATEGORY '
		+ 'JCR_CATEGORY LANG IDS PAGEC SABBR CITREFC ISSN PUBINFO KEYWORDS '
		+ 'CITTIMES ADDRS CONFERENCE_SPONSORS DOCTYPE ABSTRACT CONFERENCE_INFO '
		+ 'SOURCE TITLE AUTHORS '
		//additional fields from INSPEC
		+ 'ADDRESS AUTHORS_EDITORS AUTHORSIDENTIFIERS CLASSIFICATION_CODES '
		+ 'CONFERENCE_SPONSORS DESCRIPTORS IDENTIFYING_CODES IMAGES '
		+ 'INVENTORS_ASSIGNEES IPC NUM_OF_REF PATENT_INFO SPONSORS TRANSLATORS '
		+ 'TREATMENT UNCONTROLLED_TERMS';
	postData['value(record_select_type)'] = 'selrecords';
	postData['markFrom'] = '';
	postData['markTo'] = '';
	postData['fields_selection'] = filters;
	postData['filters'] = filters;
	postData['save_options'] = 'othersoftware';
	postData['format'] = 'saveToRef';

	//add selected items
	var selectedIds = ids.join(';');
	postData['selectedIds'] = selectedIds;

	var postUrl = outputForm.action;
	Z.debug("Posting to " + postUrl);
	/**
	 * Note that when using the form on the page, the request ends up redirecting
	 * to ets.webofknowledge.com which makes it cross-origin. Somehow, this POST
	 * avoids the redirect, so things just work, but if the behavior changes in
	 * the future, it would break scraping on IE/bookmarklet and Safari
	 */
	ZU.doPost(postUrl, serializePostData(postData), function (text) {
		//check if there's an intermediate page
		if (text.indexOf('FN ') === 0) {
			importISIRecord(text);
			return;
		}
		
		//otherwise we have an intermediate page (maybe... it just kind of went away one day)
		//everything it mostly the same as above except for a few fields
		var postData2 = {};
		postData2['locale'] = postData['locale'];
		postData2['colName'] = postData['colName'];
		postData2['sortBy'] = postData['sortBy'];
		postData2['SID'] = postData['SID'];
		postData2['filters'] = postData['filters'];
		postData2['fileOpt'] = 'fieldtagged';
		postData2['action'] = 'saveDataToRef';
		postData2['product'] = 'UA';
		postData2['numRecords'] = ids.length;
		postData2['numRecsToRetrieve'] = 500;
		
		var qid = text.match(/<input[^>]+name=(['"]?)qid\1[\s\/][^>]*/);
		if (qid) qid = qid[0].match(/value=['"]?(\d+)/);
		if (qid) {
			qid = qid[1];
		} else {
			qid = postData['qid']*1+1;	//this can be wrong if pages are refreshed
			Z.debug("Could not find qid on page. Using 1 + previous qid: " + qid);
			text = text.replace(/\s*[\r\n]\s*/g, '\n');	//trim out the extra newlines
			var forms = text.match(/<form[\s\S]+?<\/form>/ig);
			if (forms) {
				Z.debug("Page contained the following forms:");
				Z.debug(forms.join('\n==============================\n'));
			} else {
				Z.debug("Could not find any forms on the page. Here's the whole HTML");
				Z.debug(text);
			}
		}
		postData2['qid'] = qid;
		
		var postUrl2 = 'http://ets.webofknowledge.com/ETS/saveDataToRef.do';	//Zotero should take care of proxies
		ZU.doPost(postUrl2, serializePostData(postData2), function(text) {
			importISIRecord(text);
		}, { 'Referer': postUrl });

	}, { 'Referer': doc.location.href });
}
