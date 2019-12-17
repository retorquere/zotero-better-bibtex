{
	"translatorID": "d2a9e388-5b79-403a-b4ec-e7099ca1bb7f",
	"label": "CAOD",
	"creator": "Guy Aglionby",
	"target": "^https?://caod\\.oriprobe\\.com/articles/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-08 13:38:50"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Guy Aglionby
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
	if (url.includes('articles/found.htm?')) {
		if (getSearchResults(doc, true)) {
			return 'multiple';
		}
	} else {
		return 'journalArticle';
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		// Necessary as author surname comes first and is often capitalised, so Zotero thinks it's actually initials.
		let authors = ZU.xpath(doc, '//span[@itemprop="author"]/a');
		item.creators = authors.map(function(author) { 
			let authorNames = author.text.split(' ');
			authorNames[0] = authorNames[0].charAt(0) + authorNames[0].substr(1).toLowerCase();
			return ZU.cleanAuthor(authorNames.reverse().join(' '), 'author');
		});
		
		let keywords = ZU.xpath(doc, '//span[@itemprop="headline"]/a');
		item.tags = keywords.map(function (keyword) {
			return keyword.textContent;
		});
		item.complete();
	});
	translator.translate();
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	let rows = ZU.xpath(doc, '//div[@class="searchlist"]/a[b]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		Zotero.selectItems(getSearchResults(doc, false), function (selected) {
			if (!selected) {
				return true;
			}
			ZU.processDocuments(Object.keys(selected), scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://caod.oriprobe.com/articles/found.htm?keyword=Chinese+pedagogy&package=&key_author=&key_qkname=&key_year=&key_volumn=&key_issue=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://caod.oriprobe.com/articles/53639734/Characteristics_and_influencing_factors_of_daily_p.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Characteristics and influencing factors of daily physical activity in preschool children",
				"creators": [
					{
						"firstName": "Hai-jun",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Zhi-jun",
						"lastName": "Tan",
						"creatorType": "author"
					},
					{
						"firstName": "Ying",
						"lastName": "Liang",
						"creatorType": "author"
					},
					{
						"firstName": "Xun",
						"lastName": "Jiang",
						"creatorType": "author"
					},
					{
						"firstName": "Tong",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "Hao",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Jing",
						"lastName": "Yuan",
						"creatorType": "author"
					},
					{
						"firstName": "Lei",
						"lastName": "Shang",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"abstractNote": "Objective To investigate the daily activities of preschool children in recent one month to learn the characteristics and influencing factors of the daily physical activity among preschool children,so as to provide references for daily physical activity intervention in preschool children.Methods Daily activities of target group in recent one month was investigated by using daily physical activities questionnaire designed for preschool children(3 -6 years old)by research group and filled by children's caregivers.Influencing factors of frequency and time of daily physical activity were analyzed using univariate and multivariate analysis methods.Results The questionnaire contained 22 items of physical activity.There were significant differences in participation rates of physical activity among children of different gender,age,residence,caregiver with different educational level and family with different number of children(all P<0.05).Frequency of high intensity physical activity in preschool children per week was 11.2 ± 6.5 times,moderate intensity activity 19.1 ± 12.3 times and low intensity activity 19.3 ± 10.1 times.Frequency of high intensity physical activity and time were related with caregiver's educational level(P<0.05),while frequency of moderate and low intensity physical activity and time were related with children's gender and caregiver's educational level(both P<0.05). Frequency of physical activity was higher and time was longer in girls than those in boys.Children having caregivers with college or higher educational level had higher physical activity frequency and longer activity time,compared with children having caregivers with junior high school or below educational level.Conclusion Physical activities of preschool children are mainly moderate and low intensity.Frequency and time of physical activity are related with children's gender and caregiver's educational level.",
				"issue": "4",
				"libraryCatalog": "caod.oriprobe.com",
				"pages": "393-398",
				"publicationTitle": "Chinese Journal of Woman and Child Health Research",
				"url": "http://caod.oriprobe.com/articles/53639734/Characteristics_and_influencing_factors_of_daily_p.htm",
				"volume": "29",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "influencing factor"
					},
					{
						"tag": "physical activity"
					},
					{
						"tag": "preschool children"
					},
					{
						"tag": "survey"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://caod.oriprobe.com/articles/52762114/Preadolescents__refusal_skills_and_responses_emoti.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Preadolescents’ refusal skills and responses emotional reactions to the offer of tobacco and ecstasy in Youjiang District in Baise City in 2014",
				"creators": [
					{
						"firstName": "Rui",
						"lastName": "Guo",
						"creatorType": "author"
					},
					{
						"firstName": "Jianying",
						"lastName": "Liao",
						"creatorType": "author"
					},
					{
						"firstName": "Jiancheng",
						"lastName": "Liang",
						"creatorType": "author"
					},
					{
						"firstName": "Yang",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "Shusong",
						"lastName": "Deng",
						"creatorType": "author"
					},
					{
						"firstName": "Management and Health Public of",
						"lastName": "School",
						"creatorType": "author"
					},
					{
						"firstName": "Nationalities for University Medical",
						"lastName": "Youjiang",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"abstractNote": "Objective To assess preadolescents’ emotional reactions and intended use of refusal responses to tobacco and ecstasy. Methods A total of 333 students from two junior schools in Baise City were recruited with cluster-sampling method,filled the questionnaire to assess a respondent’s emotional reactions and refusal skills in response to an offer of tobacco and MDMA from Feb to Jul 2014. Results 88. 89%-93. 39% of preadolescents would more likely to use",
				"issue": "1",
				"libraryCatalog": "caod.oriprobe.com",
				"pages": "80-84+92",
				"publicationTitle": "Journal of Hygiene Research",
				"url": "http://caod.oriprobe.com/articles/52762114/Preadolescents__refusal_skills_and_responses_emoti.htm",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "drug offers"
					},
					{
						"tag": "emotion"
					},
					{
						"tag": "preadolescents"
					},
					{
						"tag": "refusal"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
