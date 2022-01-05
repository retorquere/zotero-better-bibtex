{
	"translatorID": "f2d6c94f-ac75-4862-9364-45fb72c8e1ca",
	"translatorType": 4,
	"label": "Daum News",
	"creator": "Kagami Sascha Rosylight",
	"target": "^https?://news\\.v\\.daum\\.net/v/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 17:30:00"
}

/*
 * ***** BEGIN LICENSE BLOCK *****

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


/* global attr, text */

function detectWeb(doc, _url) {
	if (attr(doc, "meta[property='og:type']", "content") === "article") {
		return "newspaperArticle";
	}
	return false;
}

function doWeb(doc, url) {
	scrape(doc, url);
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator("web");
	// Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");

	translator.setHandler("itemDone", function (obj, item) {
		item.creators = [{
			lastName: text(doc, ".info_view .txt_info"),
			fieldMode: 1,
			creatorType: "author"
		}];
		item.publicationTitle = attr(doc, ".link_cp .thumb_g", "alt");
		item.abstractNote = item.abstractNote.replace(/^\[[^\]]+\]/, "").replace(/^.+ 기자 =/, "");
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
		"url": "https://news.v.daum.net/v/20210517200529855",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "\"가운데 여성의 손 모양이..\" 평택시, '남혐' 논란 포스터 전량 수거해 수정 배포",
				"creators": [
					{
						"lastName": "김초영",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"abstractNote": "경기 평택시가 최근 '남혐 손모양'으로 논란을 빚은 공모전 홍보 포스터를 전량 수거해 수정한 뒤 다시 배포했다고 17일 밝혔다. 수정된 포스터에는 문제가 됐던 그림이 삭제됐고, 주민참여예산 공모전을 안내하는 글만 담겼다. 시는 이렇게 수정된 이미지로 홍보 현수막 23개, 포스터 200장, 전단 4000장 등을 새로 제작해 배부했다",
				"language": "ko",
				"libraryCatalog": "news.v.daum.net",
				"publicationTitle": "아시아경제",
				"url": "https://news.v.daum.net/v/cqtgoNRQCS",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://news.v.daum.net/v/cVBhcyjPIe",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "환청 시달리다 도끼 난동 부린 50대 2심도 집행유예",
				"creators": [
					{
						"lastName": "문다영",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"abstractNote": "서울북부지법 제1-2형사부(이근영 노진영 김지철 부장판사)는 18일 특수협박 혐의로 기소된 임모(52)씨에게 1심과 마찬가지로 징역 8개월과 집행유예 2년을 선고했다. 임씨는 지난해 3월 14일 오후 7시께 \"죽이겠다\"는 환청을 듣고 서울 노원구의 길거리에서 도끼 두 자루를 들고 돌아다니며 시민들을 위협한 혐의로 재판에 넘",
				"language": "ko",
				"libraryCatalog": "news.v.daum.net",
				"publicationTitle": "연합뉴스",
				"url": "https://news.v.daum.net/v/cVBhcyjPIe",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
