{
	"translatorID": "f4d6dd3c-960f-4289-9b07-02e44aae112a",
	"label": "courts.go.jp",
	"creator": "Frank Bennett",
	"target": "http://(?:www.)*courts.go.jp/app/hanrei_jp",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-05-16 13:21:39"
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

var courtMap = {
	"知的財産高等裁判所": {
		jurisdictionID: "jp",
		courtID: "chiteki.zaisan.koto.saibansho"
	},
	"最高裁判所": {
		jurisdictionID: "jp",
		courtID: "saiko.saibansho"
	},
	"最高裁判所大法廷": {
		jurisdictionID: "jp",
		courtID: "saiko.saibansho.dai"
	},
	"最高裁判所第一小法廷": {
		jurisdictionID: "jp",
		courtID: "saiko.saibansho.ichi"
	},
	"最高裁判所第二小法廷": {
		jurisdictionID: "jp",
		courtID: "saiko.saibansho.ni"
	},
	"最高裁判所第三小法廷": {
		jurisdictionID: "jp",
		courtID: "saiko.saibansho.san"
	},
	"東京高等裁判所": {
		jurisdictionID: "jp:tokyo",
		courtID: "koto.saibansho"
	},
	"横浜地方裁判所": {
		jurisdictionID: "jp:tokyo:yokohama",
		courtID: "chiho.saibansho"
	},
	"宇都宮地方裁判所": {
		jurisdictionID: "jp:tokyo:utsunomiya",
		courtID: "chiho.saibansho"
	},
	"東京地方裁判所": {
		jurisdictionID: "jp:tokyo:tokyo",
		courtID: "chiho.saibansho"
	},
	"静岡地方裁判所": {
		jurisdictionID: "jp:tokyo:shizuoka",
		courtID: "chiho.saibansho"
	},
	"埼玉地方裁判所": {
		jurisdictionID: "jp:tokyo:saitama",
		courtID: "chiho.saibansho"
	},
	"新潟地方裁判所": {
		jurisdictionID: "jp:tokyo:niigata",
		courtID: "chiho.saibansho"
	},
	"長野地方裁判所": {
		jurisdictionID: "jp:tokyo:nagano",
		courtID: "chiho.saibansho"
	},
	"水戸地方裁判所": {
		jurisdictionID: "jp:tokyo:mito",
		courtID: "chiho.saibansho"
	},
	"前橋地方裁判所": {
		jurisdictionID: "jp:tokyo:maebashi",
		courtID: "chiho.saibansho"
	},
	"甲府地方裁判所": {
		jurisdictionID: "jp:tokyo:kofu",
		courtID: "chiho.saibansho"
	},
	"千葉地方裁判所": {
		jurisdictionID: "jp:tokyo:chiba",
		courtID: "chiho.saibansho"
	},
	"高松高等裁判所": {
		jurisdictionID: "jp:takamatsu",
		courtID: "koto.saibansho"
	},
	"徳島地方裁判所": {
		jurisdictionID: "jp:takamatsu:tokushima",
		courtID: "chiho.saibansho"
	},
	"高松地方裁判所": {
		jurisdictionID: "jp:takamatsu:takamatsu",
		courtID: "chiho.saibansho"
	},
	"松山地方裁判所": {
		jurisdictionID: "jp:takamatsu:matsuyama",
		courtID: "chiho.saibansho"
	},
	"高知地方裁判所": {
		jurisdictionID: "jp:takamatsu:kochi",
		courtID: "chiho.saibansho"
	},
	"仙台高等裁判所": {
		jurisdictionID: "jp:sendai",
		courtID: "koto.saibansho"
	},
	"山形地方裁判所": {
		jurisdictionID: "jp:sendai:yamagata",
		courtID: "chiho.saibansho"
	},
	"仙台地方裁判所": {
		jurisdictionID: "jp:sendai:sendai",
		courtID: "chiho.saibansho"
	},
	"盛岡地方裁判所": {
		jurisdictionID: "jp:sendai:morioka",
		courtID: "chiho.saibansho"
	},
	"福島地方裁判所": {
		jurisdictionID: "jp:sendai:fukushima",
		courtID: "chiho.saibansho"
	},
	"青森地方裁判所": {
		jurisdictionID: "jp:sendai:aomori",
		courtID: "chiho.saibansho"
	},
	"秋田地方裁判所": {
		jurisdictionID: "jp:sendai:akita",
		courtID: "chiho.saibansho"
	},
	"札幌高等裁判所": {
		jurisdictionID: "jp:sapporo",
		courtID: "koto.saibansho"
	},
	"札幌地方裁判所": {
		jurisdictionID: "jp:sapporo:sapporo",
		courtID: "chiho.saibansho"
	},
	"釧路地方裁判所": {
		jurisdictionID: "jp:sapporo:kushiro",
		courtID: "chiho.saibansho"
	},
	"函館地方裁判所": {
		jurisdictionID: "jp:sapporo:hakodate",
		courtID: "chiho.saibansho"
	},
	"旭川地方裁判所": {
		jurisdictionID: "jp:sapporo:asahikawa",
		courtID: "chiho.saibansho"
	},
	"大阪高等裁判所": {
		jurisdictionID: "jp:osaka",
		courtID: "koto.saibansho"
	},
	"和歌山地方裁判所": {
		jurisdictionID: "jp:osaka:wakayama",
		courtID: "chiho.saibansho"
	},
	"大津地方裁判所": {
		jurisdictionID: "jp:osaka:otsu",
		courtID: "chiho.saibansho"
	},
	"大阪地方裁判所": {
		jurisdictionID: "jp:osaka:osaka",
		courtID: "chiho.saibansho"
	},
	"奈良地方裁判所": {
		jurisdictionID: "jp:osaka:nara",
		courtID: "chiho.saibansho"
	},
	"京都地方裁判所": {
		jurisdictionID: "jp:osaka:kyoto",
		courtID: "chiho.saibansho"
	},
	"神戸地方裁判所": {
		jurisdictionID: "jp:osaka:kobe",
		courtID: "chiho.saibansho"
	},
	"名古屋高等裁判所": {
		jurisdictionID: "jp:nagoya",
		courtID: "koto.saibansho"
	},
	"津地方裁判所": {
		jurisdictionID: "jp:nagoya:tsu",
		courtID: "chiho.saibansho"
	},
	"富山地方裁判所": {
		jurisdictionID: "jp:nagoya:toyama",
		courtID: "chiho.saibansho"
	},
	"名古屋地方裁判所": {
		jurisdictionID: "jp:nagoya:nagoya",
		courtID: "chiho.saibansho"
	},
	"金沢地方裁判所": {
		jurisdictionID: "jp:nagoya:kanazawa",
		courtID: "chiho.saibansho"
	},
	"岐阜地方裁判所": {
		jurisdictionID: "jp:nagoya:gifu",
		courtID: "chiho.saibansho"
	},
	"福井地方裁判所": {
		jurisdictionID: "jp:nagoya:fukui",
		courtID: "chiho.saibansho"
	},
	"広島高等裁判所": {
		jurisdictionID: "jp:hiroshima",
		courtID: "koto.saibansho"
	},
	"山口地方裁判所": {
		jurisdictionID: "jp:hiroshima:yamaguchi",
		courtID: "chiho.saibansho"
	},
	"鳥取地方裁判所": {
		jurisdictionID: "jp:hiroshima:tottori",
		courtID: "chiho.saibansho"
	},
	"岡山地方裁判所": {
		jurisdictionID: "jp:hiroshima:okayama",
		courtID: "chiho.saibansho"
	},
	"松江地方裁判所": {
		jurisdictionID: "jp:hiroshima:matsue",
		courtID: "chiho.saibansho"
	},
	"広島地方裁判所": {
		jurisdictionID: "jp:hiroshima:hiroshima",
		courtID: "chiho.saibansho"
	},
	"福岡高等裁判所": {
		jurisdictionID: "jp:fukuoka",
		courtID: "koto.saibansho"
	},
	"佐賀地方裁判所": {
		jurisdictionID: "jp:fukuoka:saga",
		courtID: "chiho.saibansho"
	},
	"大分地方裁判所": {
		jurisdictionID: "jp:fukuoka:oita",
		courtID: "chiho.saibansho"
	},
	"那覇地方裁判所": {
		jurisdictionID: "jp:fukuoka:naha",
		courtID: "chiho.saibansho"
	},
	"長崎地方裁判所": {
		jurisdictionID: "jp:fukuoka:nagasaki",
		courtID: "chiho.saibansho"
	},
	"宮崎地方裁判所": {
		jurisdictionID: "jp:fukuoka:miyazaki",
		courtID: "chiho.saibansho"
	},
	"熊本地方裁判所": {
		jurisdictionID: "jp:fukuoka:kumamoto",
		courtID: "chiho.saibansho"
	},
	"鹿児島地方裁判所": {
		jurisdictionID: "jp:fukuoka:kagoshima",
		courtID: "chiho.saibansho"
	},
	"福岡地方裁判所": {
		jurisdictionID: "jp:fukuoka:fukuoka",
		courtID: "chiho.saibansho"
	}
}

var courtKeys = Object.keys(courtMap);
courtKeys.sort(function(a, b){
	if (a.length < b.length) {
		return 1;
	} else if (a.length > b.length) {
		return -1;
	} else {
		return 0;
	}
});


var zenkakuRex = function () {
	var zenkakuNums = ["\uff10", "\uff11", "\uff12", "\uff13", "\uff14", "\uff15", "\uff16", "\uff17", "\uff18", "\uff19"];
	for (var i=0,ilen=zenkakuNums.length; i<ilen; i++) {
		zenkakuNums[i] = new RegExp(zenkakuNums[i], "g");
	}
	return zenkakuNums;
}();

function convertImperialDate(dateStr) {
	var eraOffsetMap = {
		"\u660E\u6CBB": 1867,
		"\u5927\u6B63": 1911,
		"\u662D\u548C": 1925,
		"\u5e73\u6210": 1988
	};
	// 元年
	dateStr = dateStr.replace("\u5143\u5E74", "1\u5E74");
	for (var i=0,ilen=zenkakuRex.length; i<ilen; i++) {
		dateStr = dateStr.replace(zenkakuRex[i], i);
	}
	// 明治|大正|昭和|平成...年...月...日
	var m = dateStr.match(/(\u660E\u6CBB|\u5927\u6B63|\u662D\u548c|\u5e73\u6210)([0-9]+)\u5e74(?:([0-9]+)(?:\u6708([0-9]+)\u65e5)*)*/);
	if (m) {
		var era = m[1];
		var year = (parseInt(m[2], 10) + eraOffsetMap[m[1]]);
		if (!isNaN(year)) {
			var dateStr = [year, m[3], m[4]]
				.filter(function(elem){
					return elem;
				}).map(function(elem){
					while (elem.length < 2) {
						elem = "0" + elem;
					}
					return elem;
				}).join("-");
		}
	}
	return dateStr;
}

function convertCourtName(str) {
	var ret = false;
	for (var key of courtKeys) {
		if (key === str.slice(0, key.length)) {
			ret = courtMap[key];
			break;
		}
	}
	if (ret) {
		return [ret.jurisdictionID, ret.courtID];
	} else {
		return ["jp", str];
	}
}

function setValue(doc, item, str, variables, callback) {
	if (typeof variables === "string") {
		variables = [variables];
	}
	var val = null;
	var valNode = ZU.xpath(doc, "//div[contains(text(), '" + str + "')]/following-sibling::div")[0];
	if (valNode) {
		val = valNode.textContent.trim();
		if (val) {
			if (callback) {
				val = callback(val);
			}
			if (typeof val === "string") {
				val = [val];
			}
			Zotero.debug("start "+variables.length+" "+val.length);
			for (var i=0,ilen=variables.length;i<ilen;i++) {
				var variable = variables[i];
				var v = val[i];
				item[variable] = v;
			}
			Zotero.debug("  finish");
		}
	}
}

function scrape(doc, url) {
	var item = new Z.Item("case");
	setValue(doc, item, "事件番号", "number");
	setValue(doc, item, "裁判年月日", "dateDecided", convertImperialDate);
	setValue(doc, item, "法廷名", ["jurisdiction", "court"], convertCourtName);
	if (!item.court) {
		setValue(doc, item, "裁判所名", ["jurisdiction", "court"], convertCourtName);
	}
	item.url = url;
	var attachmentNodes = ZU.xpath(doc, "//div[contains(text(), '全文')]/following-sibling::div/a");
	for (var attachmentNode of attachmentNodes) {
		var attachmentUrl = attachmentNode.getAttribute("href");
		item.attachments.push({
			mimeType: "application/pdf",
			url: attachmentUrl,
			title: "Courts.go.jp case print"
		});
	}
	item.complete();
}

function detectWeb(doc, url) {
	var m = url.match(/\/(detail|list)[0-9]\?/);
	if (m) {
		if (m[1] === "list") {
			return "multiple;"
		} else {
			return "case";
		}
	} else {
		return false;
	}
}
function doWeb(doc, url) {
	var items = scrape(doc, url);
}


/*
function scrape(
	itemType: 'case';
	detect: FW.Url().match(/\/detail[0-9](?:\.action)*\?id=[0-9]+/),
	docketNumber: FW.Xpath("//div[contains(.,'事件番号')]/following-sibling::div").text().trim(),
	abstractNote: FW.Xpath("//div[contains(.,'事件名')]/following-sibling::div").text().trim(),
	dateDecided: FW.Xpath("//div[contains(.,'裁判年月日')]/following-sibling::div").text().trim(),
	court: FW.Xpath("//div[contains(.,'裁判所名') or contains(.,'法廷名')]/following-sibling::div").text().trim(),
	attachments: [
		{
			url: FW.Xpath("//div[contains(.,'全文')]/following-sibling::div/a").key("href").text(),
			title:  "Judgment",
			type: "text/pdf" 
		}
	],
	hooks: { "scraperDone": function  (item,doc, url) {
		item.jurisdiction = "jp"
		if (item.dateDecided) {
			var japaneseDate = item.dateDecided;
			// Convert docket number and store in Japanese and English
			var m = item.dateDecided.match(/(平成|昭和|大正|明治)([0-9]+)年([0-9]+)月([0-9]+)日/);
			if (m) {
				var reign = m[1];
				var year = parseInt(m[2],10);
				var month = parseInt(m[3],10);
				var day = parseInt(m[4],10);
				if (reign === "平成") {
					year = year + 1988;
				} else if (reign === "昭和") {
					year = year + 1925;
				} else if (reign === "大正") {
					year = year + 1911;
				} else if (reign === "明治") {
					year = year + 1867;
				}
				item.dateDecided = (""+year) + "-" + (""+month) + "-" + (""+day);
			}
			// Break out the elements of the docket number and store as appropriate
			var m = item.docketNumber.match(/(平成|昭和|大正|明治)([0-9]+)\(([^)]+)\)(.*)/);
			if (m) {
				item.reign = m[1];
				item.filingDate = m[2];
				item.callNumber = m[3];
				item.docketNumber = m[4];
				item.notes = [
					{
						"note":"Summary of "
							+ item.court + " "
							+ item.reign
							+ item.filingDate + "("
							+ item.callNumber + ")"
							+ item.docketNumber + " ("
							+ item.dateDecided + ")\n"
							+ "<h2>Procedural History</h2>"
							+ "<p>[writeme]</p>"
							+ "<h2>Facts</h2>"
							+ "<p>[writeme]</p>"
							+ "<h2>Decision</h2>"
							+ "<p>[writeme]</p>"
							+ '<div><b>Summarised for <a href="www.zotero.org/groups/148698">Japanese Judgments and Rulings by</a></b></div>'
							+ "<p>[contributor name here]</p>"
					}
				];
			}
		}
	}}
);

*/
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
