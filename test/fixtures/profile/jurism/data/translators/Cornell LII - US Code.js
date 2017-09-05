{
	"translatorID": "14c135ad-93f3-4e64-b501-a36724418cef",
	"translatorType": 4,
	"label": "Cornell LII - US Code",
	"creator": "Frank Bennett",
	"target": "https?://(?:www.)law.cornell.edu/uscode/text",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"browserSupport": "g",
	"lastUpdated": "2013-07-22 05:01:36"
}


/**
    Copyright (c) 2010-2013, Erik Hetzner

    This program is free software: you can redistribute it and/or
    modify it under the terms of the GNU Affero General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public
    License along with this program.  If not, see
    <http://www.gnu.org/licenses/>.
*/


var sessionMap = {
    "1": "1790",
    "2": "1792",
    "3": "1794",
    "4": "1796",
    "5": "1798",
    "6": "1800",
    "7": "1802",
    "8": "1804",
    "9": "1806",
    "10": "1808",
    "11": "1810",
    "12": "1812",
    "13": "1814",
    "14": "1816",
    "15": "1818",
    "16": "1820",
    "17": "1822",
    "18": "1824",
    "19": "1826",
    "20": "1828",
    "21": "1830",
    "22": "1832",
    "23": "1834",
    "24": "1836",
    "25": "1838",
    "26": "1840",
    "27": "1842",
    "28": "1844",
    "29": "1846",
    "30": "1848",
    "31": "1850",
    "32": "1852",
    "33": "1854",
    "34": "1856",
    "35": "1858",
    "36": "1860",
    "37": "1862",
    "38": "1864",
    "39": "1866",
    "40": "1868",
    "41": "1870",
    "42": "1872",
    "43": "1874",
    "44": "1876",
    "45": "1878",
    "46": "1880",
    "47": "1882",
    "48": "1884",
    "49": "1886",
    "50": "1888",
    "51": "1890",
    "52": "1892",
    "53": "1894",
    "54": "1896",
    "55": "1898",
    "56": "1900",
    "57": "1902",
    "58": "1904",
    "59": "1906",
    "60": "1908",
    "61": "1910",
    "62": "1912",
    "63": "1914",
    "64": "1916",
    "65": "1918",
    "66": "1920",
    "67": "1922",
    "68": "1924",
    "69": "1926",
    "70": "1928",
    "71": "1930",
    "72": "1932",
    "73": "1934"
}

function addAttachment(doc, rawCite, block, item) {
    // head element
    var head = doc.createElement("head");
    var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}pre.inline{white-space:pre;display:inline;}span.citation{white-space:pre;}";
    
    head.innerHTML = '<title>' + rawCite + '</title>';
    head.innerHTML += '<style type="text/css">' + css + '</style>'; 
    
    var newDoc = ZU.composeDoc(doc, head, block);
    item.attachments.push({
	title: "Cornell LII US Code attachment",
	document: newDoc,
	mimeType: "text/html",
	snapshot: true
    });
}


function detectWeb(doc, url) {
    var codeBlock = ZU.xpath(doc, "//div[@id='block-uscode-text']//div[contains(@class, 'section')]");
    if (codeBlock.length > 0) {
	return 'statute';
    } else {
	return false;
    }
}


function scrape(doc, url) {
}

function doWeb(doc, url) {
    var uscTitle, uscReporter, uscSection, sessionYear;
    var rawCite = ZU.xpath(doc, "//meta[@name='dcterms.title']")
    if (rawCite.length > 0) {
	rawCite = rawCite[0].getAttribute("content");
	rawCite = rawCite.trim();
    } else {
	rawCite = false;
    }
    if (rawCite) {
	var m = rawCite.match(/^([0-9]+)\s+(U\.*S\.*\s+Code)\s+§+\s+(.*)\s*-.*/);
	if (m) {
	    uscTitle = m[1];
	    uscReporter = m[2];
	    uscSection = m[3];
	}
    }
    var rawSession = ZU.xpath(doc, "//div[@id='uscode_prelim_note']//a[contains(@title, 'Pub. L.')]");
    if (rawSession.length > 0) {
	rawSession = rawSession[0].getAttribute('title');
    } else {
	rawSession = false;
    }
    if (rawSession) {
	var m = rawSession.match(/^[^0-9]*([0-9]+).*/);
	if (m) {
	    var session = m[1];
	    session = parseInt(session, 10);
	    if (session <= 73) {
		sessionYear = sessionMap[session];
	    } else {
		sessionYear = (((session-73)*2)+1934);
	    }
	}
    }
    var rawBlock = ZU.xpath(doc, "//div[@class='liicontent']");
    if (rawBlock.length > 0) {
	rawBlock = rawBlock[0];
    } else {
	rawBlock = false;
    }
    
    if (uscTitle && uscReporter && uscSection && sessionYear) {
	var item = new Zotero.Item("statute");
	item.jurisdiction = "us";
	item.codeNumber = uscTitle;
	item.code = uscReporter;
	item.section = uscSection;
	item.publicationDate = sessionYear;
	item.url = url;
	if (rawBlock) {
	    addAttachment(doc, rawCite, rawBlock, item);
	}
	item.complete();
    }
}
