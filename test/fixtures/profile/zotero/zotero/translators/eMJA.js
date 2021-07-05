{
	"translatorID": "966a7612-900c-42d9-8780-2a3247548588",
	"translatorType": 4,
	"label": "eMJA",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.mja\\.com\\.au/",
	"minVersion": "2.1.9",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-18 17:40:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	eMJA Translator - Copyright © 2012 Sebastian Karcher
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

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	for (let item of doc.querySelectorAll('div.views-field-title a, div.mja-search-results-container a')) {
		let title = (item.textContent || '').trim();
		if (!title) continue;
		let href = item.getAttribute('href');
		if (!href) continue;

		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}

	return found && items;
}

function match(t, r, n) {
	if (!t) return '';
	let m = t.match(r);
	return (m && m[typeof n === 'number' ? n : 1]) || '';
}

function scrape(doc, url) {
	Zotero.debug(url);
	let item = new Zotero.Item('journalArticle');
	item.url = url;
	item.title = (text(doc, 'h1.article-heading') || '').trim();
	item.attachments = [
		{ url, title: 'Snapshot', mimeType: 'text/html' },
		{ url: attr(doc, 'a.pdf', 'href'), title: 'Full Text PDF', mimeType: 'application/pdf' },
	];

	item.creators = Array.from(doc.querySelectorAll('ul#authors-list li')).map(author => ZU.cleanAuthor(author.getAttribute('data-author'), 'author'));
	item.volume = match(text(doc, 'div#meta-container div div.field-items div'), /;\s*\d+\s*\(/, 0).replace(/\(|;\s*/g, '');

	for (let citation of doc.querySelectorAll('span.citation')) {
		if (citation.textContent.includes('Published online:')) item.date = citation.textContent.replace(/Published online:/, '');
	}

	item.issue = attr(doc, 'a.article-issue', 'data-issue');
	item.volume = (text(doc, 'a.article-volume') || '').replace(/Volume\s*/, '');

	for (let comment of doc.querySelectorAll('div.comment')) {
		let abstr = comment.querySelector('h2');
		if (!abstr || abstr.textContent.trim() !== 'Abstract') continue;

		item.abstractNote = comment.textContent.replace('Abstract', '').trim();
	}

	item.journalAbbreviation = "Med. J. Aust.";
	item.ISSN = "0025-729X";
	item.publicationTitle = "Medical Journal of Australia";
	item.complete();
}

function detectWeb(doc, _url) {
	if (getSearchResults(doc, true)) return 'multiple';
	if (doc.querySelector('h1.article-heading')) return 'journalArticle';
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}
 
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.mja.com.au/journal/2011/195/1/socioeconomic-disparities-stroke-rates-and-outcome-pooled-analysis-stroke",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Socioeconomic disparities in stroke rates and outcome: pooled analysis of stroke incidence studies in Australia and New Zealand",
				"creators": [
					{
						"firstName": "Emma L.",
						"lastName": "Heeley",
						"creatorType": "author"
					},
					{
						"firstName": "Jade W.",
						"lastName": "Wei",
						"creatorType": "author"
					},
					{
						"firstName": "Kristie",
						"lastName": "Carter",
						"creatorType": "author"
					},
					{
						"firstName": "Md Shaheenul",
						"lastName": "Islam",
						"creatorType": "author"
					},
					{
						"firstName": "Amanda G.",
						"lastName": "Thrift",
						"creatorType": "author"
					},
					{
						"firstName": "Graeme J.",
						"lastName": "Hankey",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Cass",
						"creatorType": "author"
					},
					{
						"firstName": "Craig S.",
						"lastName": "Anderson",
						"creatorType": "author"
					}
				],
				"date": "4 July 2011",
				"ISSN": "0025-729X",
				"abstractNote": "Objective:   To assess the influence of area-level socioeconomic status (SES) on incidence and case-fatality rates for stroke.Design, setting and participants:   Analysis of pooled data for 3077 patients with incident stroke from three population-based studies in Perth, Melbourne, and Auckland between 1995 and 2003.Main outcome measures:   Incidence and 12-month case-fatality rates for stroke.Results:   Annual age-standardised stroke incidence rates ranged from 77 per 100 000 person-years (95% CI, 72–83) in the least deprived areas to 131 per 100 000 person-years (95% CI, 120–141) in the most deprived areas (rate ratio, 1.70; 95% CI, 1.47–1.95; P < 0.001). The population attributable risk of stroke was 19% (95% CI, 12%–27%) for those living in the most deprived areas compared with the least deprived areas. Compared with people in the least deprived areas, those in the most deprived areas tended to be younger (mean age, 68 v 77 years; P < 0.001), had more comorbidities such as hypertension (58% v 51%; P < 0.001) and diabetes (22% v 12%; P < 0.001), and were more likely to smoke (23% v 8%; P < 0.001). After adjustment for age, area-level SES was not associated with 12-month case-fatality rate.Conclusions:   Our analysis provides evidence that people living in areas that are relatively more deprived in socioeconomic terms experience higher rates of stroke. This may be explained by a higher prevalence of risk factors among these populations, such as hypertension, diabetes and cigarette smoking. Effective preventive measures in the more deprived areas of the community could substantially reduce rates of stroke.",
				"issue": "1",
				"journalAbbreviation": "Med. J. Aust.",
				"libraryCatalog": "eMJA",
				"publicationTitle": "Medical Journal of Australia",
				"shortTitle": "Socioeconomic disparities in stroke rates and outcome",
				"url": "https://www.mja.com.au/journal/2011/195/1/socioeconomic-disparities-stroke-rates-and-outcome-pooled-analysis-stroke",
				"volume": "195",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.mja.com.au/public/issues/195_01_040711/contents_040711.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.mja.com.au/search?search=vaccination",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.mja.com.au/journal/2021/215/1/potentially-preventable-hospitalisations-people-intellectual-disability-new",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Potentially preventable hospitalisations of people with intellectual disability in New South Wales",
				"creators": [
					{
						"firstName": "Janelle C.",
						"lastName": "Weise",
						"creatorType": "author"
					},
					{
						"firstName": "Preeyaporn",
						"lastName": "Srasuebkul",
						"creatorType": "author"
					},
					{
						"firstName": "Julian N.",
						"lastName": "Trollor",
						"creatorType": "author"
					}
				],
				"date": "14 June 2021",
				"ISSN": "0025-729X",
				"abstractNote": "Objective: To determine rates of potentially preventable hospitalisation of people with intellectual disability in New South Wales, and compare them with those for the NSW population.\n\nDesign: Retrospective cohort study.\n\nSetting: Potentially preventable hospitalisations in NSW, as defined by the National Healthcare Agreement progress indicator 18, 1 July 2001 ‒ 30 June 2015.\n\nParticipants: Data collected in a retrospective data linkage study of 92 542 people with intellectual disability in NSW; potentially preventable hospitalisations data for NSW published by HealthStats NSW.\n\nMain outcome measures: Age‐adjusted rates of potentially preventable hospitalisation by group (people with intellectual disability, NSW population), medical condition type (acute, chronic, vaccine‐preventable), and medical condition.\n\nResults: The annual age‐standardised rate for people with intellectual disability ranged between 5286 and 6301 per 100 000 persons, and for the NSW population between 1278 and 1511 per 100 000 persons; the rate ratio (RR) ranged between 3.5 (95% CI, 3.3–3.7) in 2014–15 and 4.5 (95% CI, 4.2–4.9) in 2002–03. The difference was greatest for admissions with acute (RR range: 5.3 [95% CI, 4.9–5.7] in 2014–15 to 8.1 [95% CI, 7.4–8.8] in 2002–03) and vaccine‐preventable conditions (RR range: 2.1 [95% CI, 1.6–3.0] in 2007–08 to 3.4 [95% CI, 2.2–5.2] in 2004–05). By specific condition, the highest age‐standardised rate was for admissions with convulsions and epilepsy (all years, 2567 per 100 000 population; v NSW population: RR, 22.2; 95% CI, 21.3–23.1).\n\nConclusion: Age‐standardised rates of potentially preventable hospitalisation are higher for people with intellectual disability than for the general population. The reasons for these differences should be investigated, and strategies for averting potentially preventable hospitalisation developed.",
				"journalAbbreviation": "Med. J. Aust.",
				"libraryCatalog": "eMJA",
				"publicationTitle": "Medical Journal of Australia",
				"url": "https://www.mja.com.au/journal/2021/215/1/potentially-preventable-hospitalisations-people-intellectual-disability-new",
				"volume": "Online first",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
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
