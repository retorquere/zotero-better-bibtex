{
	"translatorID": "ad3a50fa-4f2f-4ca8-9fdf-eabc03f3fc57",
	"translatorType": 4,
	"label": "Japanese Diet Committee Transcripts",
	"creator": "Frank Bennett",
	"target": "http://kokkai.ndl.go.jp/cgi-bin/KENSAKU/swk_dispdoc.cgi",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-06-01 18:21:18"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Frank Bennett

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


function getSpeakerDoc(doc) {
    var frame = doc.getElementsByTagName("frame");
    if (frame) {
        frame = frame[0];
    }
    if (frame) {
        var hasSpeakers = ZU.xpath(frame.contentDocument, "//td[contains(@class, 'speaker-list')]")[0];
        if (hasSpeakers) {
            return frame.contentDocument;
        }
    }
    return false;
}
function detectWeb(doc, url) {
    if (getSpeakerDoc(doc)) {
        return "multiple";
    } else {
        return false;
    }
}

// Constants for remangling URLs

var url_base = 'http://kokkai.ndl.go.jp';
var speaker_url_base = url_base+"/cgi-bin/KENSAKU/swk_dispdoc_speaker.cgi";


// Column mapper used in building xpath targets.

var NDL = function ( doc ) {
	this.colmap = [];
	this.doc = doc;
};

NDL.prototype.setCol = function ( pos ) {
	var res = ZU.xpath(this.doc, '//tr/th[1][contains(text(),"No")]/following-sibling::th['+pos+']')[0];
	if (res) {
		var key = res.textContent.replace(/^\s+/,"").replace(/\s+$/,"");
		this.colmap.push(key);
	} else {
		this.colmap.push('XX');
	}
};

NDL.prototype.setCols = function() {
	for (var i=1; i<7; i++ ) {
		this.setCol(i);
	}
};

NDL.prototype.getCol = function ( s ) {
	var pos = this.colmap.indexOf(s);
	if ( pos > -1 ){
		pos++;
		return pos;
	} else {
		return 0;
	}
};

function getLinkInfo( anchor ) {
	var strText = anchor.getAttribute("onClick");
	var mText = strText.match(/.*href=([^\']+)[^\?]+(\?[^\']+)[^0-9]+([0-9]+)/);
	var spInfoNode = ZU.xpath(anchor, "./parent::td/preceding-sibling::td[1]/a")[0];
	var urlSpeaker;
    if (spInfoNode) {
        var strSpeaker = spInfoNode.getAttribute("onClick");
        var mSpeaker = strSpeaker.match(/.*href=([^\']+)/);
        urlSpeaker = mSpeaker[1];
    } else {
        urlSpeaker = false;
    }
	return {
		text: {
			url: url_base + mText[1] + mText[2] + "&PPOS=" + mText[3],
			params: mText[2],
		},
		speaker: {
			url: urlSpeaker
		},
		pos: mText[3]
	};
}

function padding( s ) {
	var pad = '000';
	var padlen = pad.length - s.length;
	return pad.slice(0,padlen)+s;
}

function setTranslation(item, varname, s) {
	if (ZU.setMultiField) {
		item[varname] = s;
		if (translations[s]) {
			ZU.setMultiField(item, varname, translations[s], "en");
		}
	}
}

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

function doWeb(doc, url) {
	var newUrl = speaker_url_base + doc.location.search;
    doc = getSpeakerDoc(doc);
    url = doc.location.href;
	var speakers_url = doc.location.href;
	var speakers_params = doc.location.search;
	var session_list_pos;
	// Accumulators
	var items_data = {};
	var items_select = {};
	var m = speakers_url.match(/.*DPOS=([0-9]+).*/,'\1');
	if (m) {
		session_list_pos = padding( m[1] );
	} else {
		session_list_pos = '000';
	}
	var anchorNodes = ZU.xpath(doc, '//form[@name="form1"]//table/tbody/tr/td[3]//a', doc);
	for (var anchor of anchorNodes) {
		var link_info = getLinkInfo(anchor);
		var pos = link_info.pos;
        var page = Math.floor(((parseInt(session_list_pos, 10) - 1) / 20) + 1);
        var index_url = speakers_url
            .replace(/dispdoc_speaker/, "list")
            .replace(/\&?MODE=[0-9]*/, "")
            .replace(/\&?DPAGE=[0-9]*/, "")
            + "&MODE=&DPAGE=" + page + "&MYPOS=" + pos;
		// The PPOS value identifies the statement in the document frame. If it is not
		// appended, the attachment note derived from the document frame will show an
		// error message instead of the content.
		items_data[index_url] = {
			text_url: link_info.text.url,
			speaker: anchor.textContent.replace(/.*\]/,""),
            speaker_url: link_info.speaker.url
		};
		items_select[index_url] = anchor.textContent;
	}
	Zotero.selectItems(items_select, function(items){
		if(!items) return false;
		var urls = [];
		for (var index_url in items) {
			// This index_url is the same for every item. It navigates "upward" to a list that provides metadata
			// on the session in a cleaner form than is available in the main document frames.
			// The instances of index_url are distinguished by the hacked-in MYPOS value, which
			// the server at their end seems happy with.
			urls.push(index_url);
		}
		ZU.processDocuments(
			urls,
			function(newDoc, url) {
				var item = new Zotero.Item("hearing");
				item.jurisdiction = "jp";
				var pos = url.replace(/.*\&MYPOS=([0-9]+).*/, "$1");
				item.archiveLocation = "" + pos;
				var speaker = items_data[url].speaker;
				item.creators.push( {lastName:speaker, creatorType:"testimonyBy"});
				// Number of columns varies (of course!), so we build a map before
				// extracting.  Column 1 is assumed to be No, for number.
				var ndl = new NDL(newDoc);
                Zotero.debug("XXX Doing " + url);
                Zotero.debug("XXX setCols()...");
				ndl.setCols();
                Zotero.debug("XXX xpath statements...");
                Zotero.debug("XXX   session...");
				var assemblyNumber = ZU.xpath(newDoc, '//tr/td[1][contains(text(),"'+session_list_pos+'")]/following-sibling::td['+ndl.getCol("回次")+']')[0].textContent;
                Zotero.debug("XXX   legislativeBody...");
				var legislativeBody = ZU.xpath(newDoc, '//tr/td[1][contains(text(),"'+session_list_pos+'")]/following-sibling::td['+ndl.getCol("院名")+']')[0].textContent;
                Zotero.debug("XXX   committee...");
				var committee = ZU.xpath(newDoc, '//tr/td[1][contains(text(),"'+session_list_pos+'")]/following-sibling::td['+ndl.getCol("会議名")+']')[0].textContent;
                Zotero.debug("XXX   meetingNumber...");
				var meetingNumber = ZU.xpath(newDoc, '//tr/td[1][contains(text(),"'+session_list_pos+'")]/following-sibling::td['+ndl.getCol("号数")+']')[0].textContent;
                Zotero.debug("XXX   date...");
				var date = ZU.xpath(newDoc, '//tr/td[1][contains(text(),"'+session_list_pos+'")]/following-sibling::td['+ndl.getCol("開会日付")+']')[0].textContent;
				//
				item.title = "国会議事録、" + committee + "、" + date + "、" + pos + "、" + speaker + "の発言";
				setTranslation(item, "committee", committee);
				setTranslation(item, "legislativeBody" , legislativeBody);
				item.assemblyNumber = assemblyNumber;
				item.meetingNumber = meetingNumber.replace(/号/,"");
				item.date = convertImperialDate(date);
				item.url = url;

				ZU.processDocuments(
					[items_data[url].text_url],
					function (doc, url) {
						var body = doc.getElementsByTagName("body")[0];
						var formNode = ZU.xpath(body, ".//form")[0];
						if (formNode) {
							formNode.parentNode.removeChild(formNode);
						}
						var anchorNodes = ZU.xpath(body, ".//a");
						for (var anchorNode of anchorNodes) {
							var boldNode = doc.createElement("b");
							var textNode = doc.createTextNode(anchorNode.textContent);
							boldNode.appendChild(textNode);
							anchorNode.parentNode.replaceChild(boldNode, anchorNode);
						}
						item.notes.push({
							note: body.innerHTML
						});
                        // If we have a speaker info URL, add that information. Otherwise
                        // finish immediately.
                        if (items_data[item.url].speaker_url) {
                            Zotero.debug("XXX speaker_url = " + items_data[item.url].speaker_url);
                            ZU.processDocuments(
                                [items_data[item.url].speaker_url],
                                function(doc, url) {
                                    var tableNodes = ZU.xpath(doc, "//td");
                                    var descrip = [];
                                    var furigana = false;
                                    if (tableNodes.length === 4) {
                                        Zotero.debug("XXX FOUR!");
                                        descrip.push(tableNodes[1].textContent.trim());
                                        Zotero.debug("XXX   did 1");
                                        descrip.push(tableNodes[2].textContent.trim());
                                        Zotero.debug("XXX   did 2");
                                        descrip.push(tableNodes[3].textContent.trim());
                                        Zotero.debug("XXX   did 3");
                                    } else if (tableNodes.length === 5) {
                                        Zotero.debug("XXX FIVE!");
                                        furigana = tableNodes[1].textContent.trim();
                                        Zotero.debug("XXX   did 1");
                                        descrip.push(tableNodes[2].textContent.trim());
                                        Zotero.debug("XXX   did 2");
                                        descrip.push(tableNodes[3].textContent.trim());
                                        Zotero.debug("XXX   did 3");
                                        descrip.push(tableNodes[4].textContent.trim());
                                        Zotero.debug("XXX   did 4");
                                    }
                                    if (item.creators.length && furigana) {
                                        var creator = item.creators.slice(-1)[0];
                                        var variant = {lastName: furigana};
                                        ZU.setMultiCreator(creator, variant, "ja-Hira", "testimonyBy", "ja");
                                    }
                                    item.abstractNote = descrip.filter(function(obj){
                                        return obj;
                                    }).join("、");
                                    item.url = url_base;
                                    item.complete();
                                }
                            );
                        } else {
                            item.url = url_base;
                            item.complete();
                        }
					});
			});
	});
}

//
// this is only the current list, the full historical list from session 1 would be much larger.
// would need some parsing to save repetition if this is ever to be expanded.
var translations = {
	"参議院":"House of Councillors",
	"衆議院":"House of Representatives",
	"両院":"Both Houses of the Diet",
	"本会議":"Plenary Session",
	"予算委員会":"Budget Committee",
	"イラク人道復興支援活動等及び武力攻撃事態等への対処に関する特別委員会":"Special Committee on Humanitarian Reconstruction Efforts in Iraq and the Response to Attacks by Force of Arms",
	"安全保障委員会":"Security Committee",
	"沖縄及び北方問題に関する特別委員会":"Special Committee on Okinawa and the Northern Territories",
	"外交防衛委員会":"Committee on Defense and Diplomacy",
	"外務委員会":"Committee on Foreign Affairs",
	"外務委員会北朝鮮による拉致及び核開発問題等に関する小委員会":"Committee on Foreign Affairs, Subcommittee on North Korean Nuclear Development and the North Korean Kidnapping Issue",
	"環境委員会":"Environment Committee",
	"議院運営委員会":"Committee on Rules and Administration",
	"議院運営委員会院内の警察及び秩序に関する小委員会":"Committee on Rules and Administration, Subcommittee on Policing and the Maintenance of Order Within the Diet",
	"議院運営委員会国会審議テレビ中継に関する小委員会":"Committee on Rules and Administration, Subcommittee on Television Broadcast of Diet Hearings",
	"議院運営委員会衆議院事務局等の改革に関する小委員会":"Committee on Rules and Administration, Subcommittee on Reform of the Secretariat of the House of Representatives",
	"議院運営委員会庶務小委員会":"Committee on Rules and Administration, General Affairs Subcommittee",
	"議院運営委員会図書館運営小委員会":"Committee on Rules and Administration, Library Management Subcommittee",
	"建設委員会":"Construction Committee",
	"共生社会に関する調査会":"Investigative Committee on an Integrated Society",
	"教育基本法に関する特別委員会":"Special Committee on the Basic Law on Education",
	"教育基本法に関する特別委員会公聴会":"Special Committee on the Basic Law on Education, Public Hearings",
	"教育再生に関する特別委員会":"Special Committee on the Revival of Education",
	"教育再生に関する特別委員会公聴会":"Special Committee on the Revival of Education, Public Hearings",
	"金融問題及び経済活性化に関する特別委員会":"Special Committee on the Finance and Stimulation of the Economy",
	"経済・産業・雇用に関する調査会":"Investigative Committee on Economy, Industry and Employment",
	"経済産業委員会":"Committee on Economy, Trade and Industry",
	"経済産業委員会、国土交通委員会連合審査会":"Joint Deliberative Council of the Committee on Economy, Trade and Industry and the Committee on Land, Transport, Infrastructure and Tourism",
	"経済産業委員会国土交通委員会連合審査会":"Joint Deliberative Council of the Committee on Economy, Trade and Industry, and the Committee on Land, Transport, Infrastructure and Tourism",
	"決算委員会":"Accounting Committee",
	"決算行政監視委員会":"Committee on Accounts and Administrative Oversight",
	"決算行政監視委員会第一分科会":"Committee on Accounts and Administrative Oversight, First Working Group",
	"決算行政監視委員会第三分科会":"Committee on Accounts and Administrative Oversight, Second Working Group",
	"決算行政監視委員会第四分科会":"Committee on Accounts and Administrative Oversight, Third Working Group",
	"決算行政監視委員会第二分科会":"Committee on Accounts and Administrative Oversight, Fourth Working Group",
	"憲法調査会":"Research Committee on the Constitution",
	"憲法調査会安全保障及び国際協力等に関する調査小委員会":"Research Committee on the Constitution, Research Subcommittee on Security and International Cooperation",
	"憲法調査会基本的人権の保障に関する調査小委員会":"Research Committee on the Constitution, Research Subcommittee on the Guarantee of Basic Human Rights",
	"憲法調査会公聴会":"Research Committee on the Constitution, Public Hearings",
	"憲法調査会最高法規としての憲法のあり方に関する調査小委員会":"Research Committee on the Constitution, Research Subcommittee on the Status of the Constitution as Supreme Law",
	"憲法調査会統治機構のあり方に関する調査小委員会":"Research Committee on the Constitution, Research Subcommittee on the Status of Governmental Structure",
	"憲法調査会二院制と参議院の在り方に関する小委員会":"Research Committee on the Constitution, Research Subcommittee on the Status of the Bicameral System and the House of Councillors",
	"厚生労働委員会":"Committee on Health, Labour and Welfare",
	"厚生労働委員会臓器の移植に関する法律の一部を改正する法律案審査小委員会":"Committee on Health, Labour and Welfare, Deliberative Subcommittee on a Law to Amend in Part the Law on Organ Transplants",
	"行政改革に関する特別委員会":"Special Committee on Administrative Reform",
	"行政監視委員会":"Committee on Administrative Oversight",
	"国家基本政策委員会":"Committee on Basic National Policy",
	"国家基本政策委員会合同審査会":"Cross-Chamber Deliberative Council of the Committee on Basic National Policy",
	"国際・地球温暖化問題に関する調査会":"Research Committee on International and Global Warming",
	"国際テロリズムの防止及び我が国の協力支援活動並びにイラク人道復興支援活動等に関する特別委員会":"Special Committee on the Prevention of International Terrorism, and on Overseas Cooperation and Humanitarian Reconstruction Efforts in Iraq",
	"国際問題に関する調査会":"Research Committee on International Issues",
	"国土交通委員会":"Committee on Land, Transport, Infrastructure and Tourism",
	"国民生活・経済に関する調査会":"Research Committee on Living Standards and the Economy",
	"災害対策特別委員会":"Special Committee on Disaster Management",
	"在日米軍駐留経費負担特別協定両院協議会":"Special Collaborative Cross-Chamber Committee on the Cost of Stationing American Forces",
	"在日米軍駐留経費負担特別協定両院協議会協議委員議長副議長互選会":"Special Collaborative Cross-Chamber Committee on the Cost of Stationing American Forces, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"在日米軍駐留経費負担特別協定両院協議会参議院協議委員議長及び副議長互選会":"Special Collaborative Cross-Chamber Committee on the Cost of Stationing American Forces, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"財政金融委員会":"Committee on Public and Private Finance",
	"財政金融委員会、国土交通委員会連合審査会":"Committee on Public and Private Finance",
	"財務金融委員会":"Committee on Budgetary Affairs and Finance",
	"財務金融委員会法務委員会連合審査会":"Joint Deliberative Council of the Committee on Budgetary Affairs and Finance and the Committee on Judicial Affairs",
	"少子高齢化・共生社会に関する調査会":"Research Committee on Aging and Declining Birth Rates and an Integrated Society",
	"少子高齢社会に関する調査会":"Research Committee on Aging and Declining Birth Rates",
	"消費者問題に関する特別委員会":"Special Committee on Consumer Issues",
	"政治倫理の確立及び公職選挙法改正に関する特別委員会":"Special Committee on the Establishment of Ethics in Politics and Revision of the Public Office Election Law",
	"政治倫理の確立及び選挙制度に関する特別委員会":"Special Committee on the Establishment of Ethics in Politics and the Public Office Election System",
	"政府開発援助等に関する特別委員会":"Special Committee on State Development Assistance",
	"青少年問題に関する特別委員会":"Special Committee on Youth Issues",
	"総務委員会":"General Affairs Committee",
	"懲罰委員会":"Disciplinary Committee",
	"内閣委員会":"Cabinet Committee",
	"内閣委員会、財政金融委員会連合審査会":"Joint Deliberative Council of the Cabinet Committee and the Committee on Public and Private Finance",
	"内閣委員会経済産業委員会連合審査会":"Joint Deliberative Council of the Cabinet Committee and the Committee on Economy, Trade and Industry",
	"内閣委員会財務金融委員会連合審査会":"Joint Deliberative Council of the Cabinet Committee and the Committee on Budgetary Affairs and Finance",
	"内閣委員会法務委員会連合審査会":"Joint Deliberative Council of the Cabinet Committee and the Committee on Judicial Affairs",
	"内閣総理大臣の指名両院協議会":"Prime Minister Select Cross-Chamber Collaborative Committee",
	"内閣総理大臣の指名両院協議会協議委員議長及び副議長互選会":"Prime Minister Select Cross-Chamber Collaborative Committee, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"内閣総理大臣の指名両院協議会協議委員議長副議長互選会":"Prime Minister Select Cross-Chamber Collaborative Committee, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"内閣総理大臣の指名両院協議会参議院協議委員議長及び副議長互選会":"Prime Minister Select Cross-Chamber Collaborative Committee, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"日本国憲法に関する調査特別委員会":"Special Research Committee on the Constitution of Japan",
	"日本国憲法に関する調査特別委員会公聴会":"Special Research Committee on the Constitution of Japan, Public Hearings",
	"日本国憲法に関する調査特別委員会日本国憲法の改正手続に関する法律案等審査小委員会":"Special Research Committee on the Constitution of Japan, Subcommittee on the Bill on Procedures for the Revision of the Constitution of Japan",
	"年金制度をはじめとする社会保障制度改革に関する両院合同会議":"Cross-Chamber Committee on Reform of the Social Security System with Special Reference to the Pension System",
	"農林水産委員会":"Committee on Agriculture, Forestry and Fisheries",
	"農林水産委員会公聴会":"Committee on Agriculture, Forestry and Fisheries, Public Hearings",
	"武力攻撃事態等への対処に関する特別委員会":"Special Committee on the Response to Attacks by Force of Arms",
	"文教科学委員会":"Committee on Education, Culture, Sports, Science and Technology",
	"文教科学委員会公聴会":"Committee on Education, Culture, Sports, Science and Technology, Public Hearings",
	"文部科学委員会":"Committee on Education, Science, Sports and Culture",
	"平成十九年度一般会計補正予算（第１号）外二件両院協議会":"Cross-Chamber Collaborative Committee on the Supplement to the 2007 Ordinary Budget (No. 1) and Two Other Matters",
	"平成十九年度一般会計補正予算（第１号）外二件両院協議会協議委員議長副議長互選会":"Cross-Chamber Collaborative Committee on the Supplement to the 2007 Ordinary Budget (No. 1) and Two Other Matters, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"平成十九年度一般会計補正予算（第１号）外二件両院協議会参議院協議委員議長及び副議長互選会":"Cross-Chamber Collaborative Committee on the Supplement to the 2007 Ordinary Budget (No. 1) and Two Other Matters, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"平成二十年度一般会計補正予算（第２号）外二件両院協議会協議委員議長副議長互選会":"Cross-Chamber Collaborative Committee on the Supplement to the 2008 Ordinary Budget (No. 2) and Two Other Matters, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"平成二十年度一般会計補正予算外一件両院協議会参議院協議委員議長及び副議長互選会":"Cross-Chamber Collaborative Committee on the Supplement to the 2008 Ordinary Budget and One Other Matter, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"平成二十年度一般会計予算外二件両院協議会":"Cross-Chamber Collaborative Committee on the 2008 Ordinary Budget and Two Other Matters",
	"平成二十年度一般会計予算外二件両院協議会協議委員議長副議長互選会":"Cross-Chamber Collaborative Committee on the 2008 Ordinary Budget and Two Other Matters, Meeting of the Chairmen and Subchairmen of the Collaborative Committees",
	"平成二十年度一般会計予算外二件両院協議会参議院協議委員議長及び副議長互選会":"Cross-Chamber Collaborative Committee on the 2008 Ordinary Budget and Two Other Matters, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"平成二十年度政府関係機関補正予算両院協議会参議院協議委員議長及び副議長互選会":"Cross-Chamber Collaborative Committee on the Supplement to the 2007 Ordinary Budget (No. 1) and Two Other Matters, Meeting of the Chairman and Subchairman of the Collaborative Committee in the House of Councillors",
	"法務委員会":"Committee on Judicial Affairs",
	"法務委員会、厚生労働委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs and the Committee on Health, Labour and Welfare",
	"法務委員会、財政金融委員会、経済産業委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs and the Committee on Economy, Trade and Industry",
	"法務委員会、財政金融委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs and the Committee on Public and Private Finance",
	"法務委員会公聴会":"Committee on Judicial Affairs, Public Hearings",
	"法務委員会厚生労働委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs and the Committee on Health, Labour and Welfare",
	"法務委員会財務金融委員会経済産業委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs, the Committee on Budgetary Affairs and Finance, and the Committee on Economy, Trade and Industry",
	"法務委員会財務金融委員会連合審査会":"Joint Deliberative Council of the Committee on Judicial Affairs and the Committee on Budgetary Affairs and Finance",
	"北朝鮮による拉致問題等に関する特別委員会":"Special Committee on the North Korean Kidnapping Issue",
	"郵政民営化に関する特別委員会":"Special Committee on Postal Service Privatization",
	"予算委員会公聴会":"Budget Committee, Public Hearings",
	"予算委員会第一分科会":"Budget Committee, First Working Group",
	"予算委員会第五分科会":"Budget Committee, Fifth Working Group",
	"予算委員会第三分科会":"Budget Committee, Third Working Group",
	"予算委員会第四分科会":"Budget Committee, Fourth Working Group",
	"予算委員会第七分科会":"Budget Committee, Seventh Working Group",
	"予算委員会第二分科会":"Budget Committee, Second Working Group",
	"予算委員会第八分科会":"Budget Committee, Eighth Working Group",
	"予算委員会第六分科会":"Budget Committee, Sixth Working Group"
};
