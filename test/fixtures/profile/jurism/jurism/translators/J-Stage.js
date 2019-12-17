{
	"translatorID": "e40a27bc-0eef-4c50-b78b-37274808d7d2",
	"label": "J-Stage",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.jstage\\.jst\\.go\\.jp/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-15 19:04:11"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	J-Stage translator - Copyright © 2012 Sebastian Karcher
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.includes("/article/")) {
		return "journalArticle";
	}
	else if ((url.includes("/result/") || url.includes("/browse/"))
			&& getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('li>.searchlist-title>a, a.ci-article-name, a.feature-article-title');
	for (var i = 0; i < rows.length; i++) {
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


// help function
function scrape(doc, url) {
	// get abstract and tags from article plage
	var abs = text("#article-overiew-abstract-wrap");
	var tagNodes = doc.querySelectorAll("meta[name='citation_keywords']");
	var tags = [];
	for (let tagNode of tagNodes) {
		tags.push(tagNode.content);
	}
	
	// get BibTex Link
	var bibtexurl = ZU.xpathText(doc, '//a[contains(text(), "BIB TEX")]/@href');
	ZU.doGet(bibtexurl, function (text) {
		var bibtex = text;
		// Zotero.debug(bibtex)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			if (abs) item.abstractNote = abs.replace(/^\s*(?:Abstract|抄録)\s*/, '');
			if (tags) item.tags = tags;
			for (var i = 0; i < item.creators.length; i++) {
				if (item.creators[i].lastName && item.creators[i].lastName == item.creators[i].lastName.toUpperCase()) {
					item.creators[i].lastName = ZU.capitalizeTitle(item.creators[i].lastName.toLowerCase(), true);
				}
				if (item.creators[i].firstName && item.creators[i].firstName == item.creators[i].firstName.toUpperCase()) {
					item.creators[i].firstName = ZU.capitalizeTitle(item.creators[i].firstName.toLowerCase(), true);
				}
			}
			if (item.title == item.title.toUpperCase()) {
				item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true);
			}
			if (item.publicationTitle == item.publicationTitle.toUpperCase()) {
				item.publicationTitle = ZU.capitalizeTitle(item.publicationTitle.toLowerCase(), true);
			}
			item.attachments.push({
				url: url,
				title: "J-Stage - Snapshot",
				mimeType: "text/html"
			});
			
			var pdfurl = attr('a.thirdlevel-pdf-btn', 'href') || attr('meta[name="citation_pdf_url"]', 'content');
			if (pdfurl) {
				item.attachments.push({
					url: pdfurl,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.complete();
		});
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.jstage.jst.go.jp/article/prohe1990/45/0/45_0_811/_article",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Application of RUSLE Model on Global Soil Erosion Estimate",
				"creators": [
					{
						"firstName": "Thai Nam",
						"lastName": "Pham",
						"creatorType": "author"
					},
					{
						"firstName": "Dawen",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Shinjiro",
						"lastName": "Kanae",
						"creatorType": "author"
					},
					{
						"firstName": "Taikan",
						"lastName": "Oki",
						"creatorType": "author"
					},
					{
						"firstName": "Katumi",
						"lastName": "Musiake",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"DOI": "10.2208/prohe.45.811",
				"abstractNote": "Soil erosion is one of the most serious environmental problems commonly in over the world, which is caused by both natural and human factors. It is possible to investigate the global issue on soil erosion with the development of global data sets. This research estimated global soil erosion by the RUSLE model with use of a comprehensive global data set. The accuracy of the estimate mostly depends on the available information related to the study area. Present available finest data was used in this study. As the desired objective of estimating soil erosion by water at global scale, the application of RUSLE has shown its positive applicability on large-scale estimates. The study has shown a global view of water soil erosion potential with 0.5-degree grid resolution. Regional validations and examinations have been carried out by different ways. The global mean of annual soil erosion by water was estimated as 1100 ton/ km2, which agrees with several results obtained in different regions.",
				"itemID": "2001811",
				"libraryCatalog": "J-Stage",
				"pages": "811-816",
				"publicationTitle": "Proceedings of Hydraulic Engineering",
				"volume": "45",
				"attachments": [
					{
						"title": "J-Stage - Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "global data sets"
					},
					{
						"tag": "global estimation"
					},
					{
						"tag": "soil erosion by water"
					},
					{
						"tag": "the RUSLE"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.jstage.jst.go.jp/result/global/-char/en?globalSearchKey=organic+agriculture+erosion",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.jstage.jst.go.jp/browse/bpb",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.jstage.jst.go.jp/article/jfs/114/0/114_0_280/_article/-char/ja/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "フラックスタワーデータを用いた各種植生指標の季節変化の検討",
				"creators": [
					{
						"firstName": "田中",
						"lastName": "博春",
						"creatorType": "author"
					},
					{
						"firstName": "小熊",
						"lastName": "宏之",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"DOI": "10.11519/jfs.114.0.280.0",
				"abstractNote": "I.  はじめに　分光日射計データから得られる各種植生指標の季節変化を、CO2吸収量ならびに葉面積指数の季節変化と比較した。データは、国立環境研究所苫小牧フラックスリサーチサイト（カラマツ人工林）のタワーデータを用いた。・各種植生指標：全天分光日射計 英弘精機MS-131WP使用。地上高40mに設置した上向き・下向きの日積算日射量より各種植生指標値を算出。波長帯は、可視(Ch3：590-695nm≒ 赤)と近赤外(Ch5：850-1200nm)の組み合わせ[図1-a]、ならびに可視(Ch2：395-590nm≒青・緑)と 近赤外(Ch4：695-850nm)の組み合わせ[図1-b]の2通りを用いた。・CO2フラックス日中積算値：クローズドパス法非分散型赤外線分析計Li-Cor LI-6262使用。地上高27m 9:00から16:30までの30分値を加算、日中の積算値とした[図1-c]。・葉面積指数(LAI)：光合成有効放射計Li-Cor LI-190SB 地上高1.5mと40mの下向き光合成有効放射量(PAR)の日積算値の比から、Lambert-Beerの式を用いPAI(Plant Area Index)を算出。落葉期の測定値を減じLAIとした [図1-d]。II. 日中CO2フラックスと植生指標GEMIの整合性[図1-c]　Ch2とCh4から求めた植生指標GEMI(Global Environmental Monitoring Index)の季節変化と、日中積算CO2フラックスの極小値を結んだ包絡線の季節変化の間によい一致がみられた[図1-c]。特にカラマツの萌芽後のGEMI値の急増時期や、展葉に伴うGEMI値の増加傾向が、CO2フラックスの変化傾向とよく一致している。ただし紅葉期は両者は一致しない。これは、光合成活動が低下した葉が落葉せずに残るためと思われる。III.  各種植生指標の季節変化 [図1-a,b]　これに対し、植生指標としてよく用いられる正規化植生指標NDVI(Normalized Vegetation Index)は、CO2フラックスの季節変化傾向と一致しなかった。NDVIは春先の融雪に伴う値のジャンプがあり、また6__から__10月の活葉期に値がだいたい一定となる。この特徴は、Ch3とCh5から求めた図1-aの4つの植生指標も同様であった。しかし、Ch2とCh4を用いた図1-bのGEMIと、近赤外と可視の差であるDVI(Difference Vegetation Index)にはこれらの特徴がみられず、CO2フラックスの季節変化傾向と同様に萌芽後に値が急増し、6月にピークを迎えた後なだらかに減少した。IV.  葉面積指数LAIと植生指標GEMIの整合性 [図1-d] 葉面積指数(LAI)が正常値を示す、積雪期以外のLAIの季節変化を、Ch2とCh4によるGEMI（≒CO2フラックスの季節変化）と比較すると、カラマツ萌芽後の展葉期にはGEMIより1__から__2週間ほど遅れてLAIの値が増加した。タワー設置のモニタリングカメラの日々の画像の変化を見ても、カラマツの葉の色の変化が先に現れ、その後に葉が茂ってゆく様子がわかる。　萌芽後、LAIは直線的に増加するが、GEMIの増加は立ち上がりは急なものの徐々に増加量が減ってくる。これは、萌芽後LAIの増加とともに葉の相互遮蔽が生じ、下層まで届く光量が減少するため、群落全体としての光合成活動が低下することが原因と思われる。　他にも、今回の測定方法ではLAIとしてカウントされていない林床植物のCO2フラックスの影響等が想定される。＜CO2フラックス・LAIデータ提供: 産業総合技術研究所 三枝 信子・王 輝民＞",
				"itemID": "田中博春2003",
				"libraryCatalog": "J-Stage",
				"pages": "280-280",
				"publicationTitle": "日本林学会大会発表データベース",
				"volume": "114",
				"attachments": [
					{
						"title": "J-Stage - Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "CO2フラックス"
					},
					{
						"tag": "分光日射計"
					},
					{
						"tag": "植生指標"
					},
					{
						"tag": "苫小牧フラックスリサーチサイト"
					},
					{
						"tag": "葉面積指数"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
