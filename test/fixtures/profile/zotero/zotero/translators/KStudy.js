{
	"translatorID": "b298ca93-0010-48f5-97fb-e9923519a380",
	"label": "KStudy",
	"creator": "Yunwoo Song, Frank Bennett, Philipp Zumstein",
	"target": "^https?://[^/]+\\.kstudy\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-03 13:10:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	KISS (Korean Studies Information Service System) Translator
	Copyright © 2017-2018 Yunwoo Song, Frank Bennett, and Philipp Zumstein

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
	if (/\bkey=(\d+)\b/.test(url)) {
		if (url.includes('/thesis/thesis-view.asp')) {
			return "journalArticle";
		} else if (url.includes('/public2-article.asp')) {
			// these are reports and working paper series but with publicaton name,
			// volume, issue numbers; thus handled as journal articles as well
			return "journalArticle";
		} else if (url.includes('/public3-article.asp')) {
			return "report";
		}
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "thesis-info")]/h5/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		// exclude no real links
		if (href=="#") continue;
		// exclude links to overview of journal
		if (href.includes("/journal/journal-view")) continue;
		// make sure we have a key to make the risURL
		if (!(/\bkey=(\d+)\b/.test(href))) continue;
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
			var articles = [];
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
	var key = url.match(/\bkey=(\d+)\b/)[1];
	var risURL = "/p-common/export_endnote.asp";
	var postData = "atcl_data=" + key + "&export_gubun=EndNote";
	ZU.doPost(risURL, postData, function(text) {
		// Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (url.includes('/public/public3-article')) {
				item.itemType = "report";
			}
			var latin = item.title.match(/[\u{0000}-\u{00FF}]/ug);
			if (latin.length > item.title.length/2 && item.title.toUpperCase() == item.title) {
				item.title = ZU.capitalizeTitle(item.title, true);
			}
			//remove space before colon in title
			item.title = item.title.replace(/\s+:/, ":");
			// sometimes the author tags in RIS are empty and therefore we
			// try to scrape author names also directly
			if (item.creators.length == 0) {
				item.creators = scrapeAuthorsDirectly(doc, url);
			} else {
				// romanized Korean names with first and last name are splitted
				// wrongly into two AU tags in RIS and therefore we scrape
				// author names directly here
				let firstName = item.creators[0].lastName;
				let latinCharacters = firstName.match(/[\u{0000}-\u{00FF}]/ug);
				if (!item.creators[0].firstName && latinCharacters && latinCharacters.length == firstName.length) {
					item.creators = scrapeAuthorsDirectly(doc, url);
				}
			}
			if (item.issue && item.issue == "0") {
				delete item.issue;
			}
			item.language = "ko-KR";
			item.complete();
		});
		translator.translate();
	});
}


function scrapeAuthorsDirectly(doc, url) {
	var creators = [];
	var writers = ZU.xpathText(doc, '//div[@class="writers"]');
	if (writers) {
		var creatorsList = writers.split(',');
		for (var i=0; i<creatorsList.length; i++) {
			let author = creatorsList[i].replace(/^\s*\(\s*/, '').replace(/\s*\)\s*$/, '');
			if (author.includes(' ')) {
				creators.push(ZU.cleanAuthor(author, "author"));
			} else {
				creators.push({
					lastName: author,
					fieldMode: true,
					creatorType: "author"
				});
			}
		}
	} else {
		var authors = ZU.xpathText(doc, '//li[label[text()="저자"]]');
		// e.g. authors = 저자 : Kim, Yoon Tae,  Park, Hyun Suk
		// e.g. authors = 저자 : 이동호,  이재서,  윤숙자,  강병철
		if (authors && authors.includes(':')) {
			var authorsValue = authors.split(':')[1];
			if (authorsValue.includes(',  ')) {
				// two spaces after comma are important here
				var authorsList = authorsValue.split(',  ');
			} else {
				var authorsList = authorsValue.split(',');
 			}
			for (let i=0; i<authorsList.length; i++)  {
				let author = authorsList[i].trim();
				if (author.includes(',')) {
					creators.push(ZU.cleanAuthor(author, "author", true));
				} else {
					creators.push({
						lastName: author,
						fieldMode: true,
						creatorType: "author"
					});
				}
 			}
		}
	}
	return creators;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3297333",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "투고논문: 소옹(邵雍)의 선천역학(先天易學)에 대한 王夫之의 비판",
				"creators": [
					{
						"lastName": "조우진",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2014",
				"ISSN": "1738-2629",
				"abstractNote": "본 논문의 목적은 소옹의 선천역학(先天易學)을 바탕으로 한 송대(宋代) 상수역(象數易)의 흐름을 살펴보고 왕부지의 비판적 입장을 고찰하는데 있다. 필자는 이러한 과정에서 상수역의 본래 모습을 확인하고자 한다. 왕부지는 자신의 역학체계를 바탕으로 선천과 후천의 개념, 선천의 전수과정, 선천도(先天圖)의 체계, 선천역학의 원리, 괘(卦)의 형성의 과정 등을 신랄하게 비판하였다. 그의 비판 논리는 경전의 내용을 바탕으로 하는 실증주의적 사고방식에 근거하고 있다. 왕부지의 입장에서 보자면 소옹의 선천역학과 관련된 이론이나 내용은 경전에 전혀 찾아볼 수 없는 것이며, 도가(道家)의 술수가들에 의해 전수된 것에 불과할 따름이다. 왕부지는 소옹의 선천역학을 비판하는 근거를 여러 가지로 제시하는데, 가장 결정적인 것은 점(占)과 관련된다. 선천역학의 핵심원리인 가일배법(加一倍法)은 아래로부터 위로 쌓아서 괘(卦)를 만들어가는 과정으로 점치는 것과 같은 것이다. 그래서 왕부지는 소옹의 선천역학을 술수학일 뿐만 아니라 점역(占易)에 치우친 것이라고 비판하면서 ‘점학일리(占學一理)’를 주장한다.",
				"journalAbbreviation": "공자학",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"pages": "179-210",
				"publicationTitle": "공자학",
				"shortTitle": "투고논문",
				"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3297333",
				"volume": "27",
				"attachments": [],
				"tags": [
					{
						"tag": "Gua"
					},
					{
						"tag": "Jiayibeifa"
					},
					{
						"tag": "Sunchentu"
					},
					{
						"tag": "Sunchenyeokhak"
					},
					{
						"tag": "Xiangshuyi"
					},
					{
						"tag": "Zhan"
					},
					{
						"tag": "Zhanxueyili"
					},
					{
						"tag": "先天圖"
					},
					{
						"tag": "先天易學"
					},
					{
						"tag": "加一倍法"
					},
					{
						"tag": "占"
					},
					{
						"tag": "占學一理"
					},
					{
						"tag": "卦"
					},
					{
						"tag": "常數易"
					},
					{
						"tag": "가일배법"
					},
					{
						"tag": "괘"
					},
					{
						"tag": "상수역"
					},
					{
						"tag": "선천도"
					},
					{
						"tag": "선천역학"
					},
					{
						"tag": "점"
					},
					{
						"tag": "점학일리"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3500796",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "청소년의 비속어 · 욕설 · 은어 · 유행어 사용 실태와 언어 의식 연구",
				"creators": [
					{
						"lastName": "김태경",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "장경희",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "김정선",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "이삼형",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "이필영",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "전은진",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2012",
				"ISSN": "1225-1216",
				"abstractNote": "본 연구는 전국 청소년의 언어 실태와 언어 의식을 조사하고 이에 영향을 미치는 환경요인을 분석해 내는 데 목적이 있다. 본 연구의 조사 대상이 되는 언어 실태는 욕설 등 공격적 언어 표현, 비속어, 은어, 유행어 사용에 관한 것이다. 이를 위하여 본 연구에서는 전국 6개 권역(경인, 강원, 충청, 전라, 경상, 제주)의 초 · 중 · 고등학교 학생 6,053명을 대상으로 설문 조사를 수행하고, 비속어 등의 사용빈도와 거친 강도, 언어 규범 파괴 정도, 관련 환경 요인 등을 분석하였다. 그 결과, 응답자의 학교 급이 올라갈수록 사용하는 비속어나 은어·유행어의 거친 강도나 언어 규범 파괴 정도가 점점 심해지는 것으로 나타났다. 청소년의 이러한 언어실태는 부정적 언어 사용에 관한 용인 태도와 밀접한 관련을 지니고 있었다. 또한, 거주지의 도시화 층, 가정 경제 수준, 학업 성적, 자기통제력, 공감능력 등도 청소년의 공격적 언어 표현 사용에 직간접적으로 영향을 미치는 것으로 조사되었다. 가정 · 학교 · 사회 환경 요인별로는 `또래 간 비공식적 통제`가 청소년 언어에 가장 긍정적인 요소로 작용하며 `부모의 언어폭력으로 인한 스트레스`가 가장 부정적인 요소로 작용하는 것으로 나타났다.",
				"journalAbbreviation": "국제어문",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"pages": "43-93",
				"publicationTitle": "국제어문",
				"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3500796",
				"volume": "54",
				"attachments": [],
				"tags": [
					{
						"tag": "aggressive language expression"
					},
					{
						"tag": "buzz-word"
					},
					{
						"tag": "curse"
					},
					{
						"tag": "expletive"
					},
					{
						"tag": "language attitude"
					},
					{
						"tag": "language destruction"
					},
					{
						"tag": "language use"
					},
					{
						"tag": "questionnaire survey"
					},
					{
						"tag": "teenage slang"
					},
					{
						"tag": "teenager`s language"
					},
					{
						"tag": "공격적 언어 표현"
					},
					{
						"tag": "비속어"
					},
					{
						"tag": "설문 조사"
					},
					{
						"tag": "언어 실태"
					},
					{
						"tag": "언어 의식"
					},
					{
						"tag": "언어 파괴"
					},
					{
						"tag": "욕설"
					},
					{
						"tag": "유행어"
					},
					{
						"tag": "은어"
					},
					{
						"tag": "청소년 언어"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/journal/journal-view.asp?key1=25169&key2=2201",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/public/public2-article.asp?key=50064290",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "치과용 콘빔 CT를 이용한 상악 정중과잉치의 3차원 분석",
				"creators": [
					{
						"lastName": "이동호",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "이재서",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "윤숙자",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "강병철",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2010",
				"ISSN": "1229-8212",
				"abstractNote": "Purpose : This study was performed to analyze the position, pattern of impacted mesiodens, and their relationship to the adjacent teeth using Dental cone-beam CT. Materials and Methods : Sixty-two dental cone-beam CT images with 81 impacted mesiodenses were selected from about 2,298 cone-beam CT images at Chonnam National University Dental Hospital from June 2006 to March 2009. The position, pattern, shape of impacted mesiodenses and their complications were analyzed in cone-beam CT including 3D images. Results : The sex ratio (M : F) was 2.9 : 1. Most of the mesiodenses (87.7%) were located at palatal side to the incisors. 79% of the mesiodenses were conical in shape. 60.5% of the mesiodenses were inverted, 21% normal erupting direction, and 18.5% transverse direction. The complications due to the presence of mesiodenses were none in 43.5%, diastema in 19.4%, tooth displacement in 17.7%, delayed eruption or impaction in 12.9%, tooth rotation in 4.8%, and dentigerous cyst in 1.7%. Conclusions : Dental cone-beam CT images with 3D provided 3-dimensional perception of mesiodens to the neighboring teeth. This results would be helpful for management of the impacted mesiodens.",
				"issue": "3",
				"journalAbbreviation": "대한구강악안면방사선학회지 (대한구강악안면방사선학회)",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"pages": "109-114",
				"publicationTitle": "대한구강악안면방사선학회지 (대한구강악안면방사선학회)",
				"url": "http://kiss.kstudy.com/public/public2-article.asp?key=50064290",
				"volume": "40",
				"attachments": [],
				"tags": [
					{
						"tag": "Cone-Beam Computed Tomograpahy"
					},
					{
						"tag": "Incisor"
					},
					{
						"tag": "Supernumerary"
					},
					{
						"tag": "Tooth"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/public/public2-article.asp?key=50789039",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Kolmogorov Distance for Multivariate Normal Approximation",
				"creators": [
					{
						"firstName": "Yoon Tae",
						"lastName": "Kim",
						"creatorType": "author"
					},
					{
						"firstName": "Hyun Suk",
						"lastName": "Park",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"ISSN": "1976-8605",
				"abstractNote": "This paper concerns the rate of convergence in the multidimensional normal approximation of functional of Gaussian fields. The aim of the present work is to derive explicit upper bounds of the Kolmogorov distance for the rate of convergence instead of Wasserstein distance studied by Nourdin et al. [Ann. Inst. H. Poincar$\\acute{e}$(B) Probab.Statist. 46(1) (2010) 45-98].",
				"issue": "1",
				"journalAbbreviation": "Korean Journal of mathematics (강원경기수학회)",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"pages": "1-10",
				"publicationTitle": "Korean Journal of mathematics (강원경기수학회)",
				"url": "http://kiss.kstudy.com/public/public2-article.asp?key=50789039",
				"volume": "23",
				"attachments": [],
				"tags": [
					{
						"tag": "Kolmogorov distance"
					},
					{
						"tag": "Malliavin calculus"
					},
					{
						"tag": "Stein`s method"
					},
					{
						"tag": "Wasserstein distance"
					},
					{
						"tag": "fractional Brownian motion"
					},
					{
						"tag": "multidimensional normal approximation"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/public/public3-article.asp?key=60023584",
		"items": [
			{
				"itemType": "report",
				"title": "온라인 수업 활성화를 위한 제도 분석",
				"creators": [
					{
						"lastName": "정영식",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "박종필",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "정순원",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "김유리",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "송교준",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2013",
				"institution": "교육부",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"url": "http://kiss.kstudy.com/public/public3-article.asp?key=60023584",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3480580",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Analysis of Enzymes related to Lignin Modification of Phanerochaete chrysosporium ATCC20696 through the Transcriptomic and Proteomic Approaches",
				"creators": [
					{
						"firstName": "Chang-young",
						"lastName": "Hong",
						"creatorType": "author"
					},
					{
						"firstName": "Su-yeon",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Myungkil",
						"lastName": "Kim",
						"creatorType": "author"
					},
					{
						"firstName": "In-gyu",
						"lastName": "Choi",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISSN": "2288-257x",
				"abstractNote": "Phanerochaete chrysosporium (ATCC20696) is one of the most intensively studied basidiomycetes, and is well-known to degrade lignin with ligninolytic enzymes system. In general, ligninolytic enzymes catalyze lignin by oxidation in multi-step electron transfers with other accessory enzymes. Our previous work indicated that P. chrysosporium (ATCC20696) degraded lignin polymer and produced lignin derived-acid compound under the addition of reducing agents. Accordingly, in this study, we investigated various enzymes related to lignin modification by transcriptomic and proteomic analysis. In transcriptomic analysis, lignin peroxidase, copper radical oxidase and multicopper oxidase as extracellular enzymes were highly expressed that exposed to synthetic lignin with reducing agents. In addition, cytochrome P450 monooxygenase, 1,4-benzoquinone reductase and aryl alcohol dehydrogenase as intracellular enzymes were also over-expressed. In the proteomic analysis, it was confirmed to identify these enzymes highly secreted from P. chrysospo-rium (ATCC20696) and obtained the protein sequences by liquid chromatography mass spectroscopy. These results supported that both extracellular enzymes and intracellular enzymes were involved in lignin degradation and production of lignin derived compounds.",
				"issue": "2",
				"journalAbbreviation": "균학회소식",
				"language": "ko-KR",
				"libraryCatalog": "KStudy",
				"pages": "84-84",
				"publicationTitle": "균학회소식",
				"url": "http://kiss.kstudy.com/thesis/thesis-view.asp?key=3480580",
				"volume": "28",
				"attachments": [],
				"tags": [
					{
						"tag": "Enzyme system"
					},
					{
						"tag": "Phanerochaete chrysosporium"
					},
					{
						"tag": "lignin degradation"
					},
					{
						"tag": "proteomic analysis"
					},
					{
						"tag": "transcriptomic analysis"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
