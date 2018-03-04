{
	"translatorID": "9021ee70-1411-45c9-9dd6-f070cc80641a",
	"label": "HighBeam",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.highbeam\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-07 09:32:09"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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
	if (url.indexOf('/doc/')>-1) {
		var breadcrumbs = ZU.xpathText(doc, '//div[@id="breadcrumbs"]//a');
		//Z.debug(breadcrumbs);
		if (breadcrumbs.indexOf("journals")>-1) {
			return "journalArticle";
		}
		if (breadcrumbs.indexOf("newspapers")>-1) {
			return "newspaperArticle";
		}
		if (breadcrumbs.indexOf("magazines")>-1) {
			return "magazineArticle";
		}
		if (breadcrumbs.search('/Encyclopedias|Almanacs|books|Dictionaries/')>-1) {
			return "book";
		}
		if (breadcrumbs.indexOf('Reports')>-1) {
			return "report";
		}
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "search-result-item")]//p/a');
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
	var type = detectWeb(doc, url);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setHandler('itemDone', function (obj, item) {
		
		if (item.title == item.title.toUpperCase()) {
			item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true);
		}
		
		//e.g. item.date = 12/24/2000
		var m = item.date.match(/(\d+)\/(\d+)\/(\d+)/);
		if (m) {
			item.date = m[3] + "-" + m[1] + "-" + m[2];
		}
		
		var abs = doc.getElementById("docText");
		if (abs) {
			item.abstractNote = abs.textContent.trim();
		}
		
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.highbeam.com/doc/1P2-23197647.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Records Falsified in Wake of Ontario E. Coli Outbreak",
				"creators": [
					{
						"firstName": "Barry",
						"lastName": "Brown",
						"creatorType": "author"
					}
				],
				"date": "2000-12-10",
				"abstractNote": "In the years leading up to the bacteria poisoning of thousands of\nresidents of Walkerton, Ont., who drank contaminated drinking water,\nthose responsible for water safety were routinely falsifying water\ntests and were drinking beer on the job, according to testimony at\nan inquiry.\nIn May, seven people died and more than 2,000 people became\nviolently ill when a deadly strain of E. coli bacteria from cow\nmanure made its way into the town's drinking water system.\nLast week, at the judicial inquiry into the disaster, Frank\nKoebel, the town's public utilities foreman, testified that water\nsamples he labeled as coming from various locations actually came\nfrom just one source: the Walkerton pump house. …",
				"language": "en",
				"libraryCatalog": "www.highbeam.com",
				"publicationTitle": "The Buffalo News (Buffalo, NY)",
				"url": "https://www.highbeam.com/doc/1P2-23197647.html",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://www.highbeam.com/doc/1G1-452158414.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Preliminary Survey of Animal Handling and Cultural Slaughter Practices among Kenyan Communities: Potential Influence on Meat Quality",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Lokuruka",
						"creatorType": "author"
					}
				],
				"date": "2016-03-01",
				"abstractNote": "INTRODUCTION    Kenya has an estimated population of over 41 million people who are made up of about 42 distinct communities [1]. Its population is made up of about 47.7% Protestants, 28.4% Roman Catholics, 9% of Indigenous beliefs, 11.2% Muslims, 1% Bahais, 0.04% Hindu and about 2.6% of other faiths [2].    More than 80% of the country's land mass is made up of what is often referred to as the arid and semi-arid lands (ASAL), which is where about 30% of the country's population lives [2]). The ASAL regions are characterized by a sparse human population distribution, low and unpredictable rainfall, usually 5-300 mm/year [3]. More than 70% of the country's livestock population is in the ASAL and most are reared by nomadic pastoralist communities including the Boran, Gabbra, Rendille, various Somali subgroups, the Samburu, Turkana, Maasai, Pokot, and the Orma. The country's livestock population is composed mainly of goats, sheep, cattle, camels, chicken, pigs and donkeys. Pigs are reared for commerce by a small number of farmers and usually within a 100-km radius of the major cities. To meet the food acceptability and religious requirements of the Kenya Muslims, the animal for food must be slaughtered by a Muslim to make its meat Halal. Poultry are mainly the traditional breeds of chicken that are kept using low-cost range management systems to supply subsistence food needs. However, commercial poultry keeping based on exotic breeds is an important economic activity in the country. Chicken eggs are an important item of commerce and food in Kenya. The population of geese, ducks and ostriches is insignificant. The beef cattle kept on private ranches in the ASAL zones, supply a significant amount of beef for consumers in major urban centres in the country. In the 2009 National Population and Household Census, Kenya was reported to have 3,355,407 exotic cattle, 14,112,367 indigenous cattle, 17,129,606 sheep, 27,740,153 goats and 2,971,111camels [2]. Other animals counted in the 2009 Population and Household Census included 334,689 pigs, 25,756,487 indigenous chicken, 6,071,042 commercial chicken, and 1,832,519 donkeys. The former Western Province with 16% of the total national population of chicken (both indigenous and commercial), leads in this livestock category. The Rift Valley region, where the Turkana, Maasai, Pokot and Samburu pastoralists live had 42.8% of the total national cattle population, 28.8% of the national indigenous cattle population and 54.6% of the Rift Valley region's total cattle population. The two regions of Rift Valley and Northeastern had 58.7, 70.5, 77.9, and 89.8% of the total national cattle, goat, sheep, and camel population, respectively [2]. Northeastern Province had the lowest pig population which stood at only 68 pigs, representing 0.02% of Kenya's pig population according to the 2009 Population and Household census, as it has the second highest Muslim population after Kenya's Coastal strip [2]. The production of total meat, mutton and goat meat, poultry, pork, milk and eggs in Kenya in 2002 stood at 452.6x103 metric tons (mT), 5.7x103 mT, 54x103 MT, 2841x106 litres and 60.6 million eggs [4], respectively, with most of the beef, goat meat and mutton coming from the ASAL. The per capita production of total meat, beef, mutton and goat meat, poultry and milk stood at 14.3 kg/yr, 10 kg, 1.0 kg and 90 liters/yr in 2002 [4]. For the purpose of this article, small stock refers to goats, and sheep, while large slaughter stock refers to donkeys, cattle, and camels. In this article also, no discussion will be made specifically on chicken or other poultry, fish and related sources of meat. The text focuses on meats in general and without emphasis on the white or red type. It is a mini-review of the literature on animal welfare requirements, animal handling and meat quality as it applies to the Kenyan situation.    METHODS AND PROCEDURES    A semi-structured questionnaire to establish the manner of animal slaughter in 10 Kenyan communities was administered to groups of 10-15 members of a community as focus groups. The communities surveyed were: nomadic pastoralists-the Turkana, Boran, Samburu, Pokot, Somali, and the Maasai, while the farming communities surveyed were the Kuria, Luo, Kalenjin, and Kikuyu. The total number of respondents who took part in the survey was 124. A few individual interviews were also conducted with a few members of some of the communities. The questionnaire and focus group discussions also set out to establish the extent of knowledge of the relationship of animal welfare and handling procedures, and slaughter practices as they would influence meat quality.    Limitations of the study    1. A small sample of communities was surveyed for their slaughter practices (10 out of a possible 42), although the author believes the slaughter and animal handling practices of those communities who were not surveyed would not have been different from the findings of the study.    2. The influence of religion on slaughter practices was documented only for the Muslims as it proved difficult to interview believers of other faiths.    3. More nomadic communities were surveyed than the farmer-communities; this was because the nomadic pastoralists provide most of the slaughter stock and keep most of the livestock population of Kenya, except for pigs and poultry.    RESULTS    1. For the Turkana and Pokot communities, the spear is reserved for use by adult, initiated and circumcised males, while the knife is mandatorily used by females and young uncircumcised males for animal slaughter. Where a Muslim has to share the meat, they let the male Muslim slaughter the animal. The Turkana and Pokot males slaughter the animal for public feasts while females can use the kitchen knife to slaughter small stock for domestic consumption. However, for large stock such as cattle, donkey and the camel, males slaughter them due to their sizes which females may find difficult to manage. …",
				"language": "en",
				"libraryCatalog": "www.highbeam.com",
				"publicationTitle": "African Journal of Food, Agriculture, Nutrition and Development",
				"shortTitle": "A Preliminary Survey of Animal Handling and Cultural Slaughter Practices among Kenyan Communities",
				"url": "https://www.highbeam.com/doc/1G1-452158414.html",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://www.highbeam.com/Search?searchTerm=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/
