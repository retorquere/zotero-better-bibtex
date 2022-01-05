{
	"translatorID": "50a4cf3f-92ef-4e9f-ab15-815229159b16",
	"label": "National Archives of Australia",
	"creator": "Tim Sherratt, Aurimas Vinckevicius",
	"target": "^https?://recordsearch\\.naa\\.gov\\.au/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-02-13 11:39:57"
}

/*
   National Archives of Australia Translator
   Copyright (C) 2011 Tim Sherratt (tim@discontents.com.au, @wragge)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var multiplesRE = /\/(SeriesListing|ItemsListing|PhotoSearchSearchResults|PhotoListing)\.asp/i;
var singleItemRE = /\/(SeriesDetail|ItemDetail|PhotoSearchItemDetail|ViewImage|PhotoDetail)\.asp/i;
function detectWeb(doc, url) {
	// RecordSearch - items and series - or Photosearch results
	if (multiplesRE.test(url)) {
		return getSearchResults(doc, url, true) ? "multiple" : false;
	}
	else if (singleItemRE.test(url)) {
		return "manuscript";
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, url), function (items) {
			if (!items) {
				return;
			}

			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, url, checkOnly) {
	var title,
		link,
		results,
		table,
		items = {},
		found = false;
	var m = url.match(multiplesRE);
	if (!m) return false;

	switch (m[1].toLowerCase()) {
		case 'serieslisting':
			table = doc.getElementsByClassName('SearchResults')[0];
			if (!table) return false;

			results = ZU.xpath(doc, '//table[@class="SearchResults"]//tr[@class!="header"]');
			for (let i = 0; i < results.length; i++) {
				title = results[i].getElementsByTagName('td')[2];
				if (!title) continue;
				link = getCleanLinkFromCell(title);
				if (!link) continue;

				if (checkOnly) return true;
				found = true;
				items[link] = ZU.trimInternal(title.textContent);
			}
			break;
		case 'itemslisting':
			table = doc.getElementsByClassName('SearchResults')[0];
			if (!table) return false;

			results = ZU.xpath(doc, '//table[@class="SearchResults"]//tr[@class!="header"]');
			for (let i = 0; i < results.length; i++) {
				title = results[i].getElementsByTagName('td')[3];
				if (!title) continue;
				link = getCleanLinkFromCell(title);
				if (!link) continue;

				if (checkOnly) return true;
				found = true;
				items[link] = ZU.trimInternal(title.textContent);
			}
			break;
		case 'photolisting':
			// Try the list view first
			results = ZU.xpath(doc, '//table[contains(@id, "PhotoResults")]//table[@class="greyboxdetail"]');
			var view = 'list';
			// If no results try grid view
			if (!results.length) {
				results = ZU.xpath(doc, '//table[contains(@id, "PhotoResults")]/tbody/tr/td[@title]');
				view = 'grid';
			}
			for (let i = 0; i < results.length; i++) {
				if (view == 'list') {
					title = results[i].getElementsByTagName('td')[1];
					if (!title) continue;
					link = getCleanLinkFromCell(title);
					if (!link) continue;
					title = title.textContent;
				}
				else {
					title = results[i].getAttribute('title');
					if (!title) continue;
					link = results[i].getElementsByTagName('a')[0];
					if (!link) continue;
					link = link.href;
				}

				if (checkOnly) return true;
				found = true;
				items[link] = ZU.trimInternal(title);
			}
			break;
	}

	return found ? items : false;
}

function getHost(url) {
	return url.match(/^https?:\/\/[^/]+/)[0];
}

function scrape(doc, url) {
	var m = url.match(singleItemRE);
	if (!m) return;

	var item;
	switch (m[1].toLowerCase()) {
		case 'viewimage':
			item = scrapeImage(doc, url);
			break;
		case 'photosearchitemdetail':
			item = scrapePhoto(doc, url);
			break;
		case 'photodetail':
			item = scrapePhoto(doc, url);
			break;
		case 'seriesdetail':
			item = scrapeSeries(doc, url);
			break;
		case 'itemdetail':
			item = scrapeItem(doc, url);
			break;
		default:
			throw new Error("Unknown page type: " + m[1]);
	}
	if (item) {
		item.archive = item.libraryCatalog = "National Archives of Australia";
		item.complete();
	}
}

function createPersistentLink(id, linkType) {
	// Create persistent (as possible) links into RS
	return 'https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=' + linkType + '&Number=' + id;
}

function stripSeries(series) {
	// Return cleaned contents of series cells, removing the extra notice
	return series.substr(0, series.search(/(Click|All)/));
}

function getCleanLinkFromCell(cell) {
	// Get a url from a cell that has an onclick attribute.
	var link = cell.getAttribute('onclick');
	link = link.substring(link.indexOf("'"));
	return 'https://recordsearch.naa.gov.au/SearchNRetrieve/Interface/' + ZU.superCleanString(link);
}

/**
 * Series/Item scraping
 */

function parseItemTable(table) {
	var meta = {},
		rows = table.getElementsByTagName('tr');
	for (let i = 0; i < rows.length; i++) {
		var td = rows[i].getElementsByTagName('td');
		if (td.length != 2) continue;

		var label = ZU.trimInternal(td[0].textContent).toLowerCase();

		var data;
		if (label == 'series note') {
			// grab the full note, instead of the truncation
			var notes = table.ownerDocument.getElementById('notes');
			if (notes && notes.children.length == 2
				&& (notes = notes.getElementsByTagName('pre')[0])
			) {
				data = notes.textContent;
			}
			else {
				data = ZU.trimInternal(td[1].textContent);
			}
		}
		else if (label == 'related searches') {
			var childrens = td[1].getElementsByTagName('a');
			data = [];
			for (let j = 0; j < childrens.length; j++) {
				data.push(childrens[i].textContent.trim());
			}
		}
		else {
			data = ZU.trimInternal(td[1].textContent);
		}
		if (!label || !data) continue;
		meta[label] = data;
	}

	return meta;
}

function scrapeItem(doc) {
	var meta = parseItemTable(ZU.xpath(doc, '//div[@class="detailsTable"]//tbody')[0]);
	if (!meta) return null;

	var item = new Zotero.Item('manuscript');
	item.title = meta.title;
	item.type = 'item';
	item.date = meta['contents date range'];
	item.place = meta.location;
	var series = stripSeries(meta['series number']);
	var control = meta['control symbol'];
	item.archiveLocation = series + ', ' + control;
	item['access status'] = meta['access status'];
	item['access decision'] = meta['date of decision'];
	var barcode = encodeURIComponent(meta['item id']);
	item.url = createPersistentLink(barcode, 'I');

	if (meta['item notes']) {
		item.notes.push(meta['item notes']);
	}

	// Add link to digital copy if available
	if (ZU.xpath(doc, '//div[contains(@id, "_pnlDigitalCopy")]/a[contains(normalize-space(text()), "View digital copy")]').length) {
		// item.attachments.push({
		//	title: "Digital copy at National Archives of Australia",
		//	url: 'https://recordsearch.naa.gov.au/SearchNRetrieve/Interface/ViewImage.aspx?B=' + barcode,
		//	mimeType: 'text/html',
		//	snapshot: false
		// });
		item.attachments.push({
			title: 'National Archives of Australia item PDF',
			url: 'https://recordsearch.naa.gov.au/SearchNRetrieve/NAAMedia/ViewPDF.aspx?B=' + barcode + '&D=D',
			mimeType: 'application/pdf'
		});
	}

	return item;
}

function scrapeSeries(doc) {
	var meta = parseItemTable(ZU.xpath(doc, '//div[@class="detailsTable"]//tbody')[0]);
	if (!meta) return null;

	var item = new Zotero.Item('manuscript');
	item.title = meta.title;
	item.type = 'series';
	item.date = meta['contents dates'];
	// Split multiple holdings with semi-colon
	if (meta['quantity and location']) {
		item.place = meta['quantity and location'].replace(/([A-Z]{1})([0-9]{1})/g, '$1; $2');
	}
	item.format = meta['predominant physical format'];
	item.abstractNote = meta['series note'];
	item.archiveLocation = meta['series number'];
	item['number of items'] = stripSeries(meta['items in this series on recordsearch']);
	var seriesNumber = encodeURIComponent(meta['series number']);
	item.url = createPersistentLink(seriesNumber, 'S');

	// Agencies recording into this series
	var agencies = ZU.xpath(doc, '//div[@id="provenanceRecording"]//div[@class="linkagesInfo"]');
	for (let i = 0; i < agencies.length; i++) {
		item.creators.push({
			lastName: ZU.trimInternal(agencies[i].textContent),
			creatorType: "author",
			fieldMode: 1
		});
	}

	return item;
}

/**
 * ViewImage
 */

function getImageField(doc, label) {
	label = 'lbl' + label;
	var data = doc.getElementById(label);
	if (!data) return '';

	return ZU.trimInternal(data.textContent);
}

function scrapeImage(doc, url) {
	var image = doc.getElementById('divImage'),
		singleView = image && image.offsetParent; // check if visble

	var total = doc.getElementsByName('hTotalPages')[0],
		page = doc.getElementsByName('hCurrentPage')[0];
	page = page && Number.parseInt(page.value);
	total = total && Number.parseInt(total.value);

	var item = new Zotero.Item('manuscript');

	item.title = getImageField(doc, 'Title');
	if (singleView && page && total != 1) {
		item.title += ' [' + page + (total ? ' of ' + total : '') + ']';
	}

	item.date = getImageField(doc, 'ContentsDate');
	item.archiveLocation = getImageField(doc, 'Series') + ', ' + getImageField(doc, 'ControlSymbol');

	var barcode = getImageField(doc, 'Barcode');
	item.url = getHost(url) + '/SearchNRetrieve/Interface/ViewImage.aspx?'
		+ 'B=' + encodeURIComponent(barcode)
		+ (singleView ? '&S=' + page : '');

	var imageUrlBase = '/SearchNRetrieve/NAAMedia/ShowImage.aspx?T=P&B=' + encodeURIComponent(barcode);
	// In single view, save current image. In multiples view, save all
	// (unless more than 10, then don't save at all)
	if ((singleView && page) || (!singleView && total && total < 11)) {
		var from = singleView ? page - 1 : 0, to = singleView ? page : total;
		// var includeCount = total != 1;

		for (let i = from; i < to; i++) {
			item.attachments.push({
				title: 'Folio'
					+ (total != 1
						? ' ' + (i + 1) + (total ? ' of ' + total : '')
						: '')
					+ ' [' + item.archiveLocation + ']',
				url: imageUrlBase + '&S=' + page,
				mimeType: 'image/jpeg'
			});
		}
	}

	return item;
}

/*
 * PhotoSearch
 */

function scrapePhoto(doc) {
	var table = ZU.xpath(doc, '//table[contains(@id, "PhotoDetailTable")]//table[contains(@id, "GreyBoxTable")]/tbody')[0];
	if (!table) return null;

	var meta = parseItemTable(table);
	var item = new Zotero.Item('manuscript');
	item.title = meta.title;
	item.type = 'photograph';
	item.date = meta.date || meta['date range'];
	item.place = meta.location || meta['item location'];
	item.archiveLocation = meta['series/control symbol'];
	item.url = createPersistentLink(encodeURIComponent(meta['item id']), 'PSI');

	if (meta['related searches']) {
		item.tags = meta['related searches'];
	}

	var imageurl = ZU.xpathText(doc, '//table[contains(@id, "PhotoDetailTable")]//img/@src');
	if (imageurl) {
		imageurl = imageurl.replace(/([?&])T=[^&]*(?:&|$)/g, '$1') + '&T=P'; // T=P better quality
		item.attachments.push({
			title: 'Digital image of NAA: ' + item.archiveLocation,
			url: imageurl,
			mimeType: 'image/jpeg' // Seems like that is generally the case
		});
	}

	return item;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://recordsearch.naa.gov.au/SearchNRetrieve/Interface/ViewImage.aspx?B=12048&S=4",
		"defer": true,
		"items": [
			{
				"itemType": "manuscript",
				"title": "Carl Gustav Opitz - Naturalization [4 of 7]",
				"creators": [],
				"date": "1911 - 1912",
				"archive": "National Archives of Australia",
				"archiveLocation": "A1, 1911/18393",
				"libraryCatalog": "National Archives of Australia",
				"url": "https://recordsearch.naa.gov.au/SearchNRetrieve/Interface/ViewImage.aspx?B=12048&S=4",
				"attachments": [
					{
						"title": "Folio 4 of 7 [A1, 1911/18393]",
						"mimeType": "image/jpeg"
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
		"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=PSI&Number=11404473",
		"defer": true,
		"items": [
			{
				"itemType": "manuscript",
				"title": "Antarctica - A Gentoo penguin on Heard Island guards its nesting mate [photographic image]. 1 photographic negative: b&w, acetate",
				"creators": [],
				"date": "1949 - 1949",
				"archive": "National Archives of Australia",
				"archiveLocation": "A1200, L11912",
				"libraryCatalog": "National Archives of Australia",
				"manuscriptType": "photograph",
				"place": "Canberra",
				"shortTitle": "Antarctica - A Gentoo penguin on Heard Island guards its nesting mate [photographic image]. 1 photographic negative",
				"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=PSI&Number=11404473",
				"attachments": [
					{
						"title": "Digital image of NAA: A1200, L11912",
						"mimeType": "image/jpeg"
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
		"defer": true,
		"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=I&Number=149309",
		"items": [
			{
				"itemType": "manuscript",
				"title": "The Wragge Estate. Property for sale.",
				"creators": [],
				"date": "1917 - 1917",
				"archive": "National Archives of Australia",
				"archiveLocation": "A2479, 17/1306",
				"libraryCatalog": "National Archives of Australia",
				"manuscriptType": "item",
				"place": "Canberra",
				"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=I&Number=149309",
				"attachments": [
					{
						"title": "National Archives of Australia item PDF",
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
		"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=S&Number=A2",
		"defer": true,
		"items": [
			{
				"itemType": "manuscript",
				"title": "Correspondence files, annual single number series",
				"creators": [
					{
						"lastName": "CA 588, Prime Minister's Office",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "CA 12, Prime Minister's Department",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "01 Jan 1895 - 31 Dec 1926",
				"abstractNote": "Name Index Volumes, 1917-1951 (ex CP 602/1, AS12/8)",
				"archive": "National Archives of Australia",
				"archiveLocation": "A2",
				"libraryCatalog": "National Archives of Australia",
				"manuscriptType": "series",
				"place": "35.74 metres held in ACT",
				"url": "https://recordsearch.naa.gov.au/scripts/AutoSearch.asp?O=S&Number=A2",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
