{
	"translatorID": "5a697ab5-913a-478a-b4ec-98d019aa5dc6",
	"label": "NASA NTRS",
	"creator": "Andrew Bergan",
	"target": "^https?://ntrs\\.nasa\\.gov/(search\\.jsp)?\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-03 17:46:53"
}

function detectWeb(doc, url) {
	// Make sure that we are on a record page or details page
	var contentLabel = ZU.xpathText(doc, '//p[@class="sectiontitle"]');

	if (!contentLabel) return;
	
	if (contentLabel.indexOf("Search Results") != -1) {
		return "multiple";
	}
	else if (contentLabel.indexOf("Record Details") != -1) {
		
		var docType = "";
		
		// Look in the document type field
		var docType = ZU.xpathText(doc, '//td[contains(text(), "Document Type:")]/following-sibling::td/text()')
		
		// remove leading and trailing whitespace
		//var docType = docType.replace(/^\s*|\s*$/g, '');
		
		// Check against implemented document types
		if (docType.indexOf("Conference Paper") != -1) {
			return "conferencePaper"
			
		} else if (docType.indexOf("Bibliographic Database") != -1 || 
		docType.indexOf("Congressional Report") != -1 ||
		docType.indexOf("Bibliography") != -1 ||
		docType.indexOf("Collected Works") != -1 ||
		docType.indexOf("Technical Report") != -1) {
			return "report"
			
		} else if (docType.indexOf("Journal Article") != -1 ||
		docType.indexOf("Journal Issue") != -1) {
			return "journalArticle";
			
		} else if (docType.indexOf("Presentation") != -1) {
			return "presentation";
		
		} else if (docType.indexOf("Thesis") != -1 || 
		docType.indexOf("PhD Dissertation") != -1) {
			return "thesis"
			
		} else if (docType.indexOf("Book Chapter") != -1) {
			return "bookSection"
			
		} else if (docType.indexOf("Book/Monograph") != -1 ||
		docType.indexOf("Conference Proceedings") != -1) {
			return "book"
			
		} else if (docType.indexOf("Patent") != -1) {
			return "patent"
			
		} else if (docType.indexOf("Brief Communication/Note") != -1 ||
		docType.indexOf("NASA Tech Brief") != -1) {
			return "note"
			
		} else if (docType.indexOf("Computer Program") != -1) {
			return "computerProgram"
			
		} else if (docType.indexOf("Motion Picture") != -1) {
			return "videoRecording"
			
		} else if (docType.indexOf("Preprint") != -1) {
			return "manuscript"
		
		} else if (docType.indexOf("Data Set") != -1 || 
		docType.indexOf("Dictionary") != -1 ||
		docType.indexOf("Extended Abstract") != -1 ||
		docType.indexOf("Full Text Database") != -1 ||
		docType.indexOf("Multimedia Database") != -1 ||
		docType.indexOf("Numeric Database") != -1 ||
		docType.indexOf("News Release/Speech") != -1 ||
		docType.indexOf("Other") != -1 ||
		docType.indexOf("Photograph") != -1) {
			return "document"
			
		} else {
			// No match
			return null;
		}
	}
}

function scrape(doc, url) {

	// Get the item
	var newItem = new Zotero.Item(detectWeb(doc, url));
	
	// Get the url
	newItem.url = doc.location.href.replace(/\?.*?\b(R=\d+)(?:&.*)?$/, '?$1');
	
	// Build an array of the items containing the bibliographic data
	var items = new Object();
	
	// Get the title
	newItem.title = "No title found";
	items["Title"] = ZU.xpathText(doc, '//div[@id="doctext"]/table/tbody/tr/td[@id="recordtitle"]')
	if (items["Title"]) newItem.title = items["Title"];
	
	// Loop through each row in table following the "recordtitle" row
	var rows = ZU.xpath(doc, '//div[@id="doctext"]/table/tbody/tr[td[@id!="recordtitle"]]');
	for (var i in rows) {
		var label = ZU.xpathText(rows[i], './td[@id="colTitle"]').replace(/^\s*|\s*$/g, '').replace(/:/, '');
		
		// Handle the document link differently
		if (label.indexOf("Online Source") != -1||label.indexOf("NTRS Full-Text")!=-1) {
			var content = ZU.xpathText(rows[i], './/a/@href');
			
		// Grab the content and remove extra white space and parenthetical info
		} else {
			var content = ZU.xpathText(rows[i], './td[@id="colTitle"]/following-sibling::td').replace(/\([^)]*\)/g, '').replace(/^\s*|\s*$/g, '');
		}

		items[label] = content;
	}
	
	// Save the document as a link attachment
	if (items["Online Source"] || items["External Online Source"]) {
		Z.debug("here")
		var linkurl = items["Online Source"] ? items["Online Source"] : items["External Online Source"];
		
		if (linkurl.match("doi.org")) {
			newItem.DOI = linkurl.replace(/http:\/\/dx.doi.org\//, '');
		} else {
			newItem.attachments = [{ 
				url: linkurl,
				title: "NASA NTRS Full Text PDF",
				mimeType: "application/pdf"
			}];
		}
	}
	if (items["NTRS Full-Text"]){
		newItem.attachments.push({
			url: items["NTRS Full-Text"],
			title: "NASA NTRS Full Text PDF",
			mimeType: "application/pdf"
		})
	}
	// Save a snapshot
	newItem.attachments.push({title: "Snapshot", document: doc});

	// Format and save author field
	if (items["Author and Affiliation"]) {
		var author = items["Author and Affiliation"];

		// Handle multiple authors
		var authors = author.split(";");

		for (var i in authors) {
			var authorName = authors[i];
			authorName= authorName.replace(/\[.+?\]/g, "");
			newItem.creators.push(Zotero.Utilities.cleanAuthor(authorName, "author", authorName.indexOf(', ') != -1));
		}	
	}
	
	// Save tags
	if (items["NASA Terms"]) {
		var tags = items["NASA Terms"].split(";");
		for (var i = 0; i < tags.length; i++) {
			newItem.tags[i] = tags[i].toLowerCase().trim();
		}
	}
	
	// Save the date
	if (items["Publication Date"]) {
		newItem.date = items["Publication Date"].replace(/\[(.*?)\]/g, "$1");
	}
	
	// Save the place / conference name
	if (newItem.itemType == "conferencePaper") {
		if (items["Meeting Information"]) {
			if (items["Meeting Information"].match(";")) {
				var confNameLocation = items["Meeting Information"].split("; ");

				// Save the conference name
				newItem.conferenceName = confNameLocation.shift();
				
				// Save the location
				
				if (confNameLocation.length > 2){
					var daterange = confNameLocation.shift();//right now we discard this, but may be useful later
					newItem.place = confNameLocation.shift() + ", "  + confNameLocation.pop();
				} else if (confNameLocation.length) {
					newItem.place = confNameLocation.shift();
				}
			}
		}
	} else {
		if (items["Meeting Information"]) newItem.notes.push("Meeting Information: " + items["Meeting Information"]);
	}
	
	// Save journal publication information: journal name, vol, issue, pages
	if (newItem.itemType == "journalArticle") {
		if (items["Publication Information"]) {
			journalInfo = items["Publication Information"].split('; ');
			
			// Save the journal name
			if (journalInfo[0].indexOf("=") == -1) {
				newItem.publicationTitle = journalInfo[0].replace(/\(.*\)/, '');
			}
			
			for (var i in journalInfo) {
				
				var content =journalInfo[i];
				Z.debug(content)
				
				// Save the volume
				if (content.indexOf("Volume") != -1) {
					newItem.volume = content.replace(/Volume /, '');
				}
				
				// Save the page numbers
				if (content.match(/^(.*)[0-9]+-[0-9]+$/)) {
					newItem.pages = content;
				}
				
				// Save the issue number
				if (content.indexOf("no.") != -1) {
					newItem.issue = content.replace(/no. /, '');
				} else if (content.indexOf("Issue") != -1) {
					newItem.issue = content.replace(/Issue /, '');
				}
			}
		}
	} else {
		if (items["Publication Information"]) newItem.notes.push("Publication Information: " + items["Publication Information"]);
	}
	
	// Save the report/paper number
	if (items["Report/Patent Number"]) {
		if (newItem["reportNumber"]) {
			newItem.reportNumber = items["Report/Patent Number"];
		} else {
			newItem.notes.push("Report/Patent Number: " + items["Report/Patent Number"]);
		}
	}
	
	// Save the abstract
	newItem.abstractNote = items["Abstract"];
	
	var note = [];
	// Store extra info as notes
	if (items["Document ID"]) note.push("Document ID: " + items["Document ID"]);
	if (items["Accession Number"]) note.push("Accession Number: " + items["Accession Number"]);
	if (items["Subject Category"]) note.push("Subject Category: " + items["Subject Category"]);
	if (items["Publisher Information"]) note.push("Publisher Information: " + items["Publisher Information"]);
	if (items["Financial Sponsor"]) note.push("Financial Sponsor: " + items["Financial Sponsor"]);
	if (items["Organization Source"]) note.push("Organization Source: " + items["Organization Source"]);
	if (items["Description"]) note.push("Description: " + items["Description"]);
	if (items["Imprint And Other Notes"]) note.push("Imprint And Other Notes: " + items["Imprint And Other Notes"]);
	if (items["Notes"]) note.push(items["Notes"]);
	if (note.length){
		newItem.notes.push(note.join("; "))
	}
	newItem.complete();
}

function doWeb(doc, url) {
	
	// Local variables
	var nextTitle;
	var articles = new Object();

	// Handle multiple entries ie search results
	if (detectWeb(doc,url) == "multiple") {
		var titles = ZU.xpath(doc, '//table[@class="recordTable"]/tbody/tr/td/a[1]');
		//var titles = doc.evaluate('//table[@class="recordTable"]/tbody/tr/td/a[1]',doc, null, XPathResult.ANY_TYPE, null);
		
		// Loop through each title and grab the link to the document page
		// store the link in articles
		for (var i in titles) {
			articles[titles[i].href] = titles[i].textContent;
		}
		
		// Get pages the user wants to save
		Zotero.selectItems(articles, function(articles) {
			// If the user doesn't select any, quit
			if (!articles) return true;
			
			// Build an array with the user selected items
			var urls = [];
			for (var article in articles) urls.push(article);
			
			// Call scrape for each article selected
			Zotero.Utilities.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url)
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=20130010248&qs=N%3D4294967219",
		"items": [
			{
				"itemType": "conferencePaper",
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
				"notes": [
					"Report/Patent Number: M12-2358",
					"Document ID: 20130010248; Subject Category: LIFE SCIENCES; Financial Sponsor: NASA Marshall Space Flight Center; Huntsville, AL, United States; Organization Source: NASA Marshall Space Flight Center; Huntsville, AL, United States; Description: 38p; In English; Original contains color illustrations"
				],
				"tags": [
					"aerosols",
					"asthma",
					"atmospheric models",
					"decision support systems",
					"meteorology",
					"phenology",
					"pollen",
					"public health",
					"regression analysis",
					"seasons",
					"texas",
					"trajectory analysis",
					"trees",
					"vegetation",
					"wind direction"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NASA NTRS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=20130010248",
				"title": "Integration of Airborne Aerosol Prediction Systems and Vegetation Phenology to Track Pollen for Asthma Alerts in Public Health Decision Support Systems",
				"date": "Jan 06, 2013",
				"conferenceName": "213th American Meteorological Society  Meeting",
				"place": "Austin, TX, United States",
				"abstractNote": "No abstract available",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=20130010247&qs=N%3D4294967219",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "Chryssa",
						"lastName": "Kouveliotou",
						"creatorType": "author"
					}
				],
				"notes": [
					"Report/Patent Number: M12-2354",
					"Document ID: 20130010247; Subject Category: ASTROPHYSICS; Financial Sponsor: NASA Marshall Space Flight Center; Huntsville, AL, United States; Organization Source: NASA Marshall Space Flight Center; Huntsville, AL, United States; Description: 1p; In English"
				],
				"tags": [
					"astrophysics",
					"cosmology",
					"gamma ray bursts",
					"gravitational fields",
					"magnetars",
					"magnetic fields",
					"red shift",
					"universe"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NASA NTRS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=20130010247",
				"title": "Extreme Transients in the High Energy Universe",
				"date": "Jan 08, 2013",
				"conferenceName": "219th American Astronomical Society  Meeting",
				"place": "Austin, TX, United States",
				"abstractNote": "The High Energy Universe is rich in diverse populations of objects spanning the entire cosmological scale, from our own present-day Milky Way to the re-ionization epoch. Several of these are associated with extreme conditions irreproducible in laboratories on Earth. Their study thus sheds light on the behavior of matter under extreme conditions, such as super-strong magnetic fields , high gravitational potentials , very energetic collimated explosions resulting in relativistic jet flows . In the last thirty years, my work has been mostly focused on two apparently different but potentially linked populations of such transients: magnetars  and Gamma Ray Bursts , two populations that constitute unique astrophysical laboratories, while also giving us the tools to probe matter conditions in the Universe to redshifts beyond z=10, when the first stars and galaxies were assembled. I did not make this journey alone I have either led or participated in several international collaborations studying these phenomena in multi-wavelength observations; solitary perfection is not sufficient anymore in the world of High Energy Astrophysics. I will describe this journey, present crucial observational breakthroughs, discuss key results and muse on the future of this field.",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=20130010221&qs=N%3D4294967061",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Lewis M.",
						"lastName": "Parrish",
						"creatorType": "author"
					}
				],
				"notes": [
					"Report/Patent Number: KSC-2009-044",
					"Document ID: 20130010221; Subject Category: ENGINEERING; Financial Sponsor: NASA Kennedy Space Center; Cocoa Beach, FL, United States; Organization Source: NASA Kennedy Space Center; Cocoa Beach, FL, United States; Description: 3p; In English; Original contains color illustrations"
				],
				"tags": [
					"carbon dioxide",
					"chemical cleaning",
					"convergent-divergent nozzles",
					"cryogenic equipment",
					"heat exchangers",
					"liquid air",
					"liquid nitrogen",
					"liquid-gas mixtures",
					"natural gas",
					"pipes",
					"spray nozzles",
					"supercritical pressures",
					"supersonic nozzles"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NASA NTRS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=20130010221",
				"title": "Gas-Liquid Supersonic Cleaning and Cleaning Verification Spray System",
				"date": "Mar 01, 2009",
				"abstractNote": "NASA Kennedy Space Center  recently entered into a nonexclusive license agreement with Applied Cryogenic Solutions , Inc.  to commercialize its Gas-Liquid Supersonic Cleaning and Cleaning Verification Spray System technology. This technology, developed by KSC, is a critical component of processes being developed and commercialized by ACS to replace current mechanical and chemical cleaning and descaling methods used by numerous industries. Pilot trials on heat exchanger tubing components have shown that the ACS technology provides for: Superior cleaning in a much shorter period of time. Lower energy and labor requirements for cleaning and de-scaling uper.ninih. Significant reductions in waste volumes by not using water, acidic or basic solutions, organic solvents, or nonvolatile solid abrasives as components in the cleaning process. Improved energy efficiency in post-cleaning heat exchanger operations. The ACS process consists of a spray head containing supersonic converging/diverging nozzles, a source of liquid gas; a novel, proprietary pumping system that permits pumping liquid nitrogen, liquid air, or supercritical carbon dioxide to pressures in the range of 20,000 to 60,000 psi; and various hoses, fittings, valves, and gauges. The size and number of nozzles can be varied so the system can be built in configurations ranging from small hand-held spray heads to large multinozzle cleaners. The system also can be used to verify if a part has been adequately cleaned.",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=20130010127&qs=N%3D4294937145",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Alan E.",
						"lastName": "Rubin",
						"creatorType": "author"
					}
				],
				"notes": [
					"Document ID: 20130010127; Subject Category: GEOPHYSICS; Financial Sponsor: NASA; Washington, DC, United States; Organization Source: California Univ.; Inst. of Geophysics and Planetary Physics; Los Angeles, CA, United States; Description: 2p; In English"
				],
				"tags": [
					"chondrites",
					"ilmenite",
					"impact melts",
					"meteorites",
					"meteoritic composition",
					"mineralogy",
					"minerals",
					"phosphates",
					"snc meteorites"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=20130010127",
				"title": "Mineralogy of Meteorite Groups: An Update",
				"DOI": "10.1111/j.1945-5100.1997.tb01558.x",
				"date": "Sep 01, 1997",
				"publicationTitle": "Meteoritics and Planetary Science",
				"volume": "32",
				"issue": "5",
				"pages": "733-734",
				"abstractNote": "Twenty minerals that were not included in the most recent list of meteoritic minerals have been reported as occurring in meteorites. Extraterrestrial anhydrous Ca phosphate should be called menillite, not whitlockite.",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Mineralogy of Meteorite Groups"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=20040200977",
		"items": [
			{
				"itemType": "thesis",
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
				"notes": [
					"Report/Patent Number: NASA/CR-2004-212650",
					"Document ID: 20040200977; Subject Category: STRUCTURAL MECHANICS; Financial Sponsor: NASA Langley Research Center; Hampton, VA, United States; Organization Source: George Washington Univ.; Joint Inst. for Advancement of Flight Sciences; Hampton, VA, United States; Description: 85p; In English"
				],
				"tags": [
					"aerodynamics",
					"aeroelasticity",
					"bending",
					"box beams",
					"composite structures",
					"data processing",
					"design analysis",
					"displacement",
					"fiber composites",
					"finite element method",
					"flutter",
					"loads",
					"mathematical models",
					"panels",
					"predictions",
					"stability",
					"wings"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NASA NTRS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=20040200977",
				"title": "Validation of Design and Analysis Techniques of Tailored Composite Structures",
				"date": "Dec 01, 2004",
				"abstractNote": "Aeroelasticity is the relationship between the elasticity of an aircraft structure and its aerodynamics. This relationship can cause instabilities such as flutter in a wing. Engineers have long studied aeroelasticity to ensure such instabilities do not become a problem within normal operating conditions. In recent decades structural tailoring has been used to take advantage of aeroelasticity. It is possible to tailor an aircraft structure to respond favorably to multiple different flight regimes such as takeoff, landing, cruise, 2-g pull up, etc. Structures can be designed so that these responses provide an aerodynamic advantage. This research investigates the ability to design and analyze tailored structures made from filamentary composites. Specifically the accuracy of tailored composite analysis must be verified if this design technique is to become feasible. To pursue this idea, a validation experiment has been performed on a small-scale filamentary composite wing box. The box is tailored such that its cover panels induce a global bend-twist coupling under an applied load. Two types of analysis were chosen for the experiment. The first is a closed form analysis based on a theoretical model of a single cell tailored box beam and the second is a finite element analysis. The predicted results are compared with the measured data to validate the analyses. The comparison of results show that the finite element analysis is capable of predicting displacements and strains to within 10% on the small-scale structure. The closed form code is consistently able to predict the wing box bending to 25% of the measured value. This error is expected due to simplifying assumptions in the closed form analysis. Differences between the closed form code representation and the wing box specimen caused large errors in the twist prediction. The closed form analysis prediction of twist has not been validated from this test.",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?R=19630002484&hterms=Apollo+Separation+Systems+Comparisons&qs=Ntx%3Dmode%2520matchallpartial%26Ntk%3DAll%26Ns%3DPublication-Date%7C0%26N%3D0%26Ntt%3DApollo%2520Separation%2520Systems%2520Comparisons",
		"items": [
			{
				"itemType": "report",
				"creators": [],
				"notes": [
					"Document ID: 19630002484; Accession Number: 63N12360; Subject Category: SPACE VEHICLES; Publisher Information: United States; Financial Sponsor: NASA; United States; Description: 23p; In Other; Imprint And Other Notes: NATIONAL AERONAUTICS AND SPACE ADMINISTRATION, WASHINGTON, D.C. THIRD SATURN ROCKET TO BE LAUNCHED  NEWS RELEASE NO. 62-237 NOV. 13, 1962  22P"
				],
				"tags": [
					"launching",
					"news",
					"saturn 1 sa-1 launch vehicle",
					"water"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NASA NTRS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"url": "http://ntrs.nasa.gov/search.jsp?R=19630002484",
				"title": "Third Saturn Rocket to be Launched",
				"date": "Nov 13, 1962",
				"abstractNote": "Saturn sa-3 launch - high water project",
				"libraryCatalog": "NASA NTRS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ntrs.nasa.gov/search.jsp?N=0&Ntk=All&Ntt=Microphone%20Array%20Phased%20Processing%20System%20(MAPPS)%3A%20Phased%20Array%20System%20for%20Acoustic%20Measurements%20in%20a%20Wind%20Tunnel&Ntx=mode%20matchallpartial",
		"items": "multiple"
	}
]
/** END TEST CASES **/