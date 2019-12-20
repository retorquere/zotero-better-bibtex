{
	"translatorID": "a41fc438-1644-4313-ad1e-0ed7d1977937",
	"label": "Mongolia Court Judgments",
	"creator": "Frank Bennett",
	"target": "https?:\\/\\/(?:old|new|www|shine)\\.shuukh\\.mn\\/(eruu|irgen|zahirgaa)(anhan|davah|hyanalt)\\/?([0-9]+\\/)?(view|\\\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-11-19 09:16:15"
}

urlRegExp = new RegExp("https?://(?:old|www|shine)\\.shuukh\\.mn/(?:eruu|irgen|zahirgaa)(?:anhan|davah|hyanalt)/?(?:[0-9]+/)*(view|\\?)");

function detectWeb(doc, url) {
	var m = urlRegExp.exec(url, urlRegExp);
	if (m) {
		if (m[1] === 'view') {
			return "case";
		} else {
			return "multiple";
		}
	}
	return false;
}

function doWeb(doc,url) {
	if (detectWeb(doc, url) === 'case') {
		scrape(doc, url);
	} else {
		var list = ZU.xpath(doc, '//div[@id="shiidver-list"]//tbody//tr');
		var items = {};
		for (var i=0,ilen=list.length;i<ilen;i++){
			var url = ZU.xpathText(list[i], './/td[1]//a[1]/@href');
			var date = ZU.xpathText(list[i], './/td[1]');
			var number = ZU.xpathText(list[i], './/td[2]');
			var plaintiff = ZU.xpathText(list[i], './/td[5]');
			items[url] = date + ' ' + number + ' ' + plaintiff;
		}
		Zotero.selectItems(items, function(selectedItems){
			if (!selectedItems) return true;
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	}
}

function combineNames(plaintiff, defendant, shorten) {
	var ret = [];
	if (shorten) {
		plaintiff = shortenName(plaintiff);
		defendant = shortenName(defendant);
	}
	if (plaintiff) {
		ret.push(plaintiff);
	}
	if (defendant) {
		ret.push(defendant)
	}
	return ret.join(" ба ");
}

function scrape (doc, url) {
	var item = new Zotero.Item("case");
	item.jurisdiction = 'mn';
	item.dateDecided = getValue(doc, "Oгноо");
	var tags = getValue(doc, "Маргааны төрөл");
	if (tags) {
		item["tags"] = tags.split(/,\s*/);
	}
	item.type = getValue(doc, "Шийдвэрийн төрөл");
	item.abstractNote = getValue(doc, "Шийдвэрийн товч");
	addJudges(doc, item, "Шүүгч");
	var plaintiff = getValue(doc, "Нэхэмжлэгч");
	var defendant = getValue(doc, "Хариуцагч");
	if (!defendant) {
		defendant = getValue(doc, "Шүүгдэгч");
	}
	item.title = combineNames(plaintiff, defendant);
	item.titleShort = combineNames(plaintiff, defendant, true);
	item.court = getValue(doc, "Шүүх");
	item.docketNumber = getValue(doc, "Дугаар");

	item.callNumber = getValue(doc, "төрөл", true);
	if (!item.callNumber && url.match(/eruu/))  {
		item.callNumber = "шийдвэрийн төрөл";
	}
	item.date = getValue(doc, "Огноо");
	//addToNote(doc, item, "Шийдвэрийн төрөл");
	//addToNote(doc, item, "Хүчинтэй эсэх");
	addToNote(doc, item, "байдал");
	addToNote(doc, item, "Хэргийн индекс");
	item.url = url.replace(/#$/, "");
	var block = getNode(doc, "товч");
	if (block) {
		var title = item.court 
			+ ", " + item.callNumber + " " + item.docketNumber
			+ ", " + item.date
		makeAttachment(doc, item, title, block);
	}
	item.complete();
}

function getValue(doc, label, firstNode){
	if (firstNode) {
		doc = ZU.xpath(doc, '//div[@id="shiidver-detail"]//tbody/tr[1]');
	}
	var ret = ZU.xpath(doc, './/th[contains(text(),"' + label + '")]/following-sibling::td');
	if (!ret) {
		ret = ZU.xpath(doc, './/th[contains(text(),"' + label.toLowerCase() + '")]/following-sibling::td');
	}
	if (ret[0]) {
		ret = ret[0].textContent;
	} else {
		ret = "";
	}
	if (ret) {
		ret = ret.replace(/\s+/g, " ").trim();
	}
	return ret ? ret : "";
}

function addJudges(doc, item, label){
	var labelVal = getValue(doc, label);
	if (!labelVal) return;
	var names = labelVal.split(/,\s+/);
	for (var i=0,ilen=names.length;i<ilen;i++) {
		var namePos = names[i].indexOf(" ");
		if (namePos > -1) {
			var family = names[i].slice(0, namePos).trim();
			var given = names[i].slice(namePos).trim();
			item.creators.push({
				creatorType: "author",
				lastName: family ? family : given,
				firstName: family ? given : given,
				fieldMode: family ? 0 : 1
			});
		}
	}
}

function addTag(doc, item, label) {
	var labelVal = getValue(doc, label);
	if (labelVal) {
		item.tags.push(labelVal);
	}
}

function addToNote(doc, item, label) {
	var labelVal = getValue(doc, label);
	if (item.extra) {
		item.extra += ', ' + labelVal;
	} else {
		item.extra = labelVal;
	}
}

function shortenName(name) {
	if (!name) return "";
	if (name.indexOf("аймгийн") > -1) {
		name = name.split(/[\-\s]+/);
		for (var i=0,ilen=name.length;i<ilen;i++) {
			if (name[i] === "аймгийн") {
				name[i] = " ";
			} else {
				name[i] = name[i].slice(0, 1).toUpperCase();
			}
		}
		name = name.join("");
	}
	return name;
}

function getNode(doc, label) {
	var ret = ZU.xpath(doc, '//th[contains(text(),"' + label + '")]/following-sibling::td');
	if (!ret) {
		ret = ZU.xpath(doc, '//th[contains(text(),"' + label.toLowerCase() + '")]/following-sibling::td');
	}
	return ret && ret.length ? ret[0] : false;
}

function makeAttachment(doc, item, title, block){
	var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}pre.inline{white-space:pre;display:inline;}span.citation{white-space:pre;}";
	// head element
	var head = doc.createElement("head");
	head.innerHTML = '<title>' + title + '</title>';
	head.innerHTML += '<style type="text/css">' + css + '</style>'; 

	var attachmentDoc = ZU.composeDoc(doc, head, block);
	item.attachments.push({
		title:"Шийдвэрийн товч", 
		document:attachmentDoc
	});

}
