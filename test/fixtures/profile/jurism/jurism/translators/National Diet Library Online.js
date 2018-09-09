{
	"translatorID": "6c51f0b2-75b2-4f4c-aa40-1e6bbbd674e3",
	"label": "National Diet Library Online",
	"creator": "Frank Bennett",
	"target": "https://ndlonline.ndl.go.jp/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2018-05-14 03:53:44"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Frank Bennett

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

/*
  Some special conditions:
	OK convert Imperial dates to Gregorian
	OK if responsibility contains "edited" or "editor," set author as editor.
	OK if type is Kikaku and no standardno, set as report.
	OK responsibility as author (or Institution, if report), if no other evidence of authorship.
*/


var typeMap = {
	Eizo: "videoRecording",
	Tosho: "book",
	Kiji: "journalArticle",
	Rokuon: "audioRecording",
	Hakuron: "thesis",
	Map: "map",
	Kikaku: "standard",
	Sasshi: "journalArticle"
};

function getPageUrl(key) {
	return "https://ndlonline.ndl.go.jp/detail/" + key;
}

var headers = {
	"referer": "https://ndlonline.ndl.go.jp/"
};

function getKeyFromUrl(url) {
	var key = null;
	var m = url.match(/detail\/([^\/]+)/);
	if (m) {
		key = m[1];
	}
	return key;
}

function getJsonUrl(url, tryForPDF) {
	var key = getKeyFromUrl(url);
	var jsonUrlTemplate;
	if (tryForPDF) {
		jsonUrlTemplate = "https://ndlonline.ndl.go.jp/risapi/search?biblevel=3&database=DD_Internet&identifier={ key }&page=1&rows=20&searchPattern=ris_simple&start=0&translate=false";
	} else {
		jsonUrlTemplate = "https://ndlonline.ndl.go.jp/risapi/search?id={ key }&lang=ja_JP&page=1&rows=20&searchPattern=ris_simple&start=0";
	}
	return jsonUrlTemplate.replace(/{\s+key\s+}/, key);
}

function callData(urls, headers) {
	var jsonUrls = [];
	for (var url of urls) {
		jsonUrls.push(getJsonUrl(url));
	}
	ZU.doGet(jsonUrls, scrape, false, "utf8", headers);
}

function setCreators(details, item) {
	var creatorType = sniffEditor(details);
	var creatorSplit;
	if (details.creator) {
		for (var cObj of details.creator) {
			for (var i=0,ilen=cObj.length; i<ilen; i++) {
				if (cObj[i] === "creator") {
					var newCreator = {};
					var creatorParts = cObj.slice(i+2);
					for (var creatorPart of creatorParts) {
						if (creatorPart[0] === "name") {
							creatorSplit = creatorPart[2].split(/\s+/);
							if (creatorSplit.length > 2) {
								creatorSplit[1] = creatorSplit.slice(1).join(" ");
							}
							if (creatorSplit[1] && creatorSplit[1].match(/[0-9]{4}-[0-9]{4}/)) continue;
							newCreator.lastName = creatorSplit[0].replace(/,$/, "");
							newCreator.firstName = creatorSplit[1];
							newCreator.creatorType = creatorType;
						} else if (creatorPart[0] === "transcription") {
							creatorSplit = creatorPart[2].split(/(?:\/\/|,)/);
							newCreator.multi = {
								_key: {
									"en": {
										lastName: creatorSplit[0],
										firstName: creatorSplit[1],
										creatorType: creatorType
									}
								}
							};
						}
					}
					item.creators.push(newCreator);
				}
			}
		}
	} else if (details.responsibility) {
		for (var name of details.responsibility) {
			var nameSplit = name.split(/\s*,\s*/);
			if (nameSplit.length === 2) {
				item.creators.push({
					lastName: nameSplit[0],
					firstName: nameSplit[1],
					creatorType: "author"
				});
			} else if (item.itemType === "report") {
				item.institution = name;
			} else {
				item.creators.push({
					lastName: name,
					fieldMode: 1,
					creatorType: item
				});
			}
		}
 	}
}

function setPublisherInfo(details, item) {
	if (details.publisherInfo) {
		var pObj = details.publisherInfo[0];
		if (pObj[0] === "publisher") {
			for (var p of pObj.slice(2)) {
				if (p[0] === "name") {
					item.publisher = p[2];
				} else if (p[0] === "location") {
					item.place = p[2];
				}
			}
		}
	}
}

function setPublicationName(details, item, altLang) {
	// Publication names can be kind of messy.
	if (details.publicationName) {
		var institutionalEditor = false;
		var publicationSplit = details.publicationName[0].split(/\s+=\s+/);
		var publicationMainSplit = publicationSplit[0].split(/\s+\/\s+/);
		item.publicationTitle = publicationMainSplit[0];
		if (publicationMainSplit[1]) {
			institutionalEditor = {
				lastName: publicationMainSplit[1].replace(/\u7d38/, ""),
				fieldMode: 1,
				creatorType: "editor"
			};
		}
		if (publicationSplit[1]) {
			var publicationAlternativeSplit = publicationSplit[1].split(/\s+\/\s+/);
			item.multi._keys.publicationTitle = {};
			item.multi._keys.publicationTitle[altLang] = publicationAlternativeSplit[0];
			if (publicationAlternativeSplit[1] && institutionalEditor) {
				institutionalEditor.multi = {_key:{}};
				institutionalEditor.multi._key[altLang] = {
					lastName: publicationAlternativeSplit[1],
					fieldMode: 1,
					creatorType: "editor"
				};
			}
		}
		if (institutionalEditor) {
			item.creators.push(institutionalEditor);
		}
	}
}

var zenkakuRex = function () {
	var zenkakuNums = ["\uff10", "\uff11", "\uff12", "\uff13", "\uff14", "\uff15", "\uff16", "\uff17", "\uff18", "\uff19"];
	for (var i=0,ilen=zenkakuNums.length; i<ilen; i++) {
		zenkakuNums[i] = new RegExp(zenkakuNums[i], "g");
	}
	return zenkakuNums;
}();

function getItemType(details) {
	var ndlType = details.risMaterialType[0];
	var itemType = typeMap[ndlType] ? typeMap[ndlType] : "report";
	return itemType;
}

function convertImperialDate(dateStr) {
	var eraOffsetMap = {
		"\u660E\u6CBB": 1867,
		"\u5927\u6B63": 1911,
		"\u662D\u548C": 1925,
		"\u5e73\u6210": 1988
	};
	// 元年
	dateStr = dateStr.replace("\u5143\u5E74", "1\u5E74");
	for (var i=0,ilen=zenkakuRex.length; i<ilen; i++) {
		dateStr = dateStr.replace(zenkakuRex[i], i);
	}
	// 明治|大正|昭和|平成...年...月...日
	var m = dateStr.match(/(\u660E\u6CBB|\u5927\u6B63|\u662D\u548c|\u5e73\u6210)([0-9]+)\u5e74(?:([0-9]+)(?:\u6708([0-9]+)\u65e5)*)*/);
	if (m) {
		var era = m[1];
		var year = (parseInt(m[2], 10) + eraOffsetMap[m[1]]);
		if (!isNaN(year)) {
			var dateStr = [year, m[3], m[4]]
				.filter(function(elem){
					return elem;
				}).map(function(elem){
					while (elem.length < 2) {
						elem = "0" + elem;
					}
					return elem;
				}).join("-");
		}
	}
	return dateStr;
}

var fields = [
	{ ndl: "language", conv: "language" },
	{ ndl: "title", conv: "title" },
	{ ndl: "volumeDate", conv: "date" },
	{ ndl: "pageRange", conv: "pages" },
	{ ndl: "degreeGrantor", conv: "university" },
	{ ndl: "degreeName", conv: "thesisType" },
	{ ndl: "dateGranted", conv: "date" },
	{ ndl: "dissertationno", conv: "archiveLocation" },
	{ ndl: "publicationDate", conv: "date" },
	{ ndl: "scale", conv: "scale" },
	{ ndl: "edition", conv: "edition" },
	{ ndl: "seriesTitle", conv: "seriesTitle" },
	{ ndl: "standardno", conv: "number" },
	{ ndl: "doi", conv: "DOI" },
	{ ndl: "isbn", conv: "ISBN" }
];

function setFields(details, item, altLang) {
	for (var field of fields) {
		if (details[field.ndl]) {
			var val = details[field.ndl][0];
			// remove enclosing parens
			val = val.replace(/^\((.*)\)$/, "$1");
			// split and multilingualize
			var valSplit = val.split(/\s+=\s+/);
			val = valSplit[0];
			if (valSplit[1]) {
				item.multi._keys[field.conv] = {};
				item.multi._keys[field.conv][altLang] = valSplit[1];
			}
			item[field.conv] = val;
		}
	}
}

function sniffEditor(details) {
	var creatorType = "author";
	if (details.responsibility) {
		for (var r of details.responsibility) {
			if (r.match(/(editor|edited)/i)) {
				creatorType = "editor";
			}
		}
	}
	return creatorType;
}

function scrape(jsonTxt) {
	var obj = JSON.parse(jsonTxt);
	// Uncomment to dump the data object in all its glory
	// Zotero.debug(JSON.stringify(obj, null, 1));
	obj = obj.response.docs[0];
	var details = obj.view_detailParameters;

	var itemType = getItemType(details);
	var item = new Zotero.Item(itemType);

	var altLang;
	if (item.language === "jpn") {
		altLang = "en";
	} else {
		altLang = "ja";
	}

	setFields(details, item, altLang);
	if (item.itemType === "standard" && !item.number) {
		item.itemType = "report";
	}
	setCreators(details, item);
	setPublisherInfo(details, item);
	setPublicationName(details, item, altLang);

	
	if (item.date) {
		item.date = item.date.split(":").slice(-1)[0].replace(/\./g, "-");
		item.date = convertImperialDate(item.date);
		if (item.date.match(/^c[0-9]/)) {
			item.date = item.date.slice(1);
		}
		var dateSplit = item.date.split("-");
		for (var i=0,ilen=dateSplit.length; i<ilen; i++) {
			if (dateSplit[i].match(/^[0-9]+$/)) {
				while (dateSplit[i].length < 2) {
					dateSplit[i] = "0" + dateSplit[i];
				}
			}
		}
		item.date = dateSplit.join("-");
	}

	if (item.title) {
		item.title = item.title.replace(/^\[(.*)\]$/, "$1");
	}
	item.url = getPageUrl(obj.risGrouping_parentIssToken_ssd);

	item.multi._keys.title = {};
	if (details.alternative) {
		item.multi._keys.title[altLang] = details.alternative[0];
	}
	
	if (details.titleTranscription) {
		item.multi._keys.title['ja-Kana'] = details.titleTranscription[0];
	}
	
	if (details.issue) {
		item.issue = details.issue[0];
	} else {
		if (details.publicationVolume) {
			item.volume = details.publicationVolume[0].replace(/^\((.*)\)$/, "$1");
		}
		if (details.number) {
			item.issue = details.number[0];
		}
	}
	
	if (item.pages) {
		item.pages = item.pages.replace(/\u301c/g, "-");
	}
	
	// If attachments are available, process them assuming they are all PDF files.
	// Otherwise, complete immediately.
	var secondUrl = getJsonUrl(item.url, true);
	ZU.doGet([secondUrl], function(jsonTxt) {
		var obj = JSON.parse(jsonTxt);
		// Zotero.debug(JSON.stringify(obj,null, 2));
		if (obj.response && obj.response.docs && obj.response.docs.length) {
			obj = obj.response.docs[0];
			if (obj.view_sameAs && obj.view_sameAs.length) {
				var attachmentUrls = [];
				for (var attch of obj.view_sameAs) {
					if (attch[0] === "sameAs" && attch[1].resource) {
						attachmentUrls.push(attch[1].resource);
					}
				}
				ZU.processDocuments(attachmentUrls,
									function(doc, url) {
										// There has to be a better way to do this.
										var urlNode = ZU.xpath(doc, "//meta[@http-equiv='Refresh']")[0];
										var attachmentUrl = urlNode.getAttribute('content');
										attachmentUrl = attachmentUrl.split(';').slice(-1)[0].slice(4);
										attachmentUrl = "http://dl.ndl.go.jp" + attachmentUrl;
										item.attachments.push({
											title: item.title,
											mimeType: "application/pdf",
											url: attachmentUrl
										});
									},
									function() {
										item.complete();
									});
			} else {
				item.complete();
			}
		} else {
			item.complete();
		}
	}, false, "utf8", headers);
}

function checkPageType(doc, url, returnData) {
	var info = {};
	// materialTitle class occurws only in search-result pages.
	var multipleNodes = ZU.xpath(doc, "//a[contains(@class, 'materialTitle')]");
	if (multipleNodes.length) {
		info.multiple = {};
		info.multiple.urlMap = {};
		var rowNodes = ZU.xpath(doc, "//div[contains(@class, 'rowContainer')]");
		for (var rowNode of rowNodes) {
			var titleNode = ZU.xpath(rowNode, ".//a[contains(@class, 'materialTitle')]")[0];
			if (titleNode) {
				var prefixNote = "";
				var hasDigital = ZU.xpath(rowNode, ".//p[contains(@class, 'digital')]/a")[0];
				if (hasDigital) {
					prefixNote = "[PDF] ";
				}
				var childUrl = titleNode.getAttribute("href");
				var val = titleNode.textContent.trim();
				info.multiple.urlMap[childUrl] = prefixNote + val;
			}
		}
	} else {
		// Exactly one anchor with class optAct-linker occurs in item pages. This is the sole
		// source of the ID needed to build the JSON urls, apart from the URL (which isn't correct
		// in this phase).)
		var singleNode = ZU.xpath(doc, "//a[contains(@class, 'optAct-linker')]")[0];
		if (singleNode) {
			info.single = {};
			var key = singleNode.getAttribute('href');
			key = key.replace(/^.*issToken=/, "").replace(/\&.*$/, "");
			var url = "detail/" + key;
			info.single.url = url;
		} else if (url.match(/detail\//)) {
			// If we still don't know the page type, check to see if
			// it's obviously a single by the url.
			info.single = {};
			info.single.url = url;
		}
	}
	return info;
}


/*
 * About detectWeb() in this translator ...
 *
 * The NDL Online pages do not push state at the completion of page load.
 * As a result, in search pages, and in item pages accessed by clicking
 * through from a search list, the URL exposed in the DOM is only a stub,
 * without the "detail" or "search" elements needed to detect the type of
 * resource. Also, when clicking through from a search list, the URL stub
 * does not change, so detectWeb() does not run automatically.
 *
 * The state associated with the stub URL is only a tiny skeleton with
 * no meaningful content. To get the full loaded page, we need to use
 * monitorDOMChanges on the entire body element, tracking all children.
 * That works, but it gives rise to an additional problem.
 *
 * If this monitorDOMChanges() is applied to item pages accessed via
 * selectItems(), it forces a rerun of detectWeb() in the middle of the
 * call, which clobbers the selection so that nothing is downloaded.
 *
 * The solution is to attempt to identify single items by their URL
 * as a fallback, applying monitorDOMChanges() to the page only when
 * absolutely necessary. When URL detection works, there is no need
 * to acquire the full DOM, since the URL includes the key needed
 * to retrieve the raw JSON data that we use for translation.
 */

function detectWeb(doc, url) {
	// URL is not properly updated, and doc is initially delivered as a bare skeleton.
	// To make things work, we need to monitor ALL changes to body.
	var info = checkPageType(doc, url);
	if (info.multiple) {
		return "multiple";
	} else if (info.single) {
		return "journalArticle";
	} else {
		var body = ZU.xpath(doc, "//body")[0];
		Z.monitorDOMChanges(body, {childList: true, subtree: true});
		if (info.single) {
			return "journalArticle";
		}
	}
	return false;
}

function doWeb(doc, url) {
	var info = checkPageType(doc, url, true);
	if (info.single) {
		callData([info.single.url], headers);
	} else if (info.multiple) {
		var urlMap = info.multiple.urlMap;
		Z.selectItems(urlMap, function(itemUrls) {
			var urls = Object.keys(itemUrls);
			callData(urls, headers);
		});
	}
}

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000003-I9492399-00",
		"items": [
			{
				"itemType": "thesis",
				"title": "引用ダイナミクスを用いた萌芽的論文の早期特定に関する研究",
				"creators": [],
				"date": "2014-03-24",
				"archiveLocation": "甲第30353号",
				"language": "jpn",
				"libraryCatalog": "National Diet Library Periodicals",
				"thesisType": "博士(工学)",
				"university": "University of Tokyo(東京大学)",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000003-I9492399-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	*/
	
	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000008864580-00",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "The Lounge Lizards",
				"creators": [],
				"date": "[19--]",
				"label": "ポリド-ル",
				"libraryCatalog": "National Diet Library Periodicals",
				"place": "東京",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000008864580-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	*/

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000009236312-00",
		"items": [
			{
				"itemType": "book",
				"title": "Choctaw tales / collected and annotated by Tom Mould",
				"creators": [
					{
						"lastName": "Mould,",
						"firstName": "Tom,",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"date": "2004",
				"ISBN": "9781578066827",
				"language": "eng",
				"libraryCatalog": "National Diet Library Periodicals",
				"place": "Jackson",
				"publisher": "University Press of Mississippi",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000009236312-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	*/

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000002092584-00",
		"items": [
			{
				"itemType": "book",
				"title": "Postwar American fiction, 1945-1965. 2nd series",
				"creators": [
					{
						"lastName": "岩元,",
						"firstName": "巌,",
						"creatorType": "editor",
						"multi": {
							"_key": {
								"en": {
									"lastName": "イワモト",
									"firstName": " イワオ",
									"creatorType": "editor"
								}
							}
						}
					}
				],
				"date": "1990",
				"ISBN": "9784653021285",
				"language": "eng",
				"libraryCatalog": "National Diet Library Periodicals",
				"place": "Kyoto",
				"publisher": "Rinsen Book",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000002092584-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	*/

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000003997371-00",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "用心棒",
				"creators": [],
				"date": "2002-12",
				"libraryCatalog": "National Diet Library Periodicals",
				"studio": "東宝ビデオ",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000003997371-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
	*/

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000004398242-00",
		"items": [
			{
				"itemType": "report",
				"title": "Technical report",
				"creators": [
					{
						"lastName": "Van Hoven",
						"firstName": "Raymond L",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"libraryCatalog": "National Diet Library Periodicals",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000004398242-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
 			}
 		]
 	}
	*/

	/*
	 * Item type mismatch
	 *
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000001-I000008532777-00",
		"items": [
			{
				"itemType": "book",
				"title": "Het goede en het mooie : de geschiedenis van Kris-Kras : ter nagedachtenis aan Ilona Fennema-Zboray (1914-2001) / Peter van den Hoven",
				"creators": [
					{
						"lastName": "Hoven",
						"firstName": "Peter van den",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"date": "2004",
				"ISBN": "9789054835295",
				"language": "dut",
				"libraryCatalog": "National Diet Library Periodicals",
				"place": "Leidschendam",
				"publisher": "Biblion Uitgeverij",
				"shortTitle": "Het goede en het mooie",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000001-I000008532777-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
	*/


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000002-I028926334-00",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "大阪民事実務研究会 近時の判例等を踏まえた動機の錯誤の検討",
				"creators": [
					{
						"lastName": "塩原",
						"firstName": "学",
						"creatorType": "author",
						"multi": {
							"_key": {
								"en": {
									"lastName": "シオハラ",
									"firstName": "マナブ",
									"creatorType": "author"
								}
							}
						}
					}
				],
				"date": "2018-04",
				"issue": "1445",
				"language": "jpn",
				"libraryCatalog": "National Diet Library Periodicals",
				"pages": "5-41",
				"publicationTitle": "判例タイムズ",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000002-I028926334-00",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ndlonline.ndl.go.jp/#!/detail/R300000002-I025383018-00",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "難病対策の概要と立法化への経緯 : 医療費助成と検討経緯を中心に",
				"creators": [
					{
						"lastName": "泉",
						"firstName": "眞樹子",
						"creatorType": "author",
						"multi": {
							"_key": {
								"en": {
									"lastName": "イズミ",
									"firstName": "マキコ",
									"creatorType": "author"
								}
							}
						}
					}
				],
				"date": "2014-04-08",
				"issue": "823",
				"language": "jpn",
				"libraryCatalog": "National Diet Library Periodicals",
				"pages": "巻頭1p,1-12",
				"publicationTitle": "調査と情報",
				"shortTitle": "難病対策の概要と立法化への経緯",
				"url": "https://ndlonline.ndl.go.jp/detail/R300000002-I025383018-00",
				"attachments": [
					{
						"title": "難病対策の概要と立法化への経緯 : 医療費助成と検討経緯を中心に",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
