{
	"translatorID": "5a697ab5-913a-478a-b4ec-98d019aa5dc6",
	"translatorType": 4,
	"label": "NASA NTRS",
	"creator": "Andrew Bergan and Abe Jellinek",
	"target": "^https?://ntrs\\.nasa\\.gov/(citations/|search)",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-09 17:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Andrew Bergan and Abe Jellinek
	
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
	if (url.includes('/search') && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes('/citations/')) {
		return mapType(
			ZU.xpathText(doc,
				'//div[@class="label" and contains(text(), "Document Type")]/following-sibling::div/text()'));
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('app-record-item mat-card-title a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (!items) return;
			for (let url of Object.keys(items)) {
				// don't bother fetching the doc, it's useless
				scrape(null, url);
			}
		});
	}
	else {
		scrape(doc, url);
	}
}

function mapType(docType) {
	if (!docType) return false;
	
	docType = docType.trim().toLowerCase();

	let mapping = {
		'conference paper|conference publication': 'conferencePaper',
		'bibliograph(y|ic)|report|collected works|brief|memo|note|white paper': 'report',
		'journal (article|issue)|^reprint': 'journalArticle',
		'presentation|poster': 'presentation',
		'thesis|dissertation': 'thesis',
		chapter: 'bookSection',
		'book/monograph|conference proceedings': 'book',
		patent: 'patent',
		'computer program': 'computerProgram',
		'motion picture|video': 'videoRecording',
		'preprint|manuscript': 'manuscript'
	};

	for (let [regex, itemType] of Object.entries(mapping)) {
		if (docType.match(new RegExp(regex))) {
			return itemType;
		}
	}

	return 'document';
}

function processJSON(json) {
	let item = new Zotero.Item(mapType(json.stiTypeDetails || json.stiType));
	
	function addToExtra(label, value) {
		if (item.extra == undefined) item.extra = '';
		item.extra += `NTRS ${label}: ${value}\n`;
	}
	
	item.title = json.title;
	
	if (json.sourceIdentifiers) {
		for (let identifier of json.sourceIdentifiers) {
			if (identifier.type == 'DOI') {
				item.DOI = ZU.cleanDOI(identifier.number);
				break;
			}
		}
	}
	
	if (json.downloads) {
		for (let download of json.downloads) {
			item.attachments.push({
				url: download.links.pdf || download.links.original,
				title: download.name,
				mimeType: download.mimetype
			});
		}
	}
	
	if (json.authorAffiliations) {
		let affiliations = [];
		
		for (let entry of json.authorAffiliations) {
			let name = entry.meta.author.name;
			item.creators.push(ZU.cleanAuthor(name, 'author', name.includes(', ')));
			affiliations.push(entry.meta.organization.name);
		}
		
		if (affiliations.length) {
			affiliations = ZU.arrayUnique(affiliations);
			addToExtra('Author Affiliations', affiliations.join(', '));
		}
	}
	
	if (json.subjectCategories) {
		for (let subjectCategory of json.subjectCategories) {
			item.tags.push({ tag: subjectCategory });
		}
	}
	
	if (json.publications && json.publications.length) {
		let earliest;
		for (let publication of json.publications) {
			// we're comparing +00:00 ISO dates here, so string comparison
			// *should* be safe. either way i've never seen an item with more
			// than one publication in this database.
			if (!earliest || publication.publicationDate < earliest.publicationDate) {
				earliest = publication;
			}
		}
		
		item.date = ZU.strToISO(earliest.publicationDate);
		if (item.itemType == 'journalArticle') {
			item.publicationTitle = earliest.publicationName;
			item.volume = earliest.volume;
			item.issue = earliest.issue;
		}
	}
	
	if (json.meetings && json.meetings.length) {
		let meeting = json.meetings[0];
		if (item.itemType == 'conferencePaper') {
			item.conferenceName = meeting.name;
			item.place = meeting.location;
		}
		else {
			let start = meeting.startDate.substring(0, 10);
			let end = meeting.endDate.substring(0, 10);
			addToExtra('Meeting Information', `${meeting.name}; ${start} to ${end}; ${meeting.place}`);
		}
	}
	
	if (json.otherReportNumbers && json.otherReportNumbers.length) {
		if (item.itemType == 'report') {
			item.reportNumber = json.otherReportNumbers[0];
		}
		else {
			addToExtra('Report/Patent Number', json.otherReportNumbers[0]);
		}
	}
	
	if (json.abstract != 'No abstract available') {
		item.abstractNote = json.abstract;
	}
	
	if (json.id) {
		addToExtra('Document ID', json.id);
	}
	
	if (json.center) {
		addToExtra('Research Center', `${json.center.name} (${json.center.code})`);
	}
	
	return item;
}

function scrape(doc, url) {
	ZU.doGet(url.replace('/citations', '/api/citations'), function (text) {
		let json = JSON.parse(text);
		let item = processJSON(json);
		item.url = url;
		if (doc) {
			item.attachments.push({ title: "Snapshot", document: doc });
		}
		item.complete();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/20130010248",
		"defer": true,
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Integration of Airborne Aerosol Prediction Systems and Vegetation Phenology to Track Pollen for Asthma Alerts in Public Health Decision Support Systems",
				"creators": [
					{
						"firstName": "Jeffrey C.",
						"lastName": "Luvall",
						"creatorType": "author"
					},
					{
						"firstName": "William A.",
						"lastName": "Sprigg",
						"creatorType": "author"
					},
					{
						"firstName": "Goran",
						"lastName": "Pejanovic",
						"creatorType": "author"
					},
					{
						"firstName": "Slobodan",
						"lastName": "Nickovic",
						"creatorType": "author"
					},
					{
						"firstName": "Anup",
						"lastName": "Prasad",
						"creatorType": "author"
					},
					{
						"firstName": "Ana",
						"lastName": "Vukovic",
						"creatorType": "author"
					},
					{
						"firstName": "Miram",
						"lastName": "Vujadinovic",
						"creatorType": "author"
					},
					{
						"firstName": "Estelle",
						"lastName": "Levetin",
						"creatorType": "author"
					},
					{
						"firstName": "Landon",
						"lastName": "Bunderson",
						"creatorType": "author"
					},
					{
						"firstName": "Peter K.",
						"lastName": "VandeWater",
						"creatorType": "author"
					},
					{
						"firstName": "Amy",
						"lastName": "Budge",
						"creatorType": "author"
					},
					{
						"firstName": "William",
						"lastName": "Hudspeth",
						"creatorType": "author"
					},
					{
						"firstName": "Alfredo",
						"lastName": "Huete",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Zelicoff",
						"creatorType": "author"
					},
					{
						"firstName": "Theresa",
						"lastName": "Crimmins",
						"creatorType": "author"
					},
					{
						"firstName": "Jake",
						"lastName": "Welzin",
						"creatorType": "author"
					},
					{
						"firstName": "Heide",
						"lastName": "Krapfl",
						"creatorType": "author"
					},
					{
						"firstName": "Barbara",
						"lastName": "Toth",
						"creatorType": "author"
					}
				],
				"date": "2013-01-06",
				"conferenceName": "213th American Meteorological Society (AMS) Meeting",
				"extra": "NTRS Author Affiliations: NASA Marshall Space Flight Center, Chapman Univ., Belgrade Univ., Tulsa Univ., California State Univ., New Mexico Univ., University of Technology, Saint Louis Univ., Geological Survey, Department of Health\nNTRS Report/Patent Number: M12-2358\nNTRS Document ID: 20130010248\nNTRS Research Center: Marshall Space Flight Center (MSFC)",
				"libraryCatalog": "NASA NTRS",
				"place": "Austin, TX",
				"url": "https://ntrs.nasa.gov/citations/20130010248",
				"attachments": [
					{
						"title": "20130010248.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Life Sciences (General)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/20130010247",
		"defer": true,
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Extreme Transients in the High Energy Universe",
				"creators": [
					{
						"firstName": "Chryssa",
						"lastName": "Kouveliotou",
						"creatorType": "author"
					}
				],
				"date": "2013-01-08",
				"abstractNote": "The High Energy Universe is rich in diverse populations of objects spanning the entire cosmological (time)scale, from our own present-day Milky Way to the re-ionization epoch. Several of these are associated with extreme conditions irreproducible in laboratories on Earth. Their study thus sheds light on the behavior of matter under extreme conditions, such as super-strong magnetic fields (in excess of 10^14 G), high gravitational potentials (e.g., Super Massive Black Holes), very energetic collimated explosions resulting in relativistic jet flows (e.g., Gamma Ray Bursts, exceeding 10^53 ergs). In the last thirty years, my work has been mostly focused on two apparently different but potentially linked populations of such transients: magnetars (highly magnetized neutron stars) and Gamma Ray Bursts (strongly beamed emission from relativistic jets), two populations that constitute unique astrophysical laboratories, while also giving us the tools to probe matter conditions in the Universe to redshifts beyond z=10, when the first stars and galaxies were assembled. I did not make this journey alone I have either led or participated in several international collaborations studying these phenomena in multi-wavelength observations; solitary perfection is not sufficient anymore in the world of High Energy Astrophysics. I will describe this journey, present crucial observational breakthroughs, discuss key results and muse on the future of this field.",
				"conferenceName": "219th American Astronomical Society (AAS) Meeting",
				"extra": "NTRS Author Affiliations: NASA Marshall Space Flight Center\nNTRS Report/Patent Number: M12-2354\nNTRS Document ID: 20130010247\nNTRS Research Center: Marshall Space Flight Center (MSFC)",
				"libraryCatalog": "NASA NTRS",
				"place": "Austin, TX",
				"url": "https://ntrs.nasa.gov/citations/20130010247",
				"attachments": [
					{
						"title": "20130010247.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Astrophysics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/20130010221",
		"defer": true,
		"items": [
			{
				"itemType": "document",
				"title": "Gas-Liquid Supersonic Cleaning and Cleaning Verification Spray System",
				"creators": [
					{
						"firstName": "Lewis M.",
						"lastName": "Parrish",
						"creatorType": "author"
					}
				],
				"date": "2009-03-01",
				"abstractNote": "NASA Kennedy Space Center (KSC) recently entered into a nonexclusive license agreement with Applied Cryogenic Solutions (ACS), Inc. (Galveston, TX) to commercialize its Gas-Liquid Supersonic Cleaning and Cleaning Verification Spray System technology. This technology, developed by KSC, is a critical component of processes being developed and commercialized by ACS to replace current mechanical and chemical cleaning and descaling methods used by numerous industries. Pilot trials on heat exchanger tubing components have shown that the ACS technology provides for: Superior cleaning in a much shorter period of time. Lower energy and labor requirements for cleaning and de-scaling uper.ninih. Significant reductions in waste volumes by not using water, acidic or basic solutions, organic solvents, or nonvolatile solid abrasives as components in the cleaning process. Improved energy efficiency in post-cleaning heat exchanger operations. The ACS process consists of a spray head containing supersonic converging/diverging nozzles, a source of liquid gas; a novel, proprietary pumping system that permits pumping liquid nitrogen, liquid air, or supercritical carbon dioxide to pressures in the range of 20,000 to 60,000 psi; and various hoses, fittings, valves, and gauges. The size and number of nozzles can be varied so the system can be built in configurations ranging from small hand-held spray heads to large multinozzle cleaners. The system also can be used to verify if a part has been adequately cleaned.",
				"extra": "NTRS Author Affiliations: QinetiQ North America\nNTRS Report/Patent Number: KSC-2009-044\nNTRS Document ID: 20130010221\nNTRS Research Center: Kennedy Space Center (KSC)",
				"libraryCatalog": "NASA NTRS",
				"url": "https://ntrs.nasa.gov/citations/20130010221",
				"attachments": [
					{
						"title": "20130010221.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Engineering (General)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/20130010127",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mineralogy of Meteorite Groups: An Update",
				"creators": [
					{
						"firstName": "Alan E.",
						"lastName": "Rubin",
						"creatorType": "author"
					}
				],
				"date": "1997-09-01",
				"DOI": "10.1111/j.1945-5100.1997.tb01558.x",
				"abstractNote": "Twenty minerals that were not included in the most recent list of meteoritic minerals have been reported as occurring in meteorites. Extraterrestrial anhydrous Ca phosphate should be called menillite, not whitlockite.",
				"extra": "NTRS Author Affiliations: California Univ.\nNTRS Document ID: 20130010127\nNTRS Research Center: Headquarters (HQ)",
				"issue": "5",
				"libraryCatalog": "NASA NTRS",
				"publicationTitle": "Meteoritics and Planetary Science",
				"shortTitle": "Mineralogy of Meteorite Groups",
				"url": "https://ntrs.nasa.gov/citations/20130010127",
				"volume": "32",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Geophysics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/20040200977",
		"defer": true,
		"items": [
			{
				"itemType": "thesis",
				"title": "Validation of Design and Analysis Techniques of Tailored Composite Structures",
				"creators": [
					{
						"firstName": "Dawn C.",
						"lastName": "Jegley",
						"creatorType": "author"
					},
					{
						"firstName": "Dulnath D.",
						"lastName": "Wijayratne",
						"creatorType": "author"
					}
				],
				"date": "2004-12-01",
				"abstractNote": "Aeroelasticity is the relationship between the elasticity of an aircraft structure and its aerodynamics. This relationship can cause instabilities such as flutter in a wing. Engineers have long studied aeroelasticity to ensure such instabilities do not become a problem within normal operating conditions. In recent decades structural tailoring has been used to take advantage of aeroelasticity. It is possible to tailor an aircraft structure to respond favorably to multiple different flight regimes such as takeoff, landing, cruise, 2-g pull up, etc. Structures can be designed so that these responses provide an aerodynamic advantage. This research investigates the ability to design and analyze tailored structures made from filamentary composites. Specifically the accuracy of tailored composite analysis must be verified if this design technique is to become feasible. To pursue this idea, a validation experiment has been performed on a small-scale filamentary composite wing box. The box is tailored such that its cover panels induce a global bend-twist coupling under an applied load. Two types of analysis were chosen for the experiment. The first is a closed form analysis based on a theoretical model of a single cell tailored box beam and the second is a finite element analysis. The predicted results are compared with the measured data to validate the analyses. The comparison of results show that the finite element analysis is capable of predicting displacements and strains to within 10% on the small-scale structure. The closed form code is consistently able to predict the wing box bending to 25% of the measured value. This error is expected due to simplifying assumptions in the closed form analysis. Differences between the closed form code representation and the wing box specimen caused large errors in the twist prediction. The closed form analysis prediction of twist has not been validated from this test.",
				"extra": "NTRS Author Affiliations: NASA Langley Research Center, George Washington Univ.\nNTRS Report/Patent Number: NASA/CR-2004-212650\nNTRS Document ID: 20040200977\nNTRS Research Center: Langley Research Center (LaRC)",
				"libraryCatalog": "NASA NTRS",
				"url": "https://ntrs.nasa.gov/citations/20040200977",
				"attachments": [
					{
						"title": "20040200977.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Structural Mechanics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/citations/19630002484",
		"defer": true,
		"items": [
			{
				"itemType": "document",
				"title": "Third Saturn Rocket to be Launched",
				"creators": [],
				"date": "1962-11-13",
				"abstractNote": "Saturn sa-3 launch - high water project",
				"extra": "NTRS Document ID: 19630002484\nNTRS Research Center: Legacy CDMS (CDMS)",
				"libraryCatalog": "NASA NTRS",
				"url": "https://ntrs.nasa.gov/citations/19630002484",
				"attachments": [
					{
						"title": "19630002484.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "SPACE VEHICLES"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ntrs.nasa.gov/search?q=saturn%20v",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/
