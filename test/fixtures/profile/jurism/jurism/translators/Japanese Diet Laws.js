{
	"translatorID": "3ddda662-ec86-448a-9979-9ee1e567c848",
	"label": "Japanese Diet Laws",
	"creator": "Frank Bennett",
	"target": "http://www.shugiin.go.jp/internet/itdb_housei.nsf/html/(houritsu|housei)/[0-9]+\\.htm",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-06-17 14:39:36"
}

function detectWeb(doc, url) {
	return "statute";
}

var kanjiNum = {
	"◯": 0,
	"一": 1,
	"二": 2,
	"三": 3,
	"四": 4,
	"五": 5,
	"六": 6,
	"七": 7,
	"八": 8,
	"九": 9
}

var multipliers = [
	100,
	10,
	1
]

function convertNumerals(number) {
	return number.split("").map(function(chr){
		if (kanjiNum[chr]) {
			return kanjiNum[chr];
		} else {
			return chr;
		}
	}).join("");
}

function fixNumber(number) {
	// Convert kanji numbers to arabic
	number = convertNumerals(number);
	// Break into parts
	nums = number.split(/[\u767e\u5341]/);
	// Give value to bare hundred and bare ten
	var defaultNum = "1";
	for (var i=0,ilen=3; i<ilen; i++) {
		if (!nums[i]) {
			if (i === (ilen-1)) {
				nums[i] = "0";
			} else {
				nums[i] = "1";
			}
		}
	}
	// Pad out the array
	while (nums.length < 3) {
		nums = [0].concat(nums);
	}
	// Calculate the number
	var number = 0;
	for (var i=0,ilen=3; i<3; i++) {
		number = number + multipliers[i] * parseInt(nums[i], 10);
	}
	return number;
}

var imperialOffset = {
	"明": 1867,
	"大": 1911,
	"昭": 1925,
	"平": 1988
}

function fixDate(date) {
	var m = date.match(/(明|大|昭|平)(.*)/);
	if (m) {
		var offset = imperialOffset[m[1]];
		date = convertNumerals(m[2]);
		date = date.replace(/\u30fb/g, "-")
		date = date.split("-");
		date[0] = parseInt(date[0], 10) + offset;
		for (var i=1,ilen=3; i<ilen; i++) {
			while (date[i].length < 2) {
				date[i] = "0" + date[i];
			}
		}
		date = date.join("-");
	}
	return date;
}

function doWeb(doc, url) {
	var item = new Zotero.Item("statute");
	item.jurisdiction = "jp";
	item.url = url;
	var details = ZU.xpath(doc, "//title")[0].textContent;
	var nameNode = ZU.xpath(doc, "//p[contains(text(),'\u25ce')]")[0];
	item.nameOfAct = nameNode.textContent.replace(/^[\u3000\u25ce ]+/g, "");
	var m = details.match(/法律第(.*)号\（(.*)\）/);
	var number = "";
	var date = "";
	if (m) {
		item.publicLawNumber = fixNumber(m[1]);
		item.dateEnacted = fixDate(m[2]);
	}
	var layoutNode = doc.getElementById("mainlayout");
	if (layoutNode) {
		var breadcrumbNode = doc.getElementById("breadcrumb");
		if (breadcrumbNode) {
			breadcrumbNode.parentNode.removeChild(breadcrumbNode);
		}
		var anchorNodes = ZU.xpath(layoutNode, ".//a");
		for (var anchorNode of anchorNodes) {
			if (anchorNode.children.length === 0) {
				anchorNode.parentNode.removeChild(anchorNode);
			}
		}
		item.notes.push({
			note: layoutNode.innerHTML.replace(/[\s\S]*?\<p/, "<p")
		});
	}
	item.complete();
}
