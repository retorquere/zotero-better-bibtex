{
	"translatorID": "4ee9dc8f-66d3-4c18-984b-6335408a24af",
	"label": "Treesearch",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://([^/]+\\.)?treesearch\\.fs\\.fed\\.us/(pubs/\\d+$|search\\.php)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 23:05:56"
}

/**
	Copyright (c) 2012 Aurimas Vinckevicius
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function getFieldValue(entry, name) {
	var value = ZU.xpathText(entry,
		'.//p/strong[normalize-space(text())="'
		+ name + ':"]/following-sibling::node()', null, '');
	return value ? value.trim() : '';
}

function parseSource(sourceStr) {
	sourceStr = sourceStr.trim();
	var matches = sourceStr.match(
		/^(.*[^.])\.?\s+(\d+\w?)(?:\((\d+)\))?:\s*(\w?\d+(?:-\w?\d+)?)(?:\.?\s+\[[^\]]+\])?\s*\.?$/);
	if (matches) {
		return {
			type: 'journalArticle',
			publicationTitle: matches[1],
			volume: matches[2],
			issue: matches[3],
			pages: matches[4]
		};
	}
	else {
		if (sourceStr.substr(0, 3) == 'In:') {
			// book section
			matches = sourceStr.match(/\d+-\d+/);
			return {
				type: 'bookSection',
				pages: matches ? matches[0] : null
			};
		}

		matches = sourceStr.match(/\.\s+(\d+)\s+p\./);
		return {
			type: 'book',
			numPages: matches ? matches[1] : null
		};
	}
}

function scrape(doc, url) {
	var entry = doc.getElementById('publicationLayoutLeftSide');
	var source = parseSource(getFieldValue(entry, 'Source'));

	var item = new Zotero.Item(source.type);

	item.title = getFieldValue(entry, 'Title');
	item.date = getFieldValue(entry, 'Date');
	item.abstractNote = getFieldValue(entry, 'Description');
	item.publicationTitle = source.publicationTitle;
	item.volume = source.volume;
	item.issue = source.issue;
	item.pages = source.pages;
	item.numPages = source.numPages;
	item.url = url;

	var authors = getFieldValue(entry, 'Author').split(/;\s+/);
	for (let i = 0, n = authors.length; i < n; i++) {
		item.creators.push(
			ZU.cleanAuthor(
				ZU.capitalizeTitle(authors[i].replace(/;$/, '')),
				'author', true));
	}

	var keywords = ZU.xpath(entry, './/p[@id="keywords"]/a');
	for (let i in keywords) {
		item.tags.push(keywords[i].textContent.trim());
	}

	var pdfUrl = ZU.xpathText(entry, '/html/head/meta[@name="citation_pdf_url"]/@content');
	if (pdfUrl) {
		item.attachments.push({
			url: pdfUrl.trim(),
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
	}

	item.complete();
}

function detectWeb(doc, url) {
	if (url.match(/\/pubs\/\d+$/)) {
		var entry = doc.getElementById('publicationLayoutLeftSide');
		if (!entry) return false;
		
		var source = parseSource(getFieldValue(entry, 'Source'));
		return source ? source.type : null;
	}
	else if (url.includes('search.php') && getSearchResults(doc, true)) {
		return 'multiple';
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var links = ZU.xpath(doc, '//table[@class="query"]//tr[1]/following-sibling::tr/td[2]//a');
	if (checkOnly || !links.length) return !!links.length;
	
	var items = {};
	for (var i = 0; i < links.length; i++) {
		items[links[i].href] = ZU.trimInternal(links[i].textContent);
	}
	
	return items;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (selectedItems) {
			if (!selectedItems) return;

			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}

			ZU.processDocuments(urls, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.treesearch.fs.fed.us/pubs/39839",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Landscape epidemiology and control of pathogens with cryptic and long-distance dispersal: Sudden oak death in northern Californian forests",
				"creators": [
					{
						"firstName": "Joao A. N.",
						"lastName": "Filipe",
						"creatorType": "author"
					},
					{
						"firstName": "Richard C.",
						"lastName": "Cobb",
						"creatorType": "author"
					},
					{
						"firstName": "Ross K.",
						"lastName": "Meentemeyer",
						"creatorType": "author"
					},
					{
						"firstName": "Christopher A.",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Yana S.",
						"lastName": "Valachovic",
						"creatorType": "author"
					},
					{
						"firstName": "Alex R.",
						"lastName": "Cook",
						"creatorType": "author"
					},
					{
						"firstName": "David M.",
						"lastName": "Rizzo",
						"creatorType": "author"
					},
					{
						"firstName": "Christopher A.",
						"lastName": "Gilligan",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"abstractNote": "Exotic pathogens and pests threaten ecosystem service, biodiversity, and crop security globally. If an invasive agent can disperse asymptomatically over long distances, multiple spatial and temporal scales interplay, making identification of effective strategies to regulate, monitor, and control disease extremely difficult. The management of outbreaks is also challenged by limited data on the actual area infested and the dynamics of spatial spread, due to financial, technological, or social constraints. We examine principles of landscape epidemiology important in designing policy to prevent or slow invasion by such organisms, and use Phytophthora ramorum, the cause of sudden oak death, to illustrate how shortfalls in their understanding can render management applications inappropriate. This pathogen has invaded forests in coastal California, USA, and an isolated but fast-growing epidemic focus in northern California (Humboldt County) has the potential for extensive spread. The risk of spread is enhanced by the pathogen's generalist nature and survival. Additionally, the extent of cryptic infection is unknown due to limited surveying resources and access to private land. Here, we use an epidemiological model for transmission in heterogeneous landscapes and Bayesian Markov-chain-Monte-Carlo inference to estimate dispersal and life-cycle parameters of P. ramorum and forecast the distribution of infection and speed of the epidemic front in Humboldt County. We assess the viability of management options for containing the pathogen's northern spread and local impacts. Implementing a stand-alone host-free \"barrier\" had limited efficacy due to long-distance dispersal, but combining curative with preventive treatments ahead of the front reduced local damage and contained spread. While the large size of this focus makes effective control expensive, early synchronous treatment in newly-identified disease foci should be more cost-effective. We show how the successful management of forest ecosystems depends on estimating the spatial scales of invasion and treatment of pathogens and pests with cryptic long-distance dispersal.",
				"issue": "1",
				"libraryCatalog": "Treesearch",
				"pages": "e1002328",
				"publicationTitle": "PLoS Comput Biol",
				"shortTitle": "Landscape epidemiology and control of pathogens with cryptic and long-distance dispersal",
				"url": "https://www.treesearch.fs.fed.us/pubs/39839",
				"volume": "8",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Phytophthora ramorum",
					"landscape epidemiology",
					"sudden oak death"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.treesearch.fs.fed.us/pubs/40071",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Repeated prescribed fires alter gap-phase regeneration in mixed-oak forests",
				"creators": [
					{
						"firstName": "Todd F.",
						"lastName": "Hutchinson",
						"creatorType": "author"
					},
					{
						"firstName": "Robert P.",
						"lastName": "Long",
						"creatorType": "author"
					},
					{
						"firstName": "Joanne",
						"lastName": "Rebbeck",
						"creatorType": "author"
					},
					{
						"firstName": "Elaine Kennedy",
						"lastName": "Sutherland",
						"creatorType": "author"
					},
					{
						"firstName": "Daniel A.",
						"lastName": "Yaussy",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"abstractNote": "Oak dominance is declining in the central hardwoods region, as canopy oaks are being replaced by shade-tolerant trees that are abundant in the understory of mature stands. Although prescribed fire can reduce understory density, oak seedlings often fail to show increased vigor after fire, as the canopy remains intact. In this study, we examine the response of tree regeneration to a sequence of repeated prescribed fires followed by canopy gap formation. We sampled advance regeneration (stems >30 cm tall) in 52 gaps formed by synchronous mortality of white oak (Quercus alba L.); 28 gaps were in three burned stands and 24 gaps were in three unburned stands. Five years after gap formation, unburned gaps were being filled by shade-tolerant saplings and poles and were heavily shaded (7% of full sun). By contrast, tolerant saplings had been virtually eliminated in the burned gaps, which averaged 19% of full sun. Larger oak and hickory regeneration was much more abundant in burned gaps, as was sassafras, while shade-tolerant stems were equally abundant in burned and unburned gaps. Our results suggest that the regeneration of oak, particularly that of white oak, may be improved with multiple prescribed fires followed by the creation of moderate-sized canopy gaps (200-400 m2).",
				"libraryCatalog": "Treesearch",
				"pages": "303-314",
				"publicationTitle": "Canadian Journal of Forest Research",
				"url": "https://www.treesearch.fs.fed.us/pubs/40071",
				"volume": "42",
				"attachments": [
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
		"url": "https://www.treesearch.fs.fed.us/pubs/39949",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Application of phosphonate to prevent sudden oak death in south-western Oregon tanoak (Notholithocarpus densiflorus) forests",
				"creators": [
					{
						"firstName": "Alan",
						"lastName": "Kanaskie",
						"creatorType": "author"
					},
					{
						"firstName": "Everett",
						"lastName": "Hansen",
						"creatorType": "author"
					},
					{
						"firstName": "Wendy",
						"lastName": "Sutton",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Reeser",
						"creatorType": "author"
					},
					{
						"firstName": "Carolyn",
						"lastName": "Choquette",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "We conducted four experiments to evaluate the effectiveness of phosphonate application to tanoak (Notholithocarpus densiflorus (Hook. & Arn.) Manos, Cannon & S.H.Oh) forests in south-western Oregon: (1) aerial application to forest stands; (2) trunk injection; (3) foliar spray of potted seedlings; and (4) foliar spray of stump sprouts. We compared aerial spray treatments: (1) no treatment (unsprayed); (2) low-dose (17.35 kg a.i. ha-1); and (3) high dose (34.5 kg a.i. ha-1), applied by helicopter in a carrier volume of 188 L ha-1 to 4-ha treatment plots. Treatments were applied in November 2007, in May 2008, and in December 2008 and May 2009 (double treatment). At the same time as the aerial application we injected phosphonate into the trunk of nearby mature tanoak trees at the standard label rates of 0.43 g a.i. cm-dbh-1. We used three different biological assays to measure uptake of phosphonate: (1) canopy twig dip in zoospore suspension; (2) in situ bole inoculation with Phytophthora gonapodyides (Petersen) Buisman; and (3) laboratory inoculation of log bolts with Phytophthora ramorum S. Werres, A.W.A.M. de Cock & W.A. Man in 't Veld and P. gonapodyides. We also simulated an aerial spray of potted seedlings, comparing an untreated control, a low dose (2.9 kg a.i. ha-1 applied in 935 L spray solution ha-1#, and a high dose #17.35 kg a.i. ha-1applied in 187 L spray solution ha-1).",
				"libraryCatalog": "Treesearch",
				"pages": "S177-S187",
				"publicationTitle": "New Zealand Journal of Forestry Science",
				"url": "https://www.treesearch.fs.fed.us/pubs/39949",
				"volume": "41S",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Oregon",
					"Phytophthora gonapodyides",
					"Phytophthora ramorum",
					"phosphonate",
					"sudden oak death",
					"tanoak."
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.treesearch.fs.fed.us/pubs/38058",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Analysis of historical vegetation patterns in the eastern portion of the Illinois Lesser Shawnee Hills",
				"creators": [
					{
						"firstName": "Suzanne L.",
						"lastName": "Jones",
						"creatorType": "author"
					},
					{
						"firstName": "Roger C.",
						"lastName": "Anderson",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "We used General Land Office Survey (GLO) records to reconstruct the historical (1806-1810) vegetation of the eastern portion of the unglaciated Lesser Shawnee Hills Ecoregion of the Shawnee National Forest Purchase Area in southern Illinois. Prairies occurred on 0.4 percent of the area and savannah, open forest, and closed forest occupied 14.5 percent, 25.4 percent, and 59.6 percent of the area, respectively. Average tree density and basal area for the area were 102 trees per ha and 13 m2/ha, respectively. Closed forest occurred at significantly lower elevation than savannah, with average elevation being 139.3 m and 147.1 m for closed forest and savannah, respectively. White oak (Quercus alba) and black oak (Q. velutina) were the two leading dominant species in all vegetation categories. Savannah had higher importance of xeric species than did closed forest, whereas mesophytic species had higher Importance Values in closed forest. Variation in fire frequency, topography, and moisture availability likely contributed to the landscape vegetation patterns, species composition, and tree density and basal area in the study area. High abundances of oaks and hickories and low tree densities and basal areas throughout the study area indicate that all vegetation types may have experienced periodic fires. Note: Figure 1 corrected on October 30, 2014.",
				"libraryCatalog": "Treesearch",
				"pages": "5-7",
				"url": "https://www.treesearch.fs.fed.us/pubs/38058",
				"attachments": [
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
		"url": "https://www.treesearch.fs.fed.us/pubs/38032",
		"items": [
			{
				"itemType": "book",
				"title": "Proceedings, 17th Central Hardwood Forest Conference",
				"creators": [
					{
						"firstName": "Songlin",
						"lastName": "Fei",
						"creatorType": "author"
					},
					{
						"firstName": "John M.",
						"lastName": "Lhotka",
						"creatorType": "author"
					},
					{
						"firstName": "Jeffrey W.",
						"lastName": "Stringer",
						"creatorType": "author"
					},
					{
						"firstName": "Kurt W.",
						"lastName": "Gottschalk",
						"creatorType": "author"
					},
					{
						"firstName": "Gary W.",
						"lastName": "Miller",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "Includes 64 papers and 17 abstracts pertaining to research conducted on forest regeneration and propagation, forest products, ecology and forest dynamics, human dimensions and economics, forest biometrics and modeling, silviculture genetics, forest health and protection, and soil and mineral nutrition.",
				"libraryCatalog": "Treesearch",
				"numPages": "678",
				"url": "https://www.treesearch.fs.fed.us/pubs/38032",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"forest biometrics",
					"forest ecology",
					"forest health",
					"forest products",
					"regeneration",
					"silviculture"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.treesearch.fs.fed.us/pubs/40032",
		"items": [
			{
				"itemType": "book",
				"title": "West Virginia's Forests 2008",
				"creators": [
					{
						"firstName": "Richard H.",
						"lastName": "Widmann",
						"creatorType": "author"
					},
					{
						"firstName": "Gregory W.",
						"lastName": "Cook",
						"creatorType": "author"
					},
					{
						"firstName": "Charles J.",
						"lastName": "Barnett",
						"creatorType": "author"
					},
					{
						"firstName": "Brett J.",
						"lastName": "Butler",
						"creatorType": "author"
					},
					{
						"firstName": "Douglas M.",
						"lastName": "Griffith",
						"creatorType": "author"
					},
					{
						"firstName": "Mark A.",
						"lastName": "Hatfield",
						"creatorType": "author"
					},
					{
						"firstName": "Cassandra M.",
						"lastName": "Kurtz",
						"creatorType": "author"
					},
					{
						"firstName": "Randall S.",
						"lastName": "Morin",
						"creatorType": "author"
					},
					{
						"firstName": "W. Keith",
						"lastName": "Moser",
						"creatorType": "author"
					},
					{
						"firstName": "Charles H.",
						"lastName": "Perry",
						"creatorType": "author"
					},
					{
						"firstName": "Ronald J.",
						"lastName": "Piva",
						"creatorType": "author"
					},
					{
						"firstName": "Rachel",
						"lastName": "Riemann",
						"creatorType": "author"
					},
					{
						"firstName": "Christopher W.",
						"lastName": "Woodall",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"abstractNote": "The first full annual inventory of West Virginia's forests reports 12.0 million acres of forest land or 78 percent of the State's land area. The area of forest land has changed little since 2000. Of this land, 7.2 million acres (60 percent) are held by family forest owners. The current growing-stock inventory is 25 billion cubic feet--12 percent more than in 2000--and averages 2,136 cubic feet per acre. Yellow-poplar continues to lead in volume followed by white and chestnut oaks. Since 2000, the saw log portion of growing-stock volume has increased by 23 percent to 88 billion board feet. In the latest inventory, net growth exceeded removals for all major species. Detailed information on forest inventory methods and data quality estimates is included in a DVD at the back of this report. Tables of population estimates and a glossary are also included.",
				"libraryCatalog": "Treesearch",
				"numPages": "64",
				"url": "https://www.treesearch.fs.fed.us/pubs/40032",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"biomass",
					"forest health",
					"forest products",
					"forest resources",
					"volume"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
