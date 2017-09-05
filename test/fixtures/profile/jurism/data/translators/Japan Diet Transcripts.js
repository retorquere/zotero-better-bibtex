{
	"translatorID":"ad3a50fa-4f2f-4ca8-9fdf-eabc03f3fc57",
	"translatorType":4,
	"label":"Japanese Diet Committee Transcripts",
	"creator":"Frank Bennett",
	"target":"http://kokkai.ndl.go.jp/cgi-bin/KENSAKU/swk_dispdoc_speaker.cgi",
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2009-02-08 14:14:54"
}

function detectWeb(doc, url) {
	res = doc.evaluate('//tr/td//input[@name="IS_HIT"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (res) {
		return "multiple"
	}
}

url_base = 'http://kokkai.ndl.go.jp';
text_url_base = url_base+"/cgi-bin/KENSAKU/swk_dispdoc_text.cgi";

NDL = function ( newDoc ) {
	this.colmap = new Array();
	this.newDoc = newDoc;
}

NDL.prototype.setCol = function ( pos ) {
    res = this.newDoc.evaluate('//tr/th[1][contains(text(),"No")]/following-sibling::th['+pos+']', this.newDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (res) {
		var key = res.textContent.replace(/^\s+/,"").replace(/\s+$/,"");
		this.colmap.push(key);
	} else {
		this.colmap.push('XX');
	}
}

NDL.prototype.setCols = function() {
	for ( i=1; i<7; i++ ) {
		this.setCol(i);
	}
}

NDL.prototype.getCol = function ( s ) {
	var pos = this.colmap.indexOf(s);
	if ( pos > -1 ){
		pos++;
		return pos;
	} else {
		return 0;
	}
}

function stripCruft( s ) {
	return s.replace(/^\'/,"").replace(/\'$/,"");
}

function getLinkInfo( s ) {
	var data = s.replace(/.*UpdateTextFromList\(/,"").replace(/\).*/,"").split(",");
	var data = data.slice(1,3);
	data[0] = stripCruft(data[0]);
	return data;
}

function padding( s ) {
	var pad = '000';
	var padlen = pad.length - s.length;
	return pad.slice(0,padlen)+s;
}

function setTranslation(item, varname, s) {
	item[varname] = s;
	if (t = translations[s]) {
		ZU.setMultiField(item, varname, t, "en");
	}
}

dateOffset = { "明治":"1867", "大正":"1911", "昭和":"1925", "平成":"1988" }

function convertDate ( d ) {
	if (match = d.match(/(明治|大正|昭和|平成)([0-9]+)年([0-9]+)月([0-9]+)日/)) {
		year = parseInt(match[2], 10) + parseInt( dateOffset[match[1]], 10);
		month = match[3];
		day = match[4];
		return year + "-" + month + "-" + day;
	}
	return d;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var speakers_url = doc.location.href;
		var index_url = speakers_url.replace(/dispdoc_speaker/, "list");
		if ( match = speakers_url.match(/.*DPOS=([0-9]+).*/,'\1') ) {
			hit_number = padding( match[1] );
		} else {
			hit_number = '000';
		}
		items_data = new Object();
		items_select = new Object();
		var rows = doc.evaluate('//tr/td//input[@name="IS_HIT"]//ancestor::tr[1]//img//ancestor::tr[1]/td[3]//a', doc, null, XPathResult.ANY_TYPE, null);
		while (anchor = rows.iterateNext()) {
			var link_info = getLinkInfo( anchor.getAttribute("onClick") );
			var text_url_params = link_info[0];
			var statement_pos = link_info[1];
			items_data[statement_pos] = new Object();
			items_data[statement_pos]['text_url'] = text_url_base+text_url_params+"&PPOS="+statement_pos;
			items_data[statement_pos]['speaker'] = anchor.textContent.replace(/.*]/,"");
			items_data[statement_pos]['index_url'] = index_url+"&MYOWNINDEX="+statement_pos;
			items_select[statement_pos] = anchor.textContent;
		}
		items = Zotero.selectItems(items_select);
		urls = new Array();
		ndl = false;
		for (i in items) {
			var new_url = items_data[i]["index_url"];
			var m = index_url.match(/DPOS=([0-9]+)/);
			if (m) {
				var dpos = parseInt(m[1],10);
				var dpage =  parseInt(((dpos-1)/20),10)+1;
				new_url = new_url+"&DPAGE="+dpage;
			}
			urls.push(new_url);
		}
	}

	Zotero.Utilities.processDocuments(urls, function(newDoc, url) {
		var item = new Zotero.Item("hearing");
        item.jurisdiction = "jp";
		var pos = "0";
		var m = newDoc.location.href.match(/.*MYOWNINDEX=([0-9]+).*/);
		if (m) {
			pos = m[1];
		}
		//
		// These details come in from the speakers list
        // XXX this has been abandoned: just label the attachments and let user flag
        // XXX the speaker in parentheticals etc.
		//item.creators.push( {lastName:items_data[pos]['speaker'], creatorType:"contributor"});
		//item.statementNumber = pos;
		//
		// The rest are scraped from the index page
		// Number of columns varies (of course!).  build a map before
		// extracting.  Column 1 is assumed to be No, for number.
		if ( ! ndl ) {
			var ndl = new NDL(newDoc);
			ndl.setCols();
		}

		var session = newDoc.evaluate('//tr/td[1][contains(text(),"'+hit_number+'")]/following-sibling::td['+ndl.getCol("回次")+']', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var legislativeBody = newDoc.evaluate('//tr/td[1][contains(text(),"'+hit_number+'")]/following-sibling::td['+ndl.getCol("院名")+']', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var committee = newDoc.evaluate('//tr/td[1][contains(text(),"'+hit_number+'")]/following-sibling::td['+ndl.getCol("会議名")+']', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var meetingNumber = newDoc.evaluate('//tr/td[1][contains(text(),"'+hit_number+'")]/following-sibling::td['+ndl.getCol("号数")+']', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var date = newDoc.evaluate('//tr/td[1][contains(text(),"'+hit_number+'")]/following-sibling::td['+ndl.getCol("開会日付")+']', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		//
		//item.title = "Diet Hearing";
		setTranslation(item, "committee", committee);
		setTranslation(item, "legislativeBody" , legislativeBody);
		item.session = session;
		item.meetingNumber = meetingNumber.replace(/号/,"");
		item.date = convertDate(date);
		item.url = url_base+"/";

        var speaker = items_select[pos];

        ZU.processDocuments(
            [items_data[pos]['text_url']],
            function (doc, url) {
                var body = doc.getElementsByTagName("body")[0];
                var html = body.innerHTML;
                var lst = html.split("\n");
                for (var i=lst.length-1;i>-1;i+=-1) {
                    if (lst[i].match(/.*<br\s*\/*>\s*/)) {
                        lst[i] = lst[i].replace(/<[^>]+>/g,"").replace(/^(○)(.*?)([　 ])/,"$1<b>$2</b>$3").replace(/^[　 ]/,"");
                    } else {
                        lst = lst.slice(0,i).concat(lst.slice(i+1));
                    }
                }
                html = '<div class="mlz-block"><div class="mlz-first">' + lst.join('</div>\n<div class="mlz-subsequent">') + '</div></div>';

                var myns = "http://www.w3.org/1999/xhtml"
                var block = doc.createElementNS(myns, "div");
                block.innerHTML = html;

                // head (title and css)
                var head = doc.createElementNS(myns, "head");
                var titlenode = doc.createElementNS(myns, "title");
                head.appendChild(titlenode)
                var pagetitle = item.legislativeBody + item.committee + " (" + item.date + ")"
                titlenode.appendChild(doc.createTextNode("国会会議録検索システム："+pagetitle));
                
                var style = doc.createElementNS(myns, "style");
                head.appendChild(style)
                style.setAttribute("type", "text/css")
                var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;max-width:95%;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}div.mlz-block{margin:1em 0 1em 1em;}div.mlz-first{text-indent:-1em;margin-bottom:1em;}div.mlz-subsequent{margin-bottom:1em;}";
                style.appendChild(doc.createTextNode(css));


                // Block URLs in recomposed document.
                var mydoc = ZU.composeDoc(doc, head, block, true);
		        item.attachments = [
			        {document:mydoc, title:speaker, snapshot:true, url:"http://example.com"},
		        ];
		        item.complete();
            },
            function () {
                Zotero.done();
            }
        );

	}, function() {Zotero.done();});
}

//
// this is only the current list, the full historical list from session 1 would be much larger.
// would need some parsing to save repetition if this is ever to be expanded.
translations = {
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
}
