{
	"translatorID": "f3b81c4e-28b4-41ae-9824-55739fe9c91a",
	"translatorType": 4,
	"label": "Computer History Museum Archive",
	"creator": "Bo An",
	"target": "^https?://www\\.computerhistory\\.org/collections/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 17:30:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2020-2021 Bo An
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
	const collection = "/collections/search/";
	const artifact = "/collections/catalog/";
	const isCollection = url.includes(collection);
	const isArtifact = url.includes(artifact);
	if (isCollection) {
		return 'multiple';
	}
	else if (isArtifact) {
		return getZoteroItemType(doc);
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), (items) => {
			if (!items) {
				return true;
			}
			const articles = [];
			for (const i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
			return true;
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	const entries = doc.querySelectorAll('p.objtext');

	for (let i = 0; i < entries.length; i++) {
		const titleDiv = entries[i].querySelector('span.objtitle a');
		if (!titleDiv) continue;
		const href = titleDiv.href;
		const title = titleDiv.textContent;
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function scrape(doc, _) {
	const zoteroItemType = getZoteroItemType(doc);

	let newItem = new Zotero.Item(zoteroItemType);

	const nodes = getFieldNodes(doc);

	nodes.forEach((node) => {
		const fieldTitleNode = node.querySelector("h4");
		const fieldTitle = fieldTitleNode.textContent.trim();
		switch (fieldTitle) {
			case 'Title':
				newItem.title = getContent(node, fieldTitle);
				break;
			case 'Date':
				newItem.date = getContent(node, fieldTitle);
				break;
			case 'Participants':
			case 'Contributor':
				newItem.creators = getContributors(node);
				break;
			case 'Publisher':
				if (newItem.itemType == 'artwork') {
					newItem.rights = getContent(node, fieldTitle);
				}
				else {
					newItem.publisher = getContent(node, fieldTitle);
				}
				break;
			case 'Place of Publication':
				newItem.place = getContent(node, fieldTitle);
				break;
			case 'Extent':
				newItem.numPages = getContent(node, fieldTitle).replace(' p.', '');
				break;
			case 'Lot Number':
				newItem.archiveLocation = getContent(node, fieldTitle);
				break;
			case 'Description':
				newItem.abstractNote = insertToTheStartOfAbstract(getContent(node, fieldTitle), newItem.abstractNote);
				break;
			case 'Biographical Notes':
				newItem.abstractNote = insertToTheEndOfAbstract(getContent(node, fieldTitle), newItem.abstractNote, fieldTitle);
				break;
			case 'Copyright Holder':
				newItem.rights = getContent(node, fieldTitle);
				break;
			case 'Subject':
				const allTagsString = getContent(node, fieldTitle);
				const allTags = allTagsString.split(';').map(tag => tag.trim()).sort();
				if (allTags && allTags.length > 0) {
					newItem.tags = allTags;
				}
				break;
			// other archival and / or meta info that go into extra.
			case 'Format':
				if (newItem.itemType == 'videoRecording') {
					// note that format field for Video Recording type is not displayed in scaffold.
					newItem.videoRecordingFormat = getContent(node, fieldTitle);
					break;
				}
				if (newItem.itemType == 'audioRecording') {
					newItem.audioRecordingFormat = getContent(node, fieldTitle);
					break;
				}
				if (newItem.itemType == 'artwork') {
					newItem.medium = getContent(node, fieldTitle);
					break;
				}
			case 'Dimensions':
				if (newItem.itemType == 'artwork') {
					newItem.artworkSize = getContent(node, fieldTitle);
					break;
				}
			case 'Duration':
				if (newItem.itemType == 'videoRecording' || newItem.itemType == 'audioRecording') {
					// note that format field for Video Recording type is not displayed in scaffold.
					newItem.runningTime = getContent(node, fieldTitle);
					break;
				}
			// notes that if there are conditional logics for a field, like "dimensions"， they need to come above. Therewise, they might be polluted by stacked switch cases, like "Categories" got mixed with "Dimensions".
			case 'Category':
			case 'Collection Title':
			case 'Credit':
			case 'Place Manufactured':
			case 'Manufacturer':
			case 'System Requirements':
			case 'Series Title':
			case 'Platform':
			// the categories vary therefore many are collapsed under 'extra'.
			case 'Catalog Number':
				newItem.extra = addToExtra(newItem.extra, getContent(node, fieldTitle), fieldTitle);
				break;
			// parsing identifying numbers with existing Zotero fields e.g. ISBN
			case 'Identifying Numbers':
				node.querySelectorAll('tr').forEach((div) => {
					const numberKey = div.querySelector('td.col1').textContent;
					const numberVal = div.querySelector('td.col2').textContent;
					switch (numberKey) {
						case 'ISBN10':
							newItem.ISBN = numberVal;
							break;
						case 'Other number':
							break;
						default:
							newItem.extra = addToExtra(newItem.extra, numberVal, numberKey);
							break;
					}
				});
		}
	});

	// add pdf documents
	const pdfDiv = doc.querySelectorAll('div.mediaDocument li a');
	if (pdfDiv) {
		pdfDiv.forEach((div) => {
			const fileName = div.textContent;
			const pdfPath = div.href;
			if (pdfPath) {
				newItem.attachments.push({
					url: pdfPath,
					mimeType: "application/pdf",
					title: `${fileName ? fileName : newItem.title}`,
				});
			}
		});
	}

	// add audio recordings
	const audioDiv = doc.querySelectorAll('div.mediaAudio li a');
	if (audioDiv) {
		audioDiv.forEach((div) => {
			const audioPath = div.href;
			const fileName = div.textContent;
			if (audioPath) {
				newItem.attachments.push({
					url: audioPath,
					mimeType: "audio/mpeg",
					title: `${fileName ? fileName : newItem.title}`
				});
			}
		});
	}

	// add object images
	const imageDiv = doc.querySelectorAll('div.mediarow a.media-large img');
	if (imageDiv) {
		imageDiv.forEach((div) => {
			const imagePath = div.src;
			const fileName = div.textContent;
			if (imagePath) {
				newItem.attachments.push({
					url: imagePath,
					title: `${fileName ? fileName : newItem.title}`,
					mimeType: 'image/png'
				});
			}
		});
	}

	// add video links
	const videoDivs = doc.querySelectorAll('div.mediaVideo iframe');
	if (videoDivs) {
		videoDivs.forEach((div) => {
			const videoPath = div.src;
			const fileName = div.textContent;
			if (videoPath) {
				newItem.attachments.push({
					url: videoPath,
					title: `${fileName ? fileName : newItem.title}`,
					snapshot: false
				});
			}
		});
	}

	newItem.archive = 'Computer History Museum';

	newItem.complete();
}

// get field nodes containing item information from html doc.
function getFieldNodes(doc) {
	const fields = [...doc.querySelectorAll("div.field")];

	// clone the node to avoid altering the document.
	return fields.map(nodeOriginal => nodeOriginal.cloneNode(true));
}

// get the corresponding types. CHM Still Image = Zotero Artwork; CHM Moving Image = Zotero Video Recording; CHM Software = Zotero Computer Program. Other CHM types are all "books".
function getZoteroItemType(doc) {
	let type = 'book';

	const nodes = getFieldNodes(doc);

	nodes.forEach((node) => {
		const fieldTitleNode = node.querySelector("h4");
		const fieldTitle = fieldTitleNode.textContent.trim();
		if (fieldTitle == 'Type') {
			let chmItemType = getContent(node, fieldTitle);
			
			chmItemType = chmItemType.toLowerCase();

			switch (chmItemType) {
				case 'audio':
					type = 'audioRecording';
					break;
				case 'moving image':
					type = "videoRecording";
					break;
				case 'software':
					type = "computerProgram";
					break;
				case 'still image':
					type = 'artwork';
					break;
				default:
					type = 'book';
			}
		}
		return type;
	});

	return type;
}

// helper functions
function insertToTheStartOfAbstract(insert, abstract, fieldTitle) {
	const abstractContent = (fieldTitle !== undefined ? fieldTitle + ': ' : '') + insert + '\n' + (abstract ? abstract : '');
	return abstractContent ? abstractContent : '';
}

function insertToTheEndOfAbstract(insert, abstract, fieldTitle) {
	const abstractContent = (abstract ? abstract + '\n' : '') + (fieldTitle !== undefined ? fieldTitle + ': ' : '') + insert;
	return abstractContent ? abstractContent : '';
}

function getContent(node, fieldTitle) {
	const content = node.textContent.replace(fieldTitle, '').trim();
	return content ? content : '';
}
function addToExtra(oldExtra, newContent, fieldTitle) {
	return (oldExtra ? oldExtra + '\n' : '') + fieldTitle + ': ' + newContent.replace(/ {2}/g, '').replace(/\n\n/g, '').replace('\n', ': ');
}

function getContributors(node) {
	let contributors = [];
	const people = node.querySelectorAll('td');
	people.forEach((personDiv) => {
		const spans = personDiv.querySelectorAll('span');
		const name = spans[0].textContent;
		const [lastName, firstName] = name.split(', ');
		contributors.push({
			firstName,
			lastName,
			creatorType: "contributor"
		});
	});
	return contributors;
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102658053",
		"items": [
			{
				"itemType": "book",
				"title": "Knuth, Donald oral history",
				"creators": [
					{
						"firstName": "Edward",
						"lastName": "Feigenbaum",
						"creatorType": "contributor"
					},
					{
						"firstName": "Donald E.",
						"lastName": "Knuth",
						"creatorType": "contributor"
					},
					{
						"firstName": "Yan",
						"lastName": "Rosenshteyn",
						"creatorType": "contributor"
					}
				],
				"date": "2007-03-14; 2007-03-21",
				"abstractNote": "In this wide-ranging interview conducted by Edward Feigenbaum, Donald Knuth talks about the progression of his life and career.  Topics include his family background and early interest in music, physics and mathematics, his first exposure to programming,  finding a mentor, and writing a doctoral thesis.   He describes how \"The Art of Computer Programming\" became \"the story of my life\", and why it was put on hold for the TeX and METAFONT projects.  He also talks about personal work habits, programming style, analysis of algorithms, the influence of religion in his life, and his advice to the next generation of scientists.",
				"archive": "Computer History Museum",
				"archiveLocation": "X3926.2007",
				"extra": "Catalog Number: 102658053\nCategory: Transcription\nCollection Title: Oral history collection",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "73",
				"place": "Mountain View, California",
				"publisher": "Computer History Museum",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "102658053-05-01-acc.pdf"
					}
				],
				"tags": [
					{
						"tag": "Analysis of algorithms"
					},
					{
						"tag": "Combinatorial analysis--Data processing"
					},
					{
						"tag": "Combinatorics"
					},
					{
						"tag": "Fellow Award Honoree"
					},
					{
						"tag": "IBM 650 (Computer)"
					},
					{
						"tag": "Knuth, Donald"
					},
					{
						"tag": "Literate programming"
					},
					{
						"tag": "METAFONT"
					},
					{
						"tag": "Religion"
					},
					{
						"tag": "Stanford University"
					},
					{
						"tag": "TeX"
					},
					{
						"tag": "The Art of Computer Programming"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102646282",
		"items": [
			{
				"itemType": "book",
				"title": "IBM 1401 Programming Systems",
				"creators": [],
				"date": "1959",
				"abstractNote": "The brochure explains the IBM 1401 programming languages and their application to the 1401 data processing system. The brochure is printed in black, white, and blue. The front cover shows the words Programming and Systems in a repetitive design with the name Donald G. McBrien stamped in the upper right corner. The back cover shows the company logo on a blue background. Throughout the inside pages are black and white photographs of the computer and images of reports generated by the system. Text contents include: What is a 1401 program?; What is a stored program machine?; What are 1401 programming systems?; What 1401 programming systems mean to management?; IBM programming systems; Here's how one of the 1401 programming systems -- Report Program Generator -- works to increase programming efficiency; New IBM services include:; Other services available to every IBM customer.",
				"archive": "Computer History Museum",
				"archiveLocation": "X3067.2005",
				"extra": "Catalog Number: 102646282\nDimensions: 9 5/8 x 7 6/8 in.\nCategory: Promotional Material",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "6",
				"place": "U.S.",
				"publisher": "International Business Machines Corporation. Data Processing Division. (IBM)",
				"rights": "International Business Machines Corporation (IBM). Data Processing Division",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "IBM.1401.1959.102646282.pdf"
					},
					{
						"title": "IBM 1401 Programming Systems",
						"mimeType": "image/png"
					}
				],
				"tags": [
					{
						"tag": "1401 data processing system (Computer)"
					},
					{
						"tag": "1401 programming systems (Software)"
					},
					{
						"tag": "Business applications"
					},
					{
						"tag": "COBOL (Software)"
					},
					{
						"tag": "Digital communications--Social aspects"
					},
					{
						"tag": "Digital computer: mainframe"
					},
					{
						"tag": "International Business Machines Corporation (IBM). Data Processing Division"
					},
					{
						"tag": "Scientific applications"
					},
					{
						"tag": "Software"
					},
					{
						"tag": "promotional materials"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102623002",
		"items": [
			{
				"itemType": "book",
				"title": "A guide to Fortran IV programming",
				"creators": [],
				"date": "1972",
				"ISBN": "9780471582816",
				"abstractNote": "Second edition.  Signed by McCracken on title page.",
				"archive": "Computer History Museum",
				"archiveLocation": "X3682.2007",
				"extra": "Catalog Number: 102623002\nLCCN: 72-4745\nLOC call num: QA76.73.F25 M3 1972\nDimensions: 28 cm.\nCategory: Book",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "288",
				"place": "New York",
				"publisher": "John Wiley & Sons",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102790985",
		"items": [
			{
				"itemType": "book",
				"title": "Logic Programming Workshop '83 poster",
				"creators": [],
				"date": "1983",
				"abstractNote": "PDF scan of the poster for the Logic Programming Workshop '83 in Algarve Portugal, June 26 - July 1, 1983.",
				"archive": "Computer History Museum",
				"archiveLocation": "X9292.2020",
				"extra": "Catalog Number: 102790985\nCategory: Promotional Material",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "1; 0.0004 GB",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "LPW_Albufeira_1983_poster.pdf"
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
		"url": "https://www.computerhistory.org/collections/catalog/102620354",
		"items": [
			{
				"itemType": "book",
				"title": "LP20 Linear Programming System",
				"creators": [],
				"archive": "Computer History Museum",
				"archiveLocation": "X4248.2008",
				"extra": "Catalog Number: 102620354\nProgram ID number: 10.1.009\nCategory: Manual\nCollection Title: 1620 Restoration Project Collection\nCredit: Gift of John Maniotes",
				"libraryCatalog": "Computer History Museum Archive",
				"publisher": "International Business Machines Corporation (IBM)",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102765924",
		"items": [
			{
				"itemType": "book",
				"title": "Jacquard programming cards",
				"creators": [],
				"abstractNote": "The object is a series of cardboard punch cards connected by string. The cards are hand numbered sequentially from 6 to 44.",
				"archive": "Computer History Museum",
				"archiveLocation": "X8070.2017",
				"extra": "Catalog Number: 102765924\nDimensions: folded for storage: 2 1/2 in x 9 1/4 in x 5 in; unfolded: 1/8 in x 9 1/4 in x 97 1/2 in\nCategory: I/O/punched card device\nCredit: Gift of the Museum of American Heritage",
				"libraryCatalog": "Computer History Museum Archive",
				"attachments": [
					{
						"title": "Jacquard programming cards",
						"mimeType": "image/png"
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
		"url": "https://www.computerhistory.org/collections/catalog/102701957",
		"items": [
			{
				"itemType": "book",
				"title": "Bizmac programming manual binder",
				"creators": [],
				"date": "1956",
				"archive": "Computer History Museum",
				"archiveLocation": "X5121.2009",
				"extra": "Catalog Number: 102701957\nManufacturer: RCA Corporation\nDimensions: overall: 2 in x 10 in x 11 1/2 in\nCategory: Ephemera/other",
				"libraryCatalog": "Computer History Museum Archive",
				"attachments": [
					{
						"title": "Bizmac programming manual binder",
						"mimeType": "image/png"
					},
					{
						"title": "Bizmac programming manual binder",
						"mimeType": "image/png"
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
		"url": "https://www.computerhistory.org/collections/catalog/102738167",
		"items": [
			{
				"itemType": "book",
				"title": "Abe, Takao oral history",
				"creators": [
					{
						"firstName": "Takao",
						"lastName": "Abe",
						"creatorType": "contributor"
					},
					{
						"firstName": "Doug",
						"lastName": "Fairbairn",
						"creatorType": "contributor"
					}
				],
				"date": "2016-06-20",
				"abstractNote": "Mr. Abe was born in 1936 in Otaru, on Hokkaido, the northern island of Japan. He attended Hokkaido University, majoring in physics. He was recruited by a previous graduate of the same university to come to Tokyo and work for Shin-Etsu Handotai. The year was 1964. Abe requested a job in basic research, but the company needed help in growing crystalline silicon for use in semiconductors. \n\nAbe was given the job to improve the quality of the silicon ingots. He traveled to Bell Labs and to Siemens, as Siemens was the source of their crystal growing equipment. During the interview, Abe describes the ups and downs of the industry and his substantial contributions to the quality of silicon wafers.",
				"archive": "Computer History Museum",
				"archiveLocation": "X7645.2016",
				"extra": "Catalog Number: 102738167\nFormat: PDF\nCategory: Transcription\nCollection Title: CHM oral history collection\nCredit: Computer History Museum",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "24",
				"place": "Tokyo, Japan",
				"publisher": "Computer History Museum",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "Transcript of Takeo Abe's oral history"
					}
				],
				"tags": [
					{
						"tag": "Dash-necking"
					},
					{
						"tag": "Hokkaido University"
					},
					{
						"tag": "SIMOX"
					},
					{
						"tag": "SOI"
					},
					{
						"tag": "Silicon on Insulator"
					},
					{
						"tag": "Voronkov"
					},
					{
						"tag": "silicon wafers"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102746874",
		"items": [
			{
				"itemType": "book",
				"title": "Xbox oral history panel",
				"creators": [
					{
						"firstName": "Nicholas",
						"lastName": "Baker",
						"creatorType": "contributor"
					},
					{
						"firstName": "Eric",
						"lastName": "Dennis",
						"creatorType": "contributor"
					},
					{
						"firstName": "Todd",
						"lastName": "Holmdahl",
						"creatorType": "contributor"
					},
					{
						"firstName": "Albert J.",
						"lastName": "Penello",
						"creatorType": "contributor"
					},
					{
						"firstName": "Dag",
						"lastName": "Spicer",
						"creatorType": "contributor"
					}
				],
				"date": "2014-03-25",
				"abstractNote": "Three key members of the original Microsoft Xbox team come together in this oral history to discuss the early development of Xbox and Xbox 360, two of the most significant game consoles in computer history. Architect Nick Baker, head of hardware Todd Holmdahl, and marketing lead Albert Penello cover the early development years of the original Xbox and their attempt to gain a foothold in the highly competitive game console market. They then continue with the history of the Xbox 360 console, the successor to the original, and the changing nature of the video game business during that period that allowed for innovations such as live, interconnected play over a network and the Kinect input capture device. Strategic, technical, and marketing aspects of this history are discussed, as are visions for the future of gaming.",
				"archive": "Computer History Museum",
				"archiveLocation": "X7120.2014",
				"extra": "Catalog Number: 102746874\nCategory: Transcription\nCollection Title: Oral history collection\nCredit: Computer History Museum",
				"libraryCatalog": "Computer History Museum Archive",
				"numPages": "27",
				"place": "Mountain View, California",
				"publisher": "Computer History Museum",
				"rights": "Computer History Museum",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "102746874-05-01-acc.pdf"
					}
				],
				"tags": [
					{
						"tag": "ATI Technologies Inc."
					},
					{
						"tag": "Allard, J"
					},
					{
						"tag": "Bach, Robbie"
					},
					{
						"tag": "Central Processing Unit (CPU)"
					},
					{
						"tag": "Flextronics"
					},
					{
						"tag": "Graphics Processing Unit (GPU)"
					},
					{
						"tag": "Halo"
					},
					{
						"tag": "International Business Machines Corporation (IBM)"
					},
					{
						"tag": "Kinect"
					},
					{
						"tag": "Media Center PC (personal computer)"
					},
					{
						"tag": "Microsoft Corporation"
					},
					{
						"tag": "Nvidia Corporation"
					},
					{
						"tag": "Performance Optimization With Enhanced RISC--Performance Computing (PowerPC)"
					},
					{
						"tag": "Playstation"
					},
					{
						"tag": "Sony Corporation"
					},
					{
						"tag": "Windows"
					},
					{
						"tag": "Wistron"
					},
					{
						"tag": "Xbox"
					},
					{
						"tag": "Xbox 360"
					},
					{
						"tag": "Xbox One"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/search/?s=oral+history&page=4",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102738261",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Su, Stephen oral history",
				"creators": [
					{
						"firstName": "Douglas",
						"lastName": "Fairbairn",
						"creatorType": "contributor"
					},
					{
						"firstName": "Stephen",
						"lastName": "Su",
						"creatorType": "contributor"
					}
				],
				"date": "2017-04-19",
				"abstractNote": "Stephen Su grew up on Taiwan, but in 1980 he came to the US to attend high school and college, including studying semiconductors at Caltech. He worked for Motorola for a period of time before returning to school in 1992 to get an MBA from Kellog. Upon graduation, he joined Boston Consulting Group and went to Hong Kong on a consulting assignment. \nIn 1998, Stephen returned to Taiwan, working for Primax.  While there he spent several years managing the Mobile Accessories group, responsible for developing accessories for mobile phone makers like Nokia and Apple.  In particular, he was responsible for developing the camera module for several generations of Apple’s iPhone. He tells many interesting stories about working with Apple on this very important program. \nIn 2009, he was recruited to join ITRI, where he is involved with helping steer Taiwan into lucrative new markets through careful investments in promising new technologies.",
				"archive": "Computer History Museum",
				"archiveLocation": "X8201.2017",
				"extra": "Catalog Number: 102738261\nCategory: Oral history\nCredit: Computer History Museum",
				"libraryCatalog": "Computer History Museum Archive",
				"place": "Mountain View, CA",
				"studio": "Computer History Museum",
				"videoRecordingFormat": "MOV",
				"attachments": [
					{
						"title": "Su, Stephen oral history",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Apple"
					},
					{
						"tag": "Camera"
					},
					{
						"tag": "ITRI"
					},
					{
						"tag": "iPhone"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/search/?s=oral+history&page=5",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102796519",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "TRS-80 word processing applications",
				"creators": [],
				"date": "1984",
				"abstractNote": "One 5 1/4 floppy disk. Label: Single-sided, double-density disk for TRS-80 Word Processing Applications for Profile III Plus for the TRS-80 Model III or Model 4 with 48K memory. ISBN: 0-8359-7881-8.",
				"archive": "Computer History Museum",
				"archiveLocation": "X4114.2007",
				"company": "Reston Publishing Company",
				"extra": "Catalog Number: 102796519\nSystem Requirements: TRS-80 Model III or Model 4 with 48K memory\nFormat: 5 1/4 inch floppy disk\nCollection Title: Radio Shack collection\nSeries Title: Software",
				"libraryCatalog": "Computer History Museum Archive",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102740039",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Kramlich, Dick (C. Richard) oral history part 1 of 4",
				"creators": [
					{
						"firstName": "David C.",
						"lastName": "Brock",
						"creatorType": "contributor"
					},
					{
						"firstName": "James",
						"lastName": "Fortier",
						"creatorType": "contributor"
					},
					{
						"firstName": "C. Richard",
						"lastName": "Kramlich",
						"creatorType": "contributor"
					}
				],
				"date": "2015-03-31",
				"abstractNote": "C. Richard Kramlich co-founded the venture capital firm New Enterprise Associates (NEA) in 1978, serving as its managing general partner for two decades. In this oral history, Kramlich discusses his education at the Harvard Business School, his early career in finance, and his entry into venture capital in a partnership with Arthur Rock starting in 1969. He details the establishment of NEA with his co-founders, his personal investment in Apple Computer, and one of NEA’s earliest investments, 3Com. After noting the rise of the graphical in computing, Kramlich discusses at length his investment and involvement with the Apple Computer spinoff, Forethought Inc., its history, and its development of PowerPoint. The interview concludes with some of his thoughts about his investment in Silicon Graphics, the software industry, NEA’s approach, and collecting video art.",
				"archive": "Computer History Museum",
				"archiveLocation": "X7447.2015",
				"extra": "Catalog Number: 102740039\nCategory: Oral history\nCollection Title: CHM Oral History Collection\nCredit: Computer History Museum",
				"libraryCatalog": "Computer History Museum Archive",
				"place": "Mountain View, California",
				"rights": "Computer History Museum",
				"runningTime": "01:31:00",
				"studio": "Computer History Museum",
				"videoRecordingFormat": "MOV",
				"attachments": [
					{
						"title": "Kramlich, Dick (C. Richard) oral history part 1 of 4",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "3Com"
					},
					{
						"tag": "Apple"
					},
					{
						"tag": "Forethought, Inc."
					},
					{
						"tag": "Graphics"
					},
					{
						"tag": "Kramlich, C. Richard"
					},
					{
						"tag": "Networking"
					},
					{
						"tag": "New Enterprise Associates (NEA)"
					},
					{
						"tag": "PowerPoint"
					},
					{
						"tag": "Rock, Arthur"
					},
					{
						"tag": "Silicon Graphics"
					},
					{
						"tag": "Software"
					},
					{
						"tag": "Venture Capital"
					},
					{
						"tag": "Video Art"
					},
					{
						"tag": "personal computers (PCs)"
					},
					{
						"tag": "software industry"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102645840",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Challenges and Directions in Fault-Tolerant Computing, lecture by Jack Goldberg",
				"creators": [
					{
						"firstName": "Jack",
						"lastName": "Goldberg",
						"creatorType": "contributor"
					}
				],
				"date": "1985-10-02",
				"abstractNote": "Label taped to the video case reads: \"Two decaes of theoritical and experimental work and numerous recent successful applications have established fault tolerance as a standard objective of high speed, satisfaction of fault tolerance requirements cannot be demonstrated by testing alone, but requires formal analysis.  Most of the work in fault tolerance has been concerned with developing effective design techniques.  Recent work on reliabilitymodeling and formal proof of fault tolerant design and implementation is laying a foundation for a more rigorous design discipline.  The scope of concern has also expanded to include any source of computer reliability, such as design mistakes, in software, hardware, or at any system level.  Current art is barely able to keep up with the rapid pace of computer technology, the stresses of new applications and the new expansion in scope of concerns.  Particular challenges lie in coping with the imperfections of the ultrasamll, i.e., high density VLSI, and the ultra-large, i.e., large software systems.  It is clear that fault tolerance cannot be \"added\" to a design and must be integrated with other design objectives.  Simultaneous demands in future systems for high performance, high security, high evolvability and high fault tolerance will require new theoretical models of computer systems and a much closer integration of practical design techniques.  The talk will discuss the widening scope of research into computer dependability.  New issues include tolerance of design errors (including software), operator errors, and the safety of computer-controlled systems.\"",
				"archive": "Computer History Museum",
				"extra": "Catalog Number: 102645840\nPlatform: NTSC VHS VCR\nCategory: Lecture\nSeries Title: Stanford Computer Forum Distinguished Lecture Series",
				"libraryCatalog": "Computer History Museum Archive",
				"place": "Palo Alto, CA, US",
				"studio": "Stanford University. Stanford Computer Forum",
				"videoRecordingFormat": "VHS",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computerhistory.org/collections/catalog/102706809",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Tutorials on software systems design",
				"creators": [],
				"date": "1977-04",
				"abstractNote": "The West Coast Computer Faire was an annual computer industry conference and exposition. The first fair was held in 1977 and was organized by Jim Warren and Bob Relling. At the time, it was the biggest computer show in the world, intended to popularize the peronal computer in the home.\n\nThis first fair took place on April 16-17, 1977, in San Francisco Civic Auditorium and Brooks Hall, and saw the debut of the Commodre PET, presented by Chuck Peddle, and the Apple II, presented by then 21-year-old Steve Jobs and Steve Wozniak. There were about 180 exhibitors, among them Intel, MITS, and Digitial Research. More than 12,000 people visited the fair.\n\nPapers presented during this session:\n\nR. W. Ulrickson, \"Learning to program microcomputers? Here's how\"\nLarry Tesler, \"Home text editing\"\n\nBiographical Notes: Robert Wayne Ulrickson received a B.S.E.E. from MIT (1959) and M.S.E.E. from SJSC (1966).  He was commissioned and served as a Coast Guard officer before working for Lockheed Missiles and Space in Sunnyvale, California, where he designed PCM telemetry systems for satellites.  He joined John Hulme’s Applications Department at Fairchild as supervisor of Systems Engineering where his team defined the 9300 series TTL MSI devices.  Systems Engineering became a part of Robert Schreiner’s Custom Micromatrix Arrays Department at Fairchild R&D in 1968, where Bob was Section Manager in charge of array architecture, test engineering, and computer aided design.  After CMA’s reorganization, Bob served Fairchild as Manager of Systems and Applications Engineering and as Product Marketing manager for Bipolar ICs.  In 1973 Bob joined John Nichols as co-founder and President of Logical Services Incorporated in Santa Clara.  Logical developed hundreds of new products incorporating microprocessors until and after it was acquired by Smartflex Systems in 1998.  Bob retired to Maui in 2000.",
				"archive": "Computer History Museum",
				"archiveLocation": "X2595.2004",
				"audioRecordingFormat": "Standard audio cassette",
				"extra": "Catalog Number: 102706809\nSeries Title: The First West Coast Computer Faire\nCredit: Gift of Jim Warren",
				"label": "Butterfly Media Dimensions",
				"libraryCatalog": "Computer History Museum Archive",
				"place": "San Francisco, CA",
				"attachments": [
					{
						"mimeType": "audio/mpeg",
						"title": "Tutorials on software systems design - Side B"
					},
					{
						"mimeType": "audio/mpeg",
						"title": "Tutorials on software systems design - Side A"
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
		"url": "https://www.computerhistory.org/collections/catalog/102661095",
		"items": [
			{
				"itemType": "book",
				"title": "People's Computer Company; People's Computers; Recreational Computing",
				"creators": [],
				"date": "1972-1981",
				"abstractNote": "Founded in Oct 1972 as a large-format bimonthly newsprint publication called \"People's Computer Company.\" Name changed to \"People's Computers\" beginning with the May-June 1977 issue and the format changed to a more conventional magazine style, albeit with uncoated paper. Name changed again to \"Recreational Computing\" with Jan-Feb 1979 issue with slicker covers and paper. \n\nNote: The print collection has been augmented with scans provided by Bob Zeidman under lot number X6691.2013. Some issues in the collection exist in digital form only.",
				"archive": "Computer History Museum",
				"archiveLocation": "X2595.2004",
				"extra": "Catalog Number: 102661095\nCategory: Periodical\nCredit: Gift of Jim Warren",
				"libraryCatalog": "Computer History Museum Archive",
				"publisher": "People's Computer Company",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 1, no. 1 (Oct 1972)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 1, no. 2 (Dec 1972)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 1, no. 3 (Feb 1973)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 1, no. 4 (Apr 1973)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 1, no. 5 (May 1973)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 1 (Sep 1973)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 2 (Nov 1973)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 3 (Jan 1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "PCC (People's Computer Company) Games (1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 4 (Mar 1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 5 (May 1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 2, no. 6 (Jul 1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 3, no. 1 (Sep 1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 3, no. 2 (1974)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 3, no. 3 (Jan 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 3, no. 4 (Mar 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 3, no. 5 (May 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 1 (Jul 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 2 (Sep 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 3 (Nov 1975)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 4 (Jan 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 5 (Mar-Apr 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 4, no. 6 (May 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 5, no. 1 (Jul 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 5, no. 2 (Aug-Sep 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 5, no. 3 (Nov-Dec 1976)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 5, no. 4 (Jan-Feb 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computer Company, v. 5, no. 5 (Mar-Apr 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 5, no. 6 (May-Jun 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 1 (Jul-Aug 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 2 (Sep-Oct 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 3 (Nov-Dec 1977)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 4 (Jan-Feb 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 5 (Mar-Apr 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 6, no. 6 (May-Jun 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 7, no. 1 (Jul-Aug 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 7, no. 2 (Sep-Oct 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "People's Computers, v. 7, no. 3 (Nov-Dec 1978)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 7, no. 4 (Jan-Feb 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 7, no. 5 (Mar-Apr 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 7, no. 6 (May-Jun 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 1 (Jul-Aug 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 2 (Sep-Oct 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 3 (Nov-Dec 1979)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 4 (Jan-Feb 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 5 (Mar-Apr 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 8, no. 6 (May-Jun 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 1 (Jul-Aug 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 2 (Sep-Oct 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 3 (Nov-Dec 1980)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 4 (Jan-Feb 1981)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 5 (Mar-Apr 1981)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 9, no. 6 (May-June 1981)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 10, no. 1 (Jul-Aug 1981)"
					},
					{
						"mimeType": "application/pdf",
						"title": "Recreational Computing, v. 10, no. 2 (Sep-Oct 1981)"
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
		"url": "https://www.computerhistory.org/collections/catalog/102630889",
		"items": [
			{
				"itemType": "artwork",
				"title": "Apple IIe",
				"creators": [],
				"abstractNote": "Black and white identification photograph of the Apple IIe main terminal including monitor, disk drive and keyboard. appriximately 1/2 inch white border surrounds main image. Background is gray. Computer is sitting on a ledge.",
				"archive": "Computer History Museum",
				"archiveLocation": "X2870.2005",
				"artworkMedium": "Photographic print",
				"artworkSize": "8 x 10 in.",
				"extra": "Catalog Number: 102630889\nCategory: Identification photograph; Publicity photograph\nCredit: Gift of CHM AppleLore",
				"libraryCatalog": "Computer History Museum Archive",
				"rights": "Apple Computer, Inc.",
				"attachments": [
					{
						"title": "Apple IIe",
						"mimeType": "image/png"
					}
				],
				"tags": [
					{
						"tag": "Apple Computer, Inc."
					},
					{
						"tag": "Apple IIe (Computer)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
