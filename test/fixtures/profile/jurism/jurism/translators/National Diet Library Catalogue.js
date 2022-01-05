{
	"translatorID": "5978580d-c58c-46c8-9755-9481a3e20f3f",
	"label": "National Diet Library Catalogue",
	"creator": "Philipp Zumstein",
	"target": "^https?://iss\\.ndl\\.go\\.jp/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-08-15 16:07:22"
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
	if (url.indexOf('/books/')>-1) {
		var type = ZU.xpathText(doc, '//div[@id="thumbnail"]');
		return getItemType(type);
	} else if (url.indexOf('books?')>-1 &&  getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getItemType(type) {
	//http://www.ndl.go.jp/jp/aboutus/standards/meta/2011/12/ndl-type.rdf
	if (type) {
		switch (type.trim()) {
			case "録音図書": //Audio Book
			case "録音図書(CD・DVD)": //Audio Book In Sound Disc
			case "録音図書(カセットテープ)": //Audio Book In Sound Tape
			case "カセットテープ": //Cassette Tape
			case "CD": //CD
			case "視覚障害者向け資料": //Materials For Visually Handicapped People
			case "音楽": //Music
			case "レコード": //Record
			case "音声再生用ディスク": //Sound Disc
			case "音声再生用テープ": //Sound Tape
				return "audioRecording";
				break;
			case "雑誌記事": //Article
			case "記事・論文":
				return "journalArticle";
				break;
			case "人工物": //Artifact
			case "博物資料": //Museum Material
			case "自然物": //Naturally Occurring Object
			case "絵画": //Painting
			case "写真": //Photograph
			case "絵葉書": //Picture Postcard
			case "ポスター": //Poster	
				return "artwork";
				break;
			case "CD-ROM": //CD-ROM
			case "コンピュータディスク": //Computer Disc
			case "コンピュータ・プログラム": //Computer Program
			case "フォント": //Font
			case "ゲーム": //Game
			case "磁気ディスク": //Magnetic Disk
				return "computerProgram";
				break;
			case "文書データ": //Document
			case "手稿および書写資料": //Manuscript
				return "manuscript";
				break;
			case "地図": //Map
				return "map";
				break;
			case "スライド": //Slide
				return "presentation";
				break;
			case "書誌データ": //Bibliographic Data
			case "カード式資料": //Card Form
			case "政府刊行物": //Government Publication
			case "地方公共団体刊行物": //Local Publication
			case "官公庁刊行物": //National Publication
			case "国立国会図書館刊行物": //NDL Publication
			case "数値データ": //Numeric Data
			case "テクニカルリポート":	 //Technical Report
			return "report";
				break;
			case "立法情報": //Legislative Information
			case "レーザーディスク"	: //LD
				return "statute";
				break;	
			case "博士論文": //Doctoral Dissertation
				return "thesis";
				break;
			case "ブルーレイディスク": //Blu-ray Disc
			case "DVD": //DVD
			case "ビデオカセット": //Video Cassette
			case "ビデオディスク": //Video Disc
				return "videoRecording";
				break;
			case "パッケージ系電子資料": //Electronic Resource
			case "オンライン資料": //Online Resource
			case "オンラインジャーナル": //Online Journal
				return "webpage";
				break;
			default:
				return "book";
		}
	} else {
		return "book";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[contains(@class, "item_result")]//h3/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	// e.g. url = http://iss.ndl.go.jp/books/R100000039-I001424605-00?locale=en&ar=4e1f
	// urlJSON = http://iss.ndl.go.jp/books/R100000039-I001424605-00.json
	var m = url.match(/\/books\/([A-Z\d\-]+)/);
	var urlJSON = m[0] + ".json";
	ZU.doGet(urlJSON, function(text) {
		var json = JSON.parse(text);
		//Z.debug(json);
		var type = getItemType( json.materialType[0] );
		var newItem = new Zotero.Item(type);
		newItem.title = json.title[0].value;
		
		if (json.issued) {
			newItem.date = json.issued[0];
		}
		if (json.publisher) {
			newItem.publisher = json.publisher[0].name;
			newItem.place = json.publisher[0].location;
		}
		if (json.extent && /\d+/.test( json.extent[0] )) {
			newItem.numPages = json.extent[0].match(/\d+/)[0];
		}
		
		if (json.publicationName) {
			newItem.publicationTitle = json.publicationName.value;
			newItem.volume = json.publicationName.number;
			newItem.pages = json.publicationName.pageRange;
		}
		
		//language is not in the json output
		var lang = ZU.xpathText(doc, '//tr[ th[contains(text(), "ISO639-2")] ]/td');
		if (lang) {
			newItem.language = lang.replace(/[^a-z]/g, "");
		}
		
		if (json.identifier && json.identifier.DOI) {
			newItem.DOI = json.identifier.DOI;
		}
		
		var creatorList = json.creator || json.dc_creator;
		if (creatorList) {
			for (var i=0; i<creatorList.length; i++) {
				var name = creatorList[i].name.replace(/,\s*\d{4}-\d{4}\s*$/, ""); 
				newItem.creators.push( ZU.cleanAuthor(name, "author") );
			}
		}
		
		if (json.subject && json.subject.value) {
			var tagList = json.subject.value;
			for (var i=0; i<tagList.length; i++) {
				newItem.tags.push( tagList[i] );
			}
		}
		
		newItem.attachments.push({
			title: "NDL Catalogue",
			url: json.link,
			mimeType: "text/html",
			snapshot: false
		});

		newItem.complete();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://iss.ndl.go.jp/books/R000000004-I023161505-00",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "21年度社会保障給付費 過去最高の99.9兆円 : 国民所得割合は29.4%に上昇",
				"creators": [],
				"date": "2011-11-00",
				"language": "jpn",
				"libraryCatalog": "National Diet Library Catalogue",
				"pages": "25-27",
				"publicationTitle": "健保ニュース",
				"shortTitle": "21年度社会保障給付費 過去最高の99.9兆円",
				"volume": "1950",
				"attachments": [
					{
						"title": "NDL Catalogue",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://iss.ndl.go.jp/books/R100000039-I001424605-00?locale=en&ar=4e1f",
		"items": [
			{
				"itemType": "book",
				"title": "栄養之合理化",
				"creators": [
					{
						"firstName": "佐伯",
						"lastName": "矩",
						"creatorType": "author"
					},
					{
						"firstName": "佐伯矩",
						"lastName": "[述",
						"creatorType": "author"
					}
				],
				"date": "1930",
				"language": "jpn",
				"libraryCatalog": "National Diet Library Catalogue",
				"numPages": "26",
				"place": "名古屋",
				"publisher": "愛知標準精米普及期成会",
				"attachments": [
					{
						"title": "NDL Catalogue",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://iss.ndl.go.jp/books/R100000002-I000006426972-00",
		"items": [
			{
				"itemType": "book",
				"title": "Die Bildungsfrage als sociales Problem. Von Prof. Dr. Mannheimer ..",
				"creators": [
					{
						"firstName": "Mannheimer",
						"lastName": "Adolf",
						"creatorType": "author"
					}
				],
				"date": "1901",
				"language": "ger",
				"libraryCatalog": "National Diet Library Catalogue",
				"numPages": "156",
				"place": "Jena",
				"publisher": "G. Fischer",
				"attachments": [
					{
						"title": "NDL Catalogue",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Education",
					"University extension"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/