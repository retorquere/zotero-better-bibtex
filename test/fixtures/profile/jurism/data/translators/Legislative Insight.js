{
	"translatorID": "2bedae3c-bab5-447f-b127-e9babc0e9cfe",
	"label": "Legislative Insight",
	"creator": "Kari Hemdal",
	"target": "^https?://(preprod\\.)?li\\.proquest\\.com/legislativeinsight/LegHistMain\\.jsp",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2016-03-14 15:46:49"
}

/*
	ProQuest Legislative Insight
	
	Copyright (C) 2012  Kari Hemdal 
	
	ProQuest Legislative Insight is a Federal legislative history service that makes available thoroughly researched compilations of digital full text publications created by Congress during the process leading up to the enactment of U.S. Public Laws

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/



function detectWeb(doc, url) {
	  
		return "multiple";       
}


function getSingleType(doc,url)
{
		var myXPath = '//div[@id="docpageid"]';
		var myXPathObject = doc.evaluate(myXPath, doc, null, XPathResult.ANY_TYPE, null);    
		var type;
		
		if (type = myXPathObject.iterateNext()) 
		{        
			type = type.firstChild.textContent;            
			return type;
		}
		else
		{
			return "";
		}

}

function containsSearchResult(doc, url)
{	
		var myXPath = '//div[@class="results-title"]/a';
		var myXPathObject = doc.evaluate(myXPath, doc, null, XPathResult.ANY_TYPE, null);    
		var headers;
	
	
		if (headers = myXPathObject.iterateNext()) 
		{            
			return true;
		}
		else
		{
			return false;
		}

}

function getType(t)
{
	return t.substring(t.indexOf(":")+1,t.length);
}

function doLDOC(doc, url, st, showTop) {

	var articles = new Array();
	var items = new Object();
	var headers;
	var restype;
	var count = 0;
	
	
	if (showTop)
	{
		var sz = st.split("|");        
		var accNoZ = sz[0];
		var pubLawZ = sz[1];
		var typeZ = sz[2];    
		var typeTextZ = sz[3];        
		var idz = accNoZ+"|"+pubLawZ+"|"+typeZ+"|"+typeTextZ;                                           
		items[idz] = "Legislative History of " + accNoZ;                    
		count++;
		idz = accNoZ+"FT|"+pubLawZ+"|PUBLIC_LAW|"+typeTextZ;
		items[idz] = "Public Law: " + accNoZ;                    
		count++;
	}
		
	
	
		var myXPath = '//a[contains(@onclick, "ldoc(")]';
		var myXPathObject = doc.evaluate(myXPath, doc, null, XPathResult.ANY_TYPE, null);    
				
	
		while (headers = myXPathObject.iterateNext()) 
		{               
			var onclick = headers.getAttribute("onclick")            
			var pos = onclick.indexOf("ldoc('");            
			onclick = onclick.substring(pos+5,onclick.indexOf("')",pos+5)+1);                        
			var s = onclick.split(",");
							
			var pubLaw = s[0].substring(1,s[0].length-1);
			var accNo = s[1].substring(1,s[1].length-1);
			var type = s[2].substring(1,s[2].length-1);
					
			var typeText = headers.getAttribute("title");       
			if (typeText)
			{                
				var id = accNo+"|"+pubLaw+"|"+type+"|"+typeText;                                            
				items[id] = typeText;                    
				count++;
			}
		}
			
		if (count > 0)
		{
			items = Zotero.selectItems(items);
			for (var i in items) 
			{                         
				var s = i.split("|");
				var accNo = s[0];
				var pubLaw = s[1];
				var type = s[2];    
				var typeText = s[3];            
				process(accNo, pubLaw,type,typeText);
			}
		}   
	
	

}


function doWeb(doc, url) {


	var st = getSingleType(doc,url)
	if (st != "")
	{        
		var s = st.split("|");     
		var accNo = s[0];
		var pubLaw = s[1];
		var type = s[2];    
		var typeText = s[3];        
		
		if (type == "LEG_HIST")
			doLDOC(doc,url,st,accNo != null && accNo != "");
		else if (type == "BILL_DOC" || type == "LEG_PROC")
			doLDOC(doc,url,st,false);
		else
			process(accNo, pubLaw,type,typeText);
		return;
	}
		
	var articles = new Array();
	var items = new Object();
	var headers;
	var restype;
	var count = 0;
	
	if (detectWeb(doc, url) == "multiple") 
	{   
		var myXPath = '//div[@class="results-title"]/a';
		var myXPathObject = doc.evaluate(myXPath, doc, null, XPathResult.ANY_TYPE, null);    
		
		var myXPath2 = '//div[@class="results-type"]';
		var myXPathObject2 = doc.evaluate(myXPath2, doc, null, XPathResult.ANY_TYPE, null);    
	
	
		while (headers = myXPathObject.iterateNext()) 
		{            
			var onclick = headers.getAttribute("onclick");                        
			onclick = onclick.substring(onclick.indexOf("('")+1,onclick.indexOf("')")+1);            
			var s = onclick.split(",");
							
			var pubLaw = s[0].substring(1,s[0].length-1);
			var accNo = s[1].substring(1,s[1].length-1);
			var type = s[2].substring(1,s[2].length-1);
			
			restype = myXPathObject2.iterateNext();
			var typeText = getType(restype.firstChild.textContent);            
			var id = accNo+"|"+pubLaw+"|"+type+"|"+typeText;                                    
			items[id] = typeText + ": " + headers.parentNode.textContent;                    
			count++;
		}
		
		if (count > 0)
		{

			Zotero.selectItems(items, function (items) {
				if (!items) {
					return true;
				}
				
				for (var i in items) 
				{            
					Zotero.debug(i);
					var s = i.split("|");
					var accNo = s[0];
					var pubLaw = s[1];
					var type = s[2];    
					var typeText = s[3];            
					process(accNo, pubLaw,type,typeText);
				}
			})
		}   
	}
	

}

function addCommon(newItem, obj, typeText)
{    
	Zotero.debug(obj.pdfURL);
	newItem.title = obj.title;
	newItem.url = obj.url;  
	newItem.language = obj.language;
	newItem.attachments.push({
	title:obj.pdfTitle,
	mimeType:"application/pdf",
	url:obj.pdfURL});        
}

function addLegislativeHistory(obj, typeText)
{
	
	var newItem = new Zotero.Item("document");
	addCommon(newItem,obj,typeText);    
	newItem.date = obj.dateEnacted;
	newItem.title = "Legislative History of Public Law " + obj.publicLawNumber +": " + obj.title;
	newItem.abstractNote = obj.abstractNote;            
		
	newItem.complete();                                                                                        
}


function addStatute(obj, typeText)
{                                       
	var newItem = new Zotero.Item("statute");
	addCommon(newItem,obj,typeText);    
	newItem.publicLawNumber = obj.publicLawNumber;    
	newItem.session = obj.session;    
	newItem.dateEnacted = obj.dateEnacted;
	newItem.nameOfAct = obj.title;
	newItem.abstractNote = obj.abstractNote;    
			
	newItem.complete();                                                                                        
}

function addHearing(obj, typeText)
{    
	var newItem = new Zotero.Item("hearing");    
	addCommon(newItem,obj,typeText);  
	newItem.documentNumber = obj.documentNumber;    
	newItem.legislativeBody = obj.legislativeBody;
	newItem.session = obj.session;
	newItem.date = obj.date;
	newItem.committee = obj.committee;
	newItem.complete();                                                                                        
}

function addBill(obj, typeText)
{    
	var newItem = new Zotero.Item("bill");    
	addCommon(newItem,obj,typeText);    
	newItem.billNumber = obj.billNumber;
	newItem.date = obj.date;
	newItem.legislativeBody = obj.legislativeBody;
	newItem.session = obj.session;
	newItem.complete();                                                                                        
}

function addReport(obj, typeText)
{    
	var newItem = new Zotero.Item("report");    
	addCommon(newItem,obj,typeText);        
	newItem.date = obj.date;
	newItem.reportType = obj.reportType;
	newItem.reportNumber = obj.reportNumber;
	newItem.callNumber = obj.ID;
	newItem.libraryCatalog = "";
	newItem.complete();                                                                                        
}

function addPresidentialSigning(obj, typeText)
{    
	var newItem = new Zotero.Item("document");    
	addCommon(newItem,obj,typeText);        
	newItem.date = obj.date;        
	newItem.creators.push(Zotero.Utilities.cleanAuthor(obj.author, "author"));
	newItem.complete();                                                                                        
}

function addCongressionalRecord(obj, typeText)
{    
	var newItem = new Zotero.Item("document");    
	addCommon(newItem,obj,typeText);                    
	newItem.date = obj.date;    
	newItem.abstractNote = obj.abstract;            
	newItem.complete();                                                                                        
}



function getItemType(type)
{
	if (type == "LEG_HIST")
		return "multiple";
	else if (type == "BILL_DOC")
		return "multiple";
	else if (type == "LEG_PROC")
		return "multiple";
	else if (type == "BILL_VERSION")
		return "bill";
	else if (type == "PUBLIC_LAW")
		return "statute";
	else if (type == "REPORT" || type == "DOCUMENT" || type == "PRINT" || type == "MISC_PUB")
		return "report";
	else if (type == "HEARING")
		return "hearing";
	else if (type == "PRES_SIGN_STMT" || type == "CONGRESSIONAL_RECORD")
		return "document";
	else
		return "";
		
}





function process(accNo, pubLaw, type, typeText) 
{
		
		var url = "Zotero?accNo="+accNo+"&pubLaw="+pubLaw+"&type="+type;          
		
		Zotero.Utilities.HTTP.doGet(url, 
									function(text, response, url){       
										var i;
										var obj;
										
										var objarr = JSON.parse(text);
										
										for (i=0; i < objarr.length; i++)
										{
											obj = objarr[i];

											if (obj.item == "legislativehistory")
											{            
												addLegislativeHistory(obj,typeText);                                        
											}                                            
											else if (obj.item == "statute")
											{
												addStatute(obj,typeText);                                        
											}
											else if (obj.item == "hearing")
											{
												addHearing(obj,typeText);
											}
											else if (obj.item == "bill")
											{
												addBill(obj,typeText);
											}                     
											else if (obj.item == "report")
											{
												addReport(obj,typeText);
											}
											else if (obj.item == "presidentialsigning")
											{
												addPresidentialSigning(obj,typeText);
											}
											else if (obj.item == "congressionalrecord")
											{                                             
												addCongressionalRecord(obj,typeText);
											}
										}
									}, 
									function() {Zotero.done(); }, null);
		 

}
