{
	"translatorID": "c216ae06-da95-4fd0-bce8-38de1f6cf17c",
	"label": "Peeters",
	"creator": "Timotheus Kim",
	"target": "^https?://(www\\.)?poj\\.peeters-leuven\\.be/content\\.php",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-27 05:23:49"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Timotheus Chang-Whae Kim, Johannes Ruscheinski, Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('url=article')) {
		return "journalArticle";
	} else if (url.includes('url=issue') && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('tr');
	for (let i=0; i<rows.length; i++) {
		let href = attr(rows[i], 'td a', 'href');
		let title = text(rows[i], 'td', 1);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function ALLCaps(name) {
	return name === name.toUpperCase();
}


// Concatenate the values of all nodes until a BR or B tag respecting the HTML formatting
function getValue(nodes) {
	var value = "";
	for (let part of nodes) {
		if (part.tagName=="BR" || part.tagName=="B") break;
		value += ' ';
		if (part.tagName) {
			value += part.outerHTML;
		} else {
			value += part.textContent.trim();
		}
	}
	return value;
}


function scrape(doc, url) {
	var item = new Z.Item('journalArticle');
	
	var titleNodes = ZU.xpath(doc, '//b[contains(text(), "Title:")]/following-sibling::node()');
	item.title = getValue(titleNodes);
	var subtitleNodes = ZU.xpath(doc, '//b[contains(text(), "Subtitle:")]/following-sibling::node()');
	var subtitle = getValue(subtitleNodes);
	if (subtitle) {
		item.title += ': ' + subtitle;
	}
	
	// e.g. Author(s): HANDAL, Boris , WATSON, Kevin , ..., VAN DER MERWE, W.L.
	// but sometimes the space before the comma is also missing
	var authors = ZU.xpathText(doc, '//b[contains(text(), "Author(s):")]/following-sibling::text()[1]');
	if (authors) {
		authors = authors.split(',');
	}
	var creator;
	for (let i=0; i<authors.length; i++) {
		let name = authors[i];
		if (ALLCaps(name)) name = ZU.capitalizeTitle(name, true);
		if (i%2===0) {// last name
			creator = {
				creatorType: 'author',
				lastName: ZU.capitalizeTitle(name, true)
			};
		} else {// first name
			creator.firstName = name;
			item.creators.push(creator); 
		}
	}

	item.publicationTitle = ZU.xpathText(doc, '//b[contains(text(), "Journal:")]/following-sibling::a[1]');
	item.volume = ZU.xpathText(doc, '//b[contains(text(), "Volume:")]/following-sibling::a[1]');
	item.issue = ZU.xpathText(doc, '//b[contains(text(), "Issue:")]/following-sibling::text()[1]');
	item.date = ZU.xpathText(doc, '//b[contains(text(), "Date:")]/following-sibling::text()[1]');
	item.pages = ZU.xpathText(doc, '//b[contains(text(), "Pages:")]/following-sibling::text()[1]');
	item.DOI = ZU.xpathText(doc, '//b[contains(text(), "DOI:")]/following-sibling::text()[1]');
	item.abstractNote = ZU.xpathText(doc, '//b[contains(text(), "Abstract :")]/following-sibling::text()[1]');
	
	item.attachments.push({
		url: url,
		title: "Snapshot",
		mimeType: "text/html"
	});
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://poj.peeters-leuven.be/content.php?url=issue&journal_code=EP&issue=3&vol=24",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3269042&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Choosing to be Changed: Revelation, Identity and the Ethics of Self-Transformation",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Mcqueen",
						"firstName": " Paddy"
					}
				],
				"date": "2017",
				"DOI": "10.2143/EP.24.4.3269042",
				"abstractNote": "How should one decide whether to undergo an experience that changes who one is? In her discussion of ‘transformative experiences’, L.A. Paul argues that to choose rationally when deliberating first-personally, one should base one’s decision on ‘revelation’, i.e. to discover out what the experience will be like. If this solution is taken as the sole means by which a transformative choice is made, then I argue it is problematic. This is because (i) it overlooks the role that one’s practical identity ought to play when making a major life decision; and (ii) it ignores morally relevant reasons for action. Even if we retain the revelation approach as only part of the means through which a transformative choice is made, I argue that revelation should frequently carry little weight in our decision-making. Rather than focusing on the subjective quality of future experiences, it is often preferable to reflect on who one is and what one’s endorsed practical identity commits one to.",
				"issue": "4",
				"libraryCatalog": "Peeters",
				"pages": "545-568",
				"publicationTitle": "Ethical Perspectives",
				"shortTitle": "Choosing to be Changed",
				"volume": "24",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article.php&id=3269043&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Recognizing and Emulating Exemplars",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Compaijen",
						"firstName": " Rob"
					}
				],
				"date": "2017",
				"DOI": "10.2143/EP.24.4.3269043",
				"abstractNote": "In the present contribution I explore what is involved in recognizing and emulating exemplars, and I do so by critically engaging with the view – recently forwarded by Linda T. Zagzebski – that admiration is the key to understanding these issues. While I believe that recognizing exemplars typically involves admiration, I do not think it is sufficient. Instead, I suggest, understanding what is involved in the recognition and emulation of exemplars requires a richer account. I develop my argument in three steps. First, I engage with Zagzebski’s exemplarist moral theory and elaborate her understanding of the relationship between admiration and exemplarity on the basis of her recent work on the topic. Second, I argue why I believe that we cannot understand the recognition and emulation of exemplars by reference to admiration alone. Third, I elaborate my own account of what is involved in recognizing and emulating exemplars, which involves self-awareness, the possibility of identifying with the exemplar, and what I call ‘motivational continuity’.",
				"issue": "4",
				"libraryCatalog": "Peeters",
				"pages": "569-593",
				"publicationTitle": "Ethical Perspectives",
				"volume": "24",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article.php&id=3269044&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Cognitivist Prescriptivism",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Alwood",
						"firstName": " Andrew H."
					}
				],
				"date": "2017",
				"DOI": "10.2143/EP.24.4.3269044",
				"abstractNote": "Metaethical cognitivism allegedly has trouble explaining how moral judgments are practical, because it claims that moral thoughts are beliefs that need not involve motivation. But motivation is not necessary to meet the practicality criterion on theories of moral thought and talk. A cognitivist about moral thought can adopt a prescriptivist account of moral talk, in a hybrid theory that supplements descriptive moral meanings in order to achieve interesting advantages over traditional descriptivist and expressivist theories as well as over other hybrid theories. This hybrid cognitivist-prescriptivist theory makes sense of amoralists who have moral judgments but no motivation, and offers a new diagnosis of why their use of moral language is infelicitous.",
				"issue": "4",
				"libraryCatalog": "Peeters",
				"pages": "595-623",
				"publicationTitle": "Ethical Perspectives",
				"volume": "24",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3127266&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "'Thank God I Failed': How Much Does a Failed Murder Attempt Transform the Agent?",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Cowley",
						"firstName": " Christopher"
					}
				],
				"date": "2015",
				"DOI": "10.2143/EP.22.4.3127266",
				"abstractNote": "Peter Winch writes: 'One who fails in his attempt to commit a murder and who undergoes a change of heart might subsequently come to thank God that he failed. It is pertinent for us to ask what precisely he has to thank God for' (1971, 144). The first answer to this question is that the thwarted attempter is relieved not to have become a murderer. In exploring the nature of this becoming, I consider and reject a ‘subjectivist’ account, according to which the attempter has already ‘become’ a murderer in virtue of his or her sincerely murderous intentions and plans. And yet clearly the attempter has lost something of the innocence that would make murder morally unthinkable. He or she thereby inhabits a curious kind of metaphysical limbo between innocence and guilt, between transformation and self-discovery, between ignorance and knowledge.",
				"issue": "4",
				"libraryCatalog": "Peeters",
				"pages": "523-545",
				"publicationTitle": "Ethical Perspectives",
				"shortTitle": "'Thank God I Failed'",
				"volume": "22",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=issue&journal_code=EP&issue=1&vol=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=630100&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An Ethical Agenda for Europe: Fundamental Problems on Practical Ethics in a Christian Perspective",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Verstraeten",
						"firstName": " Johan"
					}
				],
				"date": "March 1994",
				"DOI": "10.2143/EP.1.1.630100",
				"abstractNote": "Today, applied ethics confronts many problems: technological and biomedical innovations, crisis of the welfare state, rising unemployment, migration and xenophobia. These and the changes accompanying them are, in themselves, important objects of study.",
				"issue": "1",
				"libraryCatalog": "Peeters",
				"pages": "3-12",
				"publicationTitle": "Ethical Perspectives",
				"shortTitle": "An Ethical Agenda for Europe",
				"volume": "1",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=issue&journal_code=LV&issue=1&vol=73",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3281475&journal_code=LV",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "De Medellín à nos jours: Quelle place pour la catéchèse en Amérique latine?",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Jiménez Rodríguez",
						"firstName": " Manuel José"
					}
				],
				"date": "2018",
				"DOI": "10.2143/LV.73.1.3281475",
				"abstractNote": "currently not available",
				"issue": "1",
				"libraryCatalog": "Peeters",
				"pages": "33-41",
				"publicationTitle": "Lumen Vitae",
				"shortTitle": "De Medellín à nos jours",
				"volume": "73",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3251316&journal_code=LV",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Laisser la Parole de Dieu faire son travail: Un défi pour le lecteur des Écritures",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Raimbault",
						"firstName": " Christophe"
					}
				],
				"date": "2017",
				"DOI": "10.2143/LV.72.4.3251316",
				"abstractNote": "Trop souvent, on parle indistinctement de Bible et de Parole de Dieu. Or, la Bible n’est pas spontanément Parole de Dieu: elle le devient. L’enjeu est important. Dieu se révèle comme Parole incarnée, comme Parole adressée, comme une Bonne Nouvelle qui nous concerne et nous implique. Mais hélas certains textes bibliques ne nous parlent pas. Ils sont trop difficiles, ou trop violents, ou trop rabâchés pour être relus, ou pas lus du tout… Et pourtant, ils font partie de la Bible, dont l’inerrance et la canonicité sont incontestables. Nous trouverons ici quelques pistes pour que, de ces textes, émerge une Parole quand même. En tout état de cause, quel que soit le passage biblique lu et étudié, le lecteur qui s’astreint à une lecture attentive et à un travail sur le texte est assuré que Dieu ne restera pas sans lui parler.",
				"issue": "4",
				"libraryCatalog": "Peeters",
				"pages": "371-382",
				"publicationTitle": "Lumen Vitae",
				"shortTitle": "Laisser la Parole de Dieu faire son travail",
				"volume": "72",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3281483&journal_code=LV",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mission et œcuménisme: de la concurrence à la collaboration?: 9e Forum bilingue «Fribourg Église dans le monde», Université de Fribourg, les 12-13 octobre 2017",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Amherdt",
						"firstName": " François-Xavier"
					}
				],
				"date": "2018",
				"DOI": "10.2143/LV.73.1.3281483",
				"abstractNote": "currently not available",
				"issue": "1",
				"libraryCatalog": "Peeters",
				"pages": "109-113",
				"publicationTitle": "Lumen Vitae",
				"shortTitle": "Mission et œcuménisme",
				"volume": "73",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3248537&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "HREC Members' Personal Values Influence Decision Making in Contentious Cases",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Handal",
						"firstName": " Boris "
					},
					{
						"creatorType": "author",
						"lastName": "Watson",
						"firstName": " Kevin "
					},
					{
						"creatorType": "author",
						"lastName": "Brewer",
						"firstName": " Keagan"
					},
					{
						"creatorType": "author",
						"lastName": "Fellman",
						"firstName": " Marc "
					},
					{
						"creatorType": "author",
						"lastName": "Maher",
						"firstName": " Marguerite "
					},
					{
						"creatorType": "author",
						"lastName": "Ianiello",
						"firstName": " Hannah "
					},
					{
						"creatorType": "author",
						"lastName": "White",
						"firstName": " Miya"
					}
				],
				"date": "2017",
				"DOI": "10.2143/EP.24.3.3248537",
				"abstractNote": "This article identifies 14 contentious issues faced by Human Research Ethics Committees (HRECs). The authors argue that HREC members will respond variably to these issues based on their own fundamental values and worldview. In particular, we propose that personal interpretations of current ethics regulations and HREC members’ attitudes to consequentialism, Kantianism, and utilitarianism in some cases affect their responses to contentious research issues. We seek to promote understanding of how personal and professional backgrounds of HREC reviewers influence their approaches to value-laden issues embedded in ethics applications. Taking the form of a literature review, our contribution highlights the need for further exploration of how HREC members make decisions, and what factors influence the outcomes of ethics applications.",
				"issue": "3",
				"libraryCatalog": "Peeters",
				"pages": "405-439",
				"publicationTitle": "Ethical Perspectives",
				"volume": "24",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=issue&journal_code=EP&issue=3&vol=24",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=563038&journal_code=EP",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Philosophy and the Multi-Cultural Context of (Post)Apartheid South Africa",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Van Der Merwe",
						"firstName": "W.l."
					}
				],
				"date": "July 1996",
				"DOI": "10.2143/EP.3.2.563038",
				"issue": "2",
				"libraryCatalog": "Peeters",
				"pages": "76-90",
				"publicationTitle": "Ethical Perspectives",
				"volume": "3",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://poj.peeters-leuven.be/content.php?url=article&id=3256900&journal_code=BYZ",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Unedited <i>Life</i> of St John Chrysostom by Nicetas David the Paphlagonian:  <i>Editio princeps</i> , Part I",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Antonopoulou",
						"firstName": " Theodora"
					}
				],
				"date": "2017",
				"DOI": "10.2143/BYZ.87.0.3256900",
				"abstractNote": "The paper presents the first ever edition of the first half (chapters 1-28) of the long",
				"libraryCatalog": "Peeters",
				"pages": "1-67",
				"publicationTitle": "Byzantion",
				"shortTitle": "The Unedited <i>Life</i> of St John Chrysostom by Nicetas David the Paphlagonian",
				"volume": "87",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
