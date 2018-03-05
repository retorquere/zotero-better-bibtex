{
	"translatorID": "d71e9b6d-2baa-44ed-acb4-13fe2fe592c0",
	"label": "Google Patents",
	"creator": "Adam Crymble, Avram Lyon",
	"target": "^https?://(www\\.)?google\\.[^/]+/(patents|[^/]*[&?#]tbm=pts)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-21 18:59:28"
}

function detectWeb(doc, url) {
	if (!doc.getElementsByTagName("body")[0].hasChildNodes()) return;

	if (getSearchResults(doc).length) {
		return "multiple";
	} else if(getScraper(doc)) {
		return "patent";
	}
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@id="ires"]//div[@class="g"]//h3/a');
}

function fixAuthorCase(name) {
	if(name.toUpperCase() == name) {
		return ZU.capitalizeTitle(name, true).replace(/\sa(\.?)\s/,' A$1 ');
	} else {
		return name;
	}
}

var scrapers = [
	//U.S. (?) patent page. E.g. http://www.google.com/patents/US20090289560
	{
		getBoxes: function(doc) {
			return ZU.xpath(doc, '(//div[@class="patent_bibdata"]//*[./b]|//div[@class="patent_bibdata"][./b])');
		},
		detect: function(doc) {
			return this.getBoxes(doc).length;
		},
		fieldMap: {
			'PATENT NUMBER': 'patentNumber',
			'FILING DATE': 'filingDate',
			'ISSUE DATE': 'date',
			'APPLICATION NUMBER': 'applicationNumber',
			'ORIGINAL ASSIGNEE': 'assignee',
			'INVENTORS': 'creators',
			'INVENTOR': 'creators',
			'CURRENT U.S. CLASSIFICATION': 'extra/U.S. Classification',
			'INTERNATIONAL CLASSIFICATION': 'extra/International Classification'
		/*	'PRIMARY EXAMINER':
			'SECONDARY EXAMINER':
			'ATTORNEY':
			'ATTORNEYS':
		*/
		},
		addField: function(fields, label, value) {
			if(!value.length) return;
			var zField = this.fieldMap[label];
			if(value.length && zField) {
				zField = zField.split('/');
				switch(zField[0]) {
					case 'creators':
						if(!fields.creators) fields.creators = [];
						fields.creators = fields.creators.concat(value);
					break;
					case 'extra':
						if(fields.extra) fields.extra += '\n';
						else fields.extra = '';

						if(zField[1]) fields.extra += zField[1] + ': ';
						fields.extra += value.join('; ');
					break;
					default:
						if(fields[zField[0]]) return;	//do not overwrite previous fields
						fields[zField[0]] = value.join('; ');
				}
			}
		},
		addValue: function(label, value, node) {
			switch(label) {
				case 'PATENT NUMBER':
				case 'FILING DATE':
				case 'ISSUE DATE':
				case 'APPLICATION NUMBER':
				case 'PRIMARY EXAMINER':
				case 'SECONDARY EXAMINER':
					value[0] = node.textContent.trim().replace(/^:\s*/,'');
				break;
				case 'ATTORNEY':
				case 'ATTORNEYS':
					value = value.concat(
						fixAuthorCase(
							node.textContent.trim()
									.replace(/^:\s*/,'')
						).split(/\s*,\s*(?=\S)(?!(?:LLC|LLP|Esq)\b)/i));
				break;
				case 'ORIGINAL ASSIGNEE':
					if(node.nodeName.toUpperCase() != 'A') break;
					value[0] = fixAuthorCase(node.textContent.trim());
				break;
				case 'INVENTORS':
				case 'INVENTOR':
					if(node.nodeName.toUpperCase() != 'A') break;
					var name = node.textContent.trim().split(/\s*,\s*/);	//look for suffix
					var inv = ZU.cleanAuthor(fixAuthorCase(name[0]), 'inventor');
					if(name[1]) {	//re-add suffix if we had one
						inv.firstName += ', ' + name[1];
					}
					value.push(inv);
				break;
				case 'CURRENT U.S. CLASSIFICATION':
					if(node.nodeName.toUpperCase() != 'A') break;
					value.push(node.textContent.trim());
				break;
				case 'INTERNATIONAL CLASSIFICATION':
					value = value.concat(node.textContent.trim()
									.replace(/^:\s*/,'')
									.split(/\s*;\s*/));
				break;
			}
			return value;
		},
		getMetadata: function(doc) {
			var fieldBoxes = this.getBoxes(doc);
			var fields = {};
			for(var i=0, n=fieldBoxes.length; i<n; i++) {
				//within each box, the fields are labeled in bold and separated by a <br/>
				var box = fieldBoxes[i];
				var node = box.firstChild;
				var label, value = [];
				while(node) {
					switch(node.nodeName.toUpperCase()) {
						case 'B':
							if(!label) {
								label = node.textContent.trim().toUpperCase();
							} else {
								value = this.addValue(label, value, node);
							}
						break;
						case 'BR':
							if(label) {
								if(value.length) {
									this.addField(fields, label, value);
								}
								label = undefined;
								value = [];
							}
						break;
						default:
							if(!label) break;
							value = this.addValue(label, value, node);
					}
					node = node.nextSibling;
				}
				if(label && value.length) {
					this.addField(fields, label, value);
				}
			}

			//add some other fields
			fields.abstractNote = ZU.xpathText(doc, '//p[@class="patent_abstract_text"]');
			fields.title = ZU.xpathText(doc, '//h1[@class="gb-volume-title"]');
			if(fields.title.toUpperCase() == fields.title) {
				fields.title = ZU.capitalizeTitle(fields.title, true);
			}
			if(fields.extra && fields.extra.indexOf('U.S. Classification') != -1) {
				fields.country = "United States";
			}

			var url = doc.location.href;
			fields.url = 'http://' + doc.location.host + doc.location.pathname;
			var m;
			if(m = url.match(/[?&](id=[^&]+)/)) fields.url += '?' + m[1];
			Z.debug(fields.url)
			fields.attachments = [
				{
					url: ZU.xpathText(doc, '//a[@id="appbar-download-pdf-link"]/@href'),
					title: "Google Patents PDF",
					mimeType: "application/pdf"
				}
			];
			return fields;
		}
	},
	//European (?) patent page. E.g. http://www.google.com/patents/EP0011951A1
	{
		detect: function(doc) { return this.getRows(doc).length; },
		getRows: function(doc) {
			return ZU.xpath(doc, '//table[contains(@class,"patent-bibdata")]//tr[not(@class) or @class="" or @class="patent-bibdata-list-row "][./td[@class="patent-bibdata-heading"]]');
		},
		getMetadata: function(doc) {
			var rows = this.getRows(doc);
			var label, values, zField;
			var fields = {};
			for(var i=0, n=rows.length; i<n; i++) {
				label = ZU.xpathText(rows[i], './td[@class="patent-bibdata-heading"]');
				values = ZU.xpath(rows[i], './td[@class="single-patent-bibdata"]|.//div[@class="patent-bibdata-value"]|.//span[@class="patent-bibdata-value"]');
				//Z.debug(label)
				//Z.debug(values[0].textContent)
				if(!values.length) continue;
				//Z.debug("European")
				switch(label.trim().toUpperCase()) {
					case 'PUBLICATION NUMBER':
						if(!zField) zField = 'patentNumber';
					case 'PUBLICATION DATE':
						if(!zField) zField = 'date';
					case 'FILING DATE':
						if(!zField) zField = 'filingDate';
					case 'APPLICANT':
					case 'ASSIGNEE':
					case 'ORIGINAL ASSIGNEE':
						if(!zField) zField = 'assignee';
						fields[zField] = values[0].textContent.trim();
					break;
					//case 'PRIORITY DATE':
					//case 'ALSO PUBLISHED AS':
					case 'INVENTORS':
						fields.creators = [];
						for(var j=0, m=values.length; j<m; j++) {
							fields.creators.push(
								ZU.cleanAuthor(values[j].textContent.trim(), 'inventor')
							);
						}
					break;
					case 'INTERNATIONAL CLASSIFICATION':
						if(!zField) zField = 'International Classification';
					case 'EUROPEAN CLASSIFICATION':
						if(!zField) zField = 'U.S. Classification';

						if(fields.extra) fields.extra += '\n';
						else fields.extra = '';

						fields.extra += zField + ': '
							+ values.map(function(v) { 
									return v.textContent.trim();
								}).join('; ');
					break;
					default:
				}
				zField = undefined;
			}
			
			//add other data
			fields.title = ZU.xpathText(doc, '//span[@class="patent-title"]');
			var abs = ZU.xpath(doc, '//div[@class="abstract"]|//p[@class="abstract"]');
			fields.abstractNote = '';
			for(var i=0, n=abs.length; i<n; i++) {
				fields.abstractNote += ZU.trimInternal(abs[i].textContent) + '\n';
			}
			fields.abstractNote = fields.abstractNote.trim();
			fields.url = 'http://' + doc.location.host + doc.location.pathname;
			// Below seems to no longer be necessry. There used to be /about?id=XXXX
			// pages that now simply redirect to the /XXXX URL, but we'll leave it for now
			var m, url = doc.location.href;
			if(m = url.match(/[?&](id=[^&]+)/)) fields.url += '?' + m[1];

			if(fields.patentNumber && fields.patentNumber.indexOf('EP') === 0) {
				fields.country = 'European Union';
			} else if(fields.patentNumber && fields.patentNumber.indexOf('US') === 0) {
				fields.country = 'United States';
				//looks like only US patents have PDFs
				//the api works for all versions of the page
				var pdfurl = doc.location.href.replace(/[\?#].+/, "").replace(/.+\//, "http://patentimages.storage.googleapis.com/pdfs/") + ".pdf"
				//var pdfurl = "http://patentimages.storage.googleapis.com/pdfs/" + fields.patentNumber + ".pdf"
				fields.attachments = [
					{
						url: pdfurl,
						title: "Google Patents PDF",
						mimeType: "application/pdf"
					}
				];
			}
			if(!fields.extra){
				//classifications are at the bottom of the page in modern outline.
				var classification = ZU.xpath(doc, '//div[a[@id="classifications"]]//tbody/tr[td[contains(@class, "patent-data-table")]]')
				var classificationArray = [];
				for (i in classification){
					classificationArray.push(ZU.xpathText(classification[i], './td[contains(@class, "patent-data-table")][1]') + " " 
					+ ZU.xpathText(classification[i], './td[contains(@class, "patent-data-table")][2]'));
				}
				if(classificationArray) fields.extra = classificationArray.join("; ")
			}
					
			return fields;
		}
	}
];

function getScraper(doc) {
	for(var i=0, n=scrapers.length; i<n; i++) {
		if(scrapers[i].detect(doc)) return scrapers[i];
	}
}

function scrape(doc) {
	var scraper = getScraper(doc);

	if(!scraper) return;

	//go through all the fields and add them to an item
	var item = new Zotero.Item("patent");

	var fields = scraper.getMetadata(doc);
	var f;
	for(f in fields) {
		item[f] = fields[f];
	}

	item.complete();
}

//Fix url so it leads us to the right page
function fixUrl(url) {
	if (url.match(/printsec=|v=onepage|v=thumbnail|google\.(?!com\/)|[&?]hl=(?!en)(?:&|$)/)) {
		var id;
		var cLang = url.match(/[&?#]cl=([^&#]+)/);	//content language
		var cleanUrl = url.replace(/[#?].*/, '')
			+ '?hl=en'		//interface language
			+ (cLang?'&cl=' + cLang[1]:'');	//content language

		//patent pages directly navigated to from search results have the id somewhere in the URL
		if (id = url.match(/[&?#]id=([^&#]+)/)) {
			cleanUrl += '&id=' + id[1];
		}
		return cleanUrl;
	}
	return url;
}

function doWeb(doc, url) {
	var host = 'http://' + doc.location.host + "/";

	if (detectWeb(doc, url) == "multiple") {
		var res = getSearchResults(doc);
		var items = {};
		for (var i=0, n=res.length; i<n; i++) {
			items[fixUrl(res[i].href)] = res[i].textContent;
		}

		Zotero.selectItems(items, function (items) {
			if(!items) return true;

			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		var newurl = fixUrl(url);
		if(newurl != url) {
			ZU.processDocuments(newurl, scrape)
		} else {
			scrape(doc, url);
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.google.com/search?tbm=pts&tbo=1&hl=en&q=book&btnG=Search+Patents",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.google.com/patents/US1065211",
		"items": [
			{
				"itemType": "patent",
				"title": "Bottle-stopper.",
				"creators": [
					{
						"firstName": "William T.",
						"lastName": "Brook",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Jun 17, 1913",
				"assignee": "William T Brook",
				"country": "United States",
				"extra": "U.S. Classification 215/273; Cooperative Classification B01L3/5021, B65D39/04",
				"filingDate": "Aug 3, 1912",
				"patentNumber": "US1065211 A",
				"url": "http://www.google.com/patents/US1065211",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US1120656",
		"items": [
			{
				"itemType": "patent",
				"title": "Push-pin.",
				"creators": [
					{
						"firstName": "Jonathan A.",
						"lastName": "Hunt",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Dec 8, 1914",
				"assignee": "Hunt Specialty Mfg Company",
				"country": "United States",
				"extra": "U.S. Classification 411/477, 24/711.4; Cooperative Classification F16B15/00",
				"filingDate": "Jan 14, 1914",
				"patentNumber": "US1120656 A",
				"url": "http://www.google.com/patents/US1120656",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.fr/patents/US7123498?hl=fr",
		"items": [
			{
				"itemType": "patent",
				"title": "Non-volatile memory device",
				"creators": [
					{
						"firstName": "Hisatada",
						"lastName": "Miyatake",
						"creatorType": "inventor"
					},
					{
						"firstName": "Kohki",
						"lastName": "Noda",
						"creatorType": "inventor"
					},
					{
						"firstName": "Toshio",
						"lastName": "Sunaga",
						"creatorType": "inventor"
					},
					{
						"firstName": "Hiroshi",
						"lastName": "Umezaki",
						"creatorType": "inventor"
					},
					{
						"firstName": "Hideo",
						"lastName": "Asano",
						"creatorType": "inventor"
					},
					{
						"firstName": "Koji",
						"lastName": "Kitamura",
						"creatorType": "inventor"
					}
				],
				"issueDate": "17 Oct 2006",
				"abstractNote": "MRAM has read word lines WLR and write word line WLW extending in the y direction, write/read bit line BLW/R and write bit line BLW extending in the x direction, and the memory cells MC disposed at the points of the intersection of these lines. The memory MC includes sub-cells SC1 and SC2. The sub-cell SC1 includes magneto resistive elements MTJ1 and MTJ2 and a selection transistor Tr1, and the sub-cell SC2 includes magneto resistive elements MTJ3 and MTJ4 and a selection transistor Tr2. The magneto resistive elements MTJ1 and MTJ2 are connected in parallel, and the magneto resistive elements MTJ3 and MTJ4 are also connected in parallel. Further, the sub-cells SC1 and SC2 are connected in series between the write/read bit line BLW/R and the ground.",
				"assignee": "International Business Machines Corporation",
				"country": "United States",
				"extra": "U.S. Classification 365/63, 365/97, 365/158, 365/100, 365/33, 365/46, 365/66, 365/55; International Classification H01L21/8246, H01L43/08, G11C11/14, G11C11/15, H01L27/105, G11C11/16, G11C5/06; Cooperative Classification G11C11/16; European Classification G11C11/16",
				"filingDate": "12 Oct 2004",
				"patentNumber": "US7123498 B2",
				"url": "http://www.google.fr/patents/US7123498",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US4390992#v=onepage&q&f=false",
		"items": [
			{
				"itemType": "patent",
				"title": "Plasma channel optical pumping device and method",
				"creators": [
					{
						"firstName": "O'Dean P.",
						"lastName": "Judd",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Jun 28, 1983",
				"abstractNote": "A device and method for optically pumping a gaseous laser using blackbody radiation produced by a plasma channel which is formed from an electrical discharge between two electrodes spaced at opposite longitudinal ends of the laser. A preionization device which can comprise a laser or electron beam accelerator produces a preionization beam which is sufficient to cause an electrical discharge between the electrodes to initiate the plasma channel along the preionization path. The optical pumping energy is supplied by a high voltage power supply rather than by the preionization beam. High output optical intensities are produced by the laser due to the high temperature blackbody radiation produced by the plasma channel, in the same manner as an exploding wire type laser. However, unlike the exploding wire type laser, the disclosed invention can be operated in a repetitive manner by utilizing a repetitive pulsed preionization device.",
				"assignee": "The United States Of America As Represented By The United States Department Of Energy",
				"country": "United States",
				"extra": "U.S. Classification 372/70, 372/78; International Classification H01S3/091; Cooperative Classification H01S3/091; European Classification H01S3/091",
				"filingDate": "Jul 17, 1981",
				"patentNumber": "US4390992 A",
				"url": "http://www.google.com/patents/US4390992",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.fr/#q=ordinateur&hl=fr&prmd=imvns&source=lnms&tbm=pts&sa=X&ei=oJJfUJKgBOiU2gWqwIHYCg&ved=0CBIQ_AUoBQ&tbo=1&prmdo=1&bav=on.2,or.r_gc.r_pw.r_qf.&fp=ec5bd0c9391b4cc0&biw=1024&bih=589",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.google.com/patents/EP1808414A1?cl=en&dq=water&hl=en&sa=X&ei=fLS-UL-FIcTY2gXcg4CABw&ved=0CDcQ6AEwAQ",
		"items": [
			{
				"itemType": "patent",
				"title": "Device for recycling sanitary water",
				"creators": [
					{
						"firstName": "Michel",
						"lastName": "Billon",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Jul 18, 2007",
				"abstractNote": "The installation for recycling used water originating from sanitary equipment and re-use of water for rinsing a water closet bowl, comprises a control system having an electronic terminal with a micro controller, and an additional drain to pour an overflow of a tank directly in an evacuation pipe of the water closet bowl. The water closet bowl is equipped with a flush water saver system, which surmounts the bowl. The saver system comprises tank (3) with a water reserve, and a water-flushing device placed in the tank to supply the flush water to the water closet bowl. The installation for recycling used water originating from sanitary equipment and re-use of water for rinsing a water closet bowl, comprises a control system having an electronic terminal with a micro controller, and an additional drain to pour an overflow of a tank directly in an evacuation pipe of the water closet bowl. The water closet bowl is equipped with a flush water saver system, which surmounts the bowl. The saver system comprises tank (3) with a water reserve, and a water-flushing device placed in the tank to supply the flush water to the water closet bowl, water supply pipes, a filter and a raising pump are arranged in one of the pipes, a water level detector to control the water reserve level contained in the tank, and a flapper valve to control the arrival of running water. The flapper valve is normally closed and temporarily opened when quantity of water contained in the tank is lower than a predetermined quantity detected by the detector. The water-flushing device comprises a drain valve (25A) with a vertical actuation inside a flow regulation tube, which extends on all the height of the tank and communicates with the rest of the tank by openings in lateral surface of the tube. The drain valve is operated automatically by a motor reducer, which is connected to the valve by a rod and a chain. The drain valve is equipped with a cam and limit switch. The level detector comprises a probe connected to the flapper valve. One of the water supply pipes comprises a flow regulator in which the pipe is bent so as to present an outlet opening in the bottom of the tank. The sanitary equipment generates used water comprises bathtub, shower and/or washbasin. The capacity of the tank is higher than 150 liters. The used water path is traversed between the sanitary equipment and the tank. The filter is placed in an upstream of the pump. The filter comprises a basket filter for a coarse filtration, a float sensor and reed contact, and an outlet towards the overflow discharge. The basket filter contains a solid preference product for the used water treatment, which dissolves gradually during draining by sanitary equipment. The raising pump is equipped with a plunger of automatic startup when water is reached a predetermined level, a non-return valve, and a venting device. The control system comprises a device to regulate/modify the volume of water supplied by the actuation of the flushing water, and a device to- control the flow of the water in the tank, and check and display the electronic installation, the pump and the filter. The terminal comprises display board e.g. liquid crystals, which allows message display. The control system is programmed to operate the actuator periodically in the drain valve. Another water supply pipe in the tank is connected by an upstream of the flapper valve with a rainwater collection device. The water closet bowl is connected to a forced ventilation device.",
				"assignee": "Michel Billon",
				"country": "European Union",
				"extra": "International Classification C02F1/00; Cooperative Classification E03D5/006, C02F2209/42, E03B2001/045, C02F2103/002, C02F2209/005, E03B2001/047, E03B1/042, E03B1/04, E03D5/003; European Classification E03B1/04B2, E03D5/00B1, E03B1/04, E03D5/00B",
				"filingDate": "Jan 16, 2006",
				"patentNumber": "EP1808414 A1",
				"url": "http://www.google.com/patents/EP1808414A1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.google.com/patents/EP0011951A1?dq=water&ei=fLS-UL-FIcTY2gXcg4CABw&cl=en",
		"items": [
			{
				"itemType": "patent",
				"title": "Cold-water soluble tamarind gum, process for its preparation and its application in sizing textile warp",
				"creators": [
					{
						"firstName": "Joseph S.",
						"lastName": "Racciato",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Jun 11, 1980",
				"abstractNote": "A novel composition of crude tamarind kernel powder (TKP) is disclosed. The novel composition results from a process which makes TKP soluble in cold water; this process is not dependent on purification of TKP, but involves dissolving it in hot water and evaporating the resulting solution. The novel TKP composition has utility in textile, paper, and oilfield applications.",
				"assignee": "Merck & Co., Inc.",
				"country": "European Union",
				"extra": "International Classification D06M15/01, C08L5/00, C08B37/00; Cooperative Classification C08B37/0087, D06M15/01; European Classification D06M15/01, C08B37/00P6",
				"filingDate": "Nov 6, 1979",
				"patentNumber": "EP0011951 A1",
				"url": "http://www.google.com/patents/EP0011951A1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.google.com/patents/US4748058",
		"items": [
			{
				"itemType": "patent",
				"title": "Artificial tree",
				"creators": [
					{
						"firstName": "Chester L. Craig",
						"lastName": "Jr",
						"creatorType": "inventor"
					}
				],
				"issueDate": "May 31, 1988",
				"abstractNote": "An artificial tree assembly, and a tree constructed therefrom, are provided. The assembly comprises a collapsible three-piece pole; a base member formed by the bottom of a box for storing the tree assembly and including a pole support member secured thereto for supporting the pole; and a plurality of limb sections and interconnecting garlands. The limb-sections each comprise a central ring portion and a plurality of limb members extending radially outwardly from the central ring portions. The ring portions of the limb sections are stacked, when not in use, on the pole support member and are disposed, in use, along the length of pole in spaced relationship therealong. The garlands interconnect the limb portions so that as the ring portions are lifted, from the top, from the stacked positions thereof on the pole support member and slid along the pole, the garlands between adjacent limb section are tensioned, in turn, and thus serve to lift the next adjacent limb section until the tree is fully erected.",
				"assignee": "Craig Jr Chester L",
				"country": "United States",
				"extra": "U.S. Classification 428/9, D11/118, 428/18; International Classification A47G33/06; Cooperative Classification A47G33/06; European Classification A47G33/06",
				"filingDate": "Feb 10, 1987",
				"patentNumber": "US4748058 A",
				"url": "http://www.google.com/patents/US4748058",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US5979603?dq=tree&hl=en&sa=X&ei=ILS-UOOfLYXu2QXxyYC4Dw&ved=0CDoQ6AEwAQ",
		"items": [
			{
				"itemType": "patent",
				"title": "Portable tree stand having fiber composite platform",
				"creators": [
					{
						"firstName": "Ronald R.",
						"lastName": "Woller",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Nov 9, 1999",
				"abstractNote": "A climbing device for a tree or other vertical columnar member having a platform fashioned from fiber-reinforced composite material. The platform is a one-piece structure having a peripheral skin with bi-directionally oriented reinforcing fibers and longitudinally extending reinforcing fibers. The back bar is also fashioned from fiber-reinforced composite material having a peripheral skin with bi-directionally oriented reinforcing fibers and longitudinally extending reinforcing fibers. Fiber-reinforced members include a foam core for shape retention. The manufacturing process permits use of T-shaped joints in fiber-reinforced structures.",
				"assignee": "Summit Specialties, Inc.",
				"country": "United States",
				"extra": "U.S. Classification 182/187, 182/135, 182/46; International Classification A45F3/26, A01M31/02; Cooperative Classification A45F3/26, A01M31/02; European Classification A45F3/26, A01M31/02",
				"filingDate": "Jan 6, 1995",
				"patentNumber": "US5979603 A",
				"url": "http://www.google.com/patents/US5979603",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US2970959",
		"items": [
			{
				"itemType": "patent",
				"title": "Composition and method for inhibiting scale",
				"creators": [
					{
						"firstName": "Loyd W.",
						"lastName": "Jones",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Feb 7, 1961",
				"assignee": "Pan American Petroleum Corp",
				"country": "United States",
				"extra": "U.S. Classification 507/215, 264/15, 507/927, 252/181, 507/209, 264/122; International Classification C02F5/10; Cooperative Classification C02F5/105, Y10S507/927; European Classification C02F5/10B",
				"filingDate": "Jun 17, 1958",
				"patentNumber": "US2970959 A",
				"url": "http://www.google.com/patents/US2970959",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US6239091",
		"items": [
			{
				"itemType": "patent",
				"title": "Machine dishwashing compositions with a polymer having cationic monomer units",
				"creators": [
					{
						"firstName": "Alla",
						"lastName": "Tartakovsky",
						"creatorType": "inventor"
					},
					{
						"firstName": "Joseph Oreste",
						"lastName": "Carnali",
						"creatorType": "inventor"
					},
					{
						"firstName": "John Robert",
						"lastName": "Winters",
						"creatorType": "inventor"
					}
				],
				"issueDate": "May 29, 2001",
				"abstractNote": "A detergent or rinse aid composition which reduces spotting and filming on glassware cleaned in an automatic dishwashing machine is described. The composition contains an effective amount of a water soluble cationic or amphoteric polymer having at least one monomer unit having a cationic charge over a portion of the pH range of about 2 to about 11 in the wash or rinse cycle.",
				"assignee": "Lever Brothers Company, Division Of Conopco, Inc.",
				"country": "United States",
				"extra": "U.S. Classification 510/220, 510/480, 510/223, 510/504, 510/441, 510/288, 510/434, 510/233, 510/349, 510/323, 510/514; International Classification C11D3/37; Cooperative Classification C23F11/173, C11D3/3723, C11D3/0073, C11D3/3719, C11D3/3776, C11D3/3769, C11D3/3796; European Classification C23F11/173, C11D3/37C8H, C11D3/37C8, C11D3/37B9, C11D3/37B8, C11D3/37Z, C11D3/00B15",
				"filingDate": "May 11, 1998",
				"patentNumber": "US6239091 B1",
				"url": "http://www.google.com/patents/US6239091",
				"attachments": [
					{
						"title": "Google Patents PDF",
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
		"url": "http://www.google.com/patents/US20110172136",
		"items": [
			{
				"itemType": "patent",
				"title": "Detergent composition with hydrophilizing soil-release agent and methods for using same",
				"creators": [
					{
						"firstName": "Tobias Johannes",
						"lastName": "Fütterer",
						"creatorType": "inventor"
					},
					{
						"firstName": "Lawrence Alan",
						"lastName": "HOUGH",
						"creatorType": "inventor"
					},
					{
						"firstName": "Robert Lee",
						"lastName": "Reierson",
						"creatorType": "inventor"
					}
				],
				"issueDate": "Jul 14, 2011",
				"abstractNote": "Laundry detergent compositions that provide soil release benefits to all fabric comprising an organophosphorus soil release agents and optional non-cotton secondary soil release agents. The present invention further relates to a method for providing soil release benefits to cotton fabric by contacting cotton articles with a water soluble and/or dispersible organophosphorus material. The contacting can be during washing or by pretreating by applying the composition directly to stains or by presoaking the clothing in the composition prior to washing. The present invention further relates to providing soil release benefits to all fabric in the laundry wash load in the presence of a bleaching agent.",
				"assignee": "Rhodia Operations",
				"country": "United States",
				"extra": "U.S. Classification 510/299; International Classification C11D3/60; Cooperative Classification C11D1/345, C11D3/361, C11D3/3784, C11D11/0017, C11D3/362, C11D3/0036, C11D1/342; European Classification C11D3/36B, C11D11/00B2A, C11D3/37C10, C11D3/00B7, C11D1/34C, C11D3/36C, C11D1/34B",
				"filingDate": "Mar 24, 2011",
				"patentNumber": "US20110172136 A1",
				"url": "http://www.google.com/patents/US20110172136",
				"attachments": [
					{
						"title": "Google Patents PDF",
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