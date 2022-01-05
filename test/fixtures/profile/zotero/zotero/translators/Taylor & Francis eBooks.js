{
	"translatorID": "71f28f90-764a-42a8-8107-d87252da9b50",
	"translatorType": 4,
	"label": "Taylor & Francis eBooks",
	"creator": "Abe Jellinek",
	"target": "^https?://(www\\.)?taylorfrancis\\.com/(books|chapters|search)",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-28 02:50:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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

const FIELDS = {
	Edition: 'edition',
	'First Published': 'date',
	'eBook Published': 'date',
	Imprint: 'publisher',
	Pages: 'numPages',
	DOI: 'extra',
	'eBook ISBN': 'ISBN',
	'Pub. Location': 'place'
};

function detectWeb(doc, url) {
	if (url.includes('/chapters/')) {
		return "bookSection";
	}
	if (url.includes('/books/')) {
		return "book";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('search-results-product > a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(text(row, 'h1'));
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	let itemType = detectWeb(doc, url);
	if (itemType == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url, itemType);
	}
}

function scrape(doc, url, itemType) {
	if (!itemType) {
		itemType = detectWeb(doc, url);
	}

	let item = new Zotero.Item(itemType);
	item.title = text(doc, 'h1.product-banner-title');
	item.libraryCatalog = '';
	item.extra = '';
	let subtitle = text(doc, '.product-banner-subtitle');
	if (subtitle) {
		item.title += ": " + subtitle;
	}
	if (itemType == 'bookSection') {
		item.bookTitle = text(doc, 'a.product-book-link');
	}
	
	for (let creator of text(doc, '.product-banner-author-name').split(", ")) {
		let creatorType = text(doc, '.product-banner-author').includes('Edited')
			? 'editor'
			: 'author';
		item.creators.push(ZU.cleanAuthor(creator, creatorType, false));
	}
	
	for (let row of doc.querySelectorAll('product-more-details .display-row')) {
		let label = text(row, 'span:first-child');
		let value = text(row, 'span:last-child');

		let field = FIELDS[label];
		if (field) {
			if (field == 'extra') {
				if (label == "DOI") {
					value = ZU.cleanDOI(value);
				}
				item.extra += `${label}: ${value}\n`;
			}
			else if (field == 'edition') {
				item[field] = cleanEdition(value);
			}
			else if (field == 'date') {
				item[field] = ZU.strToISO(value);
			}
			else {
				item[field] = value;
			}
		}
	}
	
	item.abstractNote = text(doc, '#collapseContent');

	if (doc.cookie) {
		let apiId = JSON.parse(
			doc.getElementById('pyramid-website-ssr-state').textContent
				.replace(/&q;/g, '"')
		).product._id;
		
		let tokenRow = doc.cookie
			.split('; ')
			.find(row => row.startsWith('_token='));
		if (!tokenRow) {
			// in order to pull a PDF, the user has to have visited the site in
			// their browser before. it sets a token cookie client-side.
			// it's alright if we can't find it - we just bail out early without
			// getting the PDF.
			item.complete();
			return;
		}
		let token = tokenRow.split('=')[1];
		
		ZU.doGet(`https://api.taylorfrancis.com/v4/content/${apiId}?apiVersion=4.0.1&filenamePrefix=${item.ISBN}&render=false`,
			function (respText, xhr) {
				// the request might fail if we don't have PDF access
				// but that's alright, everything else worked
				// so we treat every status as a success (last arg to doGet)
				// but only try to fetch the attachment if we got 200 OK
				
				if (xhr.status == 200) {
					let resp = JSON.parse(respText);
					for (let contentObject of resp) {
						if (contentObject.type == 'webpdf'
							|| contentObject.type == 'chapterpdf') {
							item.attachments.push({
								title: "Full Text PDF",
								mimeType: "application/pdf",
								url: contentObject.location
							});
							break;
						}
					}
				}
				
				item.complete();
			}, null, null, { Authorization: 'idtoken ' + token }, false);
	}
	else {
		item.complete();
	}
}

function cleanEdition(text) {
	const ordinals = {
		first: "1",
		second: "2",
		third: "3",
		fourth: "4",
		fifth: "5",
		sixth: "6",
		seventh: "7",
		eighth: "8",
		ninth: "9",
		tenth: "10"
	};
	
	text = ZU.trimInternal(text);
	// this somewhat complicated regex tries to isolate the number (spelled out
	// or not) and make sure that it isn't followed by any extra info
	let matches = text
		.match(/^(?:(?:([0-9]+)(?:st|nd|rd|th)?)|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth))(?:\s?ed?\.?|\sedition)?$/i);
	if (matches) {
		let edition = matches[1] || matches[2];
		edition = ordinals[edition.toLowerCase()] || edition;
		return edition == "1" ? null : edition;
	}
	else {
		return text;
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.taylorfrancis.com/books/edit/10.1201/9781315120621/lubricant-additives-leslie-rudnick",
		"items": [
			{
				"itemType": "book",
				"title": "Lubricant Additives: Chemistry and Applications",
				"creators": [
					{
						"firstName": "Leslie R.",
						"lastName": "Rudnick",
						"creatorType": "editor"
					}
				],
				"date": "2017-06-29",
				"ISBN": "9781315120621",
				"abstractNote": "This indispensable book describes lubricant additives, their synthesis, chemistry, and mode of action. All important areas of application are covered, detailing which lubricants are needed for a particular application. Laboratory and field performance data for each application is provided and the design of cost-effective, environmentally friendly technologies is fully explored. This edition includes new chapters on chlorohydrocarbons, foaming chemistry and physics, antifoams for nonaqueous lubricants, hydrogenated styrene–diene viscosity modifiers, alkylated aromatics, and the impact of REACh and GHS on the lubricant industry.",
				"edition": "3",
				"extra": "DOI: 10.1201/9781315120621",
				"numPages": "722",
				"place": "Boca Raton",
				"publisher": "CRC Press",
				"shortTitle": "Lubricant Additives",
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
		"url": "https://www.taylorfrancis.com/books/mono/10.1201/9781003009085/application-nanomaterials-chemical-sensors-biosensors-jayeeta-chattopadhyay-nimmy-srivastava",
		"items": [
			{
				"itemType": "book",
				"title": "Application of Nanomaterials in Chemical Sensors and Biosensors",
				"creators": [
					{
						"firstName": "Jayeeta",
						"lastName": "Chattopadhyay",
						"creatorType": "author"
					},
					{
						"firstName": "Nimmy",
						"lastName": "Srivastava",
						"creatorType": "author"
					}
				],
				"date": "2021-07-23",
				"ISBN": "9781003009085",
				"abstractNote": "Recent advances in nanotechnology has led the nanomaterials into the realm of sensing applications. This descriptive book utilizes a multi-disciplinary approach to provide extensive information about sensors and elucidates the impact of nanotechnology on development of chemical and biosensors for diversified applications. The main focus of this book is not only the inclusion of various research works, which have already been reported in literature, but also to make a potential conclusion about the mechanism behind this. This book will serve as an invaluable tool for both frontline researchers and academicians to work towards the future development of nanotechnology in sensing devices.",
				"extra": "DOI: 10.1201/9781003009085",
				"numPages": "174",
				"place": "Boca Raton",
				"publisher": "CRC Press",
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
		"url": "https://www.taylorfrancis.com/chapters/mono/10.1201/9781003009085-3/nanomaterials-heavy-metal-sensors-water-jayeeta-chattopadhyay-nimmy-srivastava",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Nanomaterials as Heavy Metal Sensors in Water",
				"creators": [
					{
						"firstName": "Jayeeta",
						"lastName": "Chattopadhyay",
						"creatorType": "author"
					},
					{
						"firstName": "Nimmy",
						"lastName": "Srivastava",
						"creatorType": "author"
					}
				],
				"date": "2021",
				"ISBN": "9781003009085",
				"abstractNote": "The major environmental threats to human beings are being introduced through heavy metal ions generation, which can be biodegraded easily. Primarily, heavy metals are released in an anthropogenic way into the natural waters, which further cause a global epidemic through the release of wastewater, river water, tap water, soil, food and many organisms. Chemical sensors have become very popular in on-site detection of multiple heavy metals, especially nanomaterials-based sensors create huge attention due to their large surface area, high catalytic efficiency, greater adsorption capacity and high surface reactivity. This chapter mainly emphasizes the electrochemical sensors, fluorescent sensors, surface-enhanced Raman spectroscopy sensors, plasmonic sensors, etc. Carbon nanomaterials have become extremely popular as electrochemical sensors in the detection of heavy metals in the form of carbon nanotubes, graphene, graphene oxide and carbon nanofibers.",
				"bookTitle": "Application of Nanomaterials in Chemical Sensors and Biosensors",
				"publisher": "CRC Press",
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
		"url": "https://www.taylorfrancis.com/search?key=california",
		"items": "multiple"
	}
]
/** END TEST CASES **/
