{
	"translatorID": "c1f99315-2257-4a32-af1e-68cd8b7bc838",
	"translatorType": 4,
	"label": "Womennews",
	"creator": "Kagami Sascha Rosylight",
	"target": "^https?://www\\.womennews\\.co\\.kr",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 17:30:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	womennews.co.kr (여성신문) Translator
	Copyright © 2021 Kagami Sascha Rosylight

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

/* global attr */

function detectWeb(doc, url) {
	if (url.includes("articleView.html")) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	const items = {};
	let found = false;
	const rows = doc.querySelectorAll(".article-list-content .list-titles a");
	for (const row of rows) {
		const href = row.href;
		const title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator("web");
	// Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");

	translator.setHandler("itemDone", function (obj, item) {
		const author = attr(doc, 'meta[property="og:article:author"]', "content");
		if (author) {
			item.creators = author.split(", ").map(name => ({
				lastName: name,
				fieldMode: 1,
				creatorType: "author"
			}));
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.womennews.co.kr/news/articleView.html?idxno=211608",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "‘평택항 참사’ 이선호 아버지 “청년들, 위험한 일 안 할 권리 있다”",
				"creators": [
					{
						"lastName": "김규희 기자",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "2021-05-17T15:16:00+09:00",
				"abstractNote": "“우리 아들은 그곳이 얼마나 위험한지 알았으면 안 들어갔을 겁니다. 청년들에게 ‘위험한 일을 안 할 권리가 있다’고 말해주고 싶습니다. 시키는 대로 다 하면 안 됩니다. 위험한 일은 피해야 합니다.”아들이 일하다가 300kg 철판에 깔렸다. 처음 해보는 일이었는데, 안전교육, 안전장비, 안전관리자 아무것도 없었다. 사측은 사고 이후 119에 바로 신고하지 않고 윗선에 보고했다.‘평택항 참사’로 세상을 떠난 고(故) 이선호(23)씨 아버지 이재훈씨를 13일 경기도 평택시 안중백병원 장례식장에서 만났다. 그는 “기업들은 오로지 비용 절",
				"language": "ko",
				"libraryCatalog": "www.womennews.co.kr",
				"publicationTitle": "여성신문",
				"section": "사회",
				"url": "http://www.womennews.co.kr/news/articleView.html?idxno=211608",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "산재"
					},
					{
						"tag": "아버지"
					},
					{
						"tag": "이선호"
					},
					{
						"tag": "이재훈"
					},
					{
						"tag": "인터뷰"
					},
					{
						"tag": "참사"
					},
					{
						"tag": "청년"
					},
					{
						"tag": "평택항"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.womennews.co.kr/news/articleView.html?idxno=205665",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "[92년생 김지영③] 아직도 싸워야 한다",
				"creators": [
					{
						"lastName": "이하나",
						"fieldMode": 1,
						"creatorType": "author"
					},
					{
						"lastName": "진혜민",
						"fieldMode": 1,
						"creatorType": "author"
					},
					{
						"lastName": "김서현",
						"fieldMode": 1,
						"creatorType": "author"
					},
					{
						"lastName": "전성운 기자",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "2021-01-04T09:29:00+09:00",
				"abstractNote": "여성신문이 2021년 신년 기획 을 통해 이 시대 여성들의 목소리를 싣습니다. 82년생, 92년생, 00년생 여성의 이야기를 들으며 ‘젠더갈등’이라는 이름 아래 그동안 ‘한국형 백래시’가 어떻게 작동했는지에 주목했습니다. 뿐만 아니라 성평등한 세상을 만들기 위해 우리 사회가 노력해야 할 방안 등을 살펴보려 합니다.*편집자 주 : 백래시(Backlash)는 어떠한 아이디어, 행동 또는 물체에 대한 강한 반발을 뜻하는 단어로, 성평등 및 젠더 운동 등의 흐름에 반대하는 운동 및 세력을 ‘백래시’라 부른다. (출처 :",
				"language": "ko",
				"libraryCatalog": "www.womennews.co.kr",
				"publicationTitle": "여성신문",
				"section": "사회",
				"url": "http://www.womennews.co.kr/news/articleView.html?idxno=205665",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "92년생김지영"
					},
					{
						"tag": "고용불안"
					},
					{
						"tag": "메갈리아"
					},
					{
						"tag": "빈곤"
					},
					{
						"tag": "안전비용"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.womennews.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm",
		"items": "multiple"
	}
]
/** END TEST CASES **/
