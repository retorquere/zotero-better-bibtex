{
	"translatorID": "5e3ad958-ac79-463d-812b-a86a9235c28f",
	"label": "RDF",
	"creator": "Simon Kornblith",
	"target": "rdf",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"async": true,
		"dataMode": "rdf/xml"
	},
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-08 19:39:38"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2011 Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectImport() {
	// Make sure there are actually nodes
	
	var nodes = Zotero.RDF.getAllResources();
	if(nodes) {
		return true;
	}
}

var rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

var n = {
	bib:"http://purl.org/net/biblio#",
	bibo:"http://purl.org/ontology/bibo/",
	dc1_0:"http://purl.org/dc/elements/1.0/",
	dc:"http://purl.org/dc/elements/1.1/",
	dcterms:"http://purl.org/dc/terms/",
	prism:"http://prismstandard.org/namespaces/1.2/basic/",
	prism2_0:"http://prismstandard.org/namespaces/basic/2.0/",
	prism2_1:"http://prismstandard.org/namespaces/basic/2.1/",
	foaf:"http://xmlns.com/foaf/0.1/",
	vcard:"http://nwalsh.com/rdf/vCard#",
	vcard2:"http://www.w3.org/2006/vcard/ns#",	// currently used only for NSF, but is probably
							// very similar to the nwalsh vcard ontology in a
							// different namespace
	link:"http://purl.org/rss/1.0/modules/link/",
	z:"http://www.zotero.org/namespaces/export#",
	eprints:"http://purl.org/eprint/terms/",
	og:"http://ogp.me/ns#",				// Used for Facebook's OpenGraph Protocol
	article:"http://ogp.me/ns/article#",
	book:"http://ogp.me/ns/book#",
	so:"http://schema.org/",
	codemeta:"https://codemeta.github.io/terms/"
};

var callNumberTypes = [n.dcterms+"LCC", n.dcterms+"DDC", n.dcterms+"UDC"];

// gets the first result set for a property that can be encoded in multiple
// ontologies
function getFirstResults(nodes, properties, onlyOneString) {
	if (!nodes.length) nodes = [nodes];
	for (let node of nodes) {
		for(var i=0; i<properties.length; i++) {
			var result = Zotero.RDF.getTargets(node, properties[i]);
			if(result) {
				if(onlyOneString) {
					// onlyOneString means we won't return nsIRDFResources, only
					// actual literals
					if(typeof(result[0]) != "object") {
						return result[0];
					} else {
						return Zotero.RDF.getResourceURI(result[0]);
					}
				} else {
					return result;
				}
			}
		}
	}
	return;	// return undefined on failure
}

// adds creators to an item given a list of creator nodes
/**TODO: PRISM 2.0 roles for DC creator/contributor*/
function handleCreators(newItem, creators, creatorType) {
	if(!creators) {
		return;
	}
	
	if(typeof(creators[0]) != "string") {	// see if creators are in a container
		let c;
		try {
			c = Zotero.RDF.getContainerElements(creators[0]);
		} catch(e) {}
		if(c && c.length) {
			creators = c;
		}
	}

	for (let c of creators){
		let info = extractCreatorInfo(c);
		if (info) newItem.creators.push(info);
	}
	
	function extractCreatorInfo(obj){
		if (typeof obj == "string") {
			// Use comma to split if present
			return ZU.cleanAuthor(obj, creatorType, obj.includes(','));
		} else {
			let c = { creatorType: creatorType };
			c.lastName = getFirstResults(obj,
				[ n.foaf+"familyName", n.foaf+"lastName",
				  n.foaf+"surname", n.foaf+"family_name",
				  n.so+"familyName" ], true);
			c.firstName = getFirstResults(obj,
				[ n.foaf+"givenName", n.foaf+"firstName",
				  n.foaf+"givenname",
				  n.so+"givenName" ], true);
			if (!c.firstName) c.fieldMode = 1;
			if (c.firstName || c.lastName) return c;

			c = getFirstResults(obj, [n.so+"name"], true);
			if (c) return ZU.cleanAuthor(c, creatorType);
		}
	}

}

// processes collections recursively
function processCollection(node, collection) {
	if(!collection) {
		collection = [];
	}
	collection.type = "collection";
	collection.name = getFirstResults(node, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title"], true);
	collection.children = [];
	
	// check for children
	var children = getFirstResults(node, [n.dcterms+"hasPart"]);
	if (children) {
		for (var i=0; i<children.length; i++) {
			var child = children[i];
			var type = Zotero.RDF.getTargets(child, rdf+"type");
			if(type) {
				type = Zotero.RDF.getResourceURI(type[0]);
			}
			
			if(type == n.bib+"Collection" || type == n.z+"Collection") {
				// for collections, process recursively
				collection.children.push(processCollection(child));
			} else {
				if(isPart(child)) {
					Zotero.debug("Not adding child item <" + Zotero.RDF.getResourceURI(child) + "> to collection", 2);
					continue;
				}
				
				// all other items are added by ID
				collection.children.push({id:Zotero.RDF.getResourceURI(child), type:"item"});
			}
		}
	}
	return collection;
}

function processSeeAlso(node, newItem) {
	var relations = getFirstResults(node, [n.dc+"relation", n.dc1_0+"relation", n.dcterms+"relation"]);
	newItem.itemID = Zotero.RDF.getResourceURI(node);
	newItem.seeAlso = [];
	if(relations) {
		for (var i=0; i<relations.length; i++) {
			newItem.seeAlso.push(Zotero.RDF.getResourceURI(relations[i]));
		}
	}
}

function processTags(node, newItem) {
	var subjects = getFirstResults(node, [n.dc+"subject", n.dc1_0+"subject", n.dcterms+"subject"]);
	newItem.tags = [];
	if(subjects) {
		for (var i=0; i<subjects.length; i++) {
			var subject = subjects[i];
			if(typeof(subject) == "string") {	// a regular tag
				newItem.tags.push(subject);
			} else {
				// a call number
				var type = Zotero.RDF.getTargets(subject, rdf+"type");
				if(type) {
					type = Zotero.RDF.getResourceURI(type[0]);
					if(type == n.z+"AutomaticTag") {
						newItem.tags.push({tag:getFirstResults(subject, [rdf+"value"], true), type:1});
					}
				}
			}
		}
	}
}

// gets the node with a given type from an array
function getNodeByType(nodes, type) {
	if(!nodes) {
		return false;
	}
	
	if(typeof(type) == "string") {
		type = [type];
	}
	
	for (var i=0; i<nodes.length; i++) {
		var node = nodes[i];
		var nodeType = Zotero.RDF.getTargets(node, rdf+"type");
		if(nodeType) {
			nodeType = Zotero.RDF.getResourceURI(nodeType[0]);
			if(type.includes(nodeType)) {	// we have a node of the correct type
				return node;
			}
		}
	}
	return false;
}

// returns true if this resource is part of another (related by any arc besides
// dc:relation or dcterms:hasPart)
//
// used to differentiate independent notes and files
function isPart(node) {
	var arcs = Zotero.RDF.getArcsIn(node);
	var skip = false;
	for (var i=0; i<arcs.length; i++) {
		var arc = arcs[i];
		arc = Zotero.RDF.getResourceURI(arc);
		if(arc != n.dc+"relation" && arc != n.dc1_0+"relation"
			&& arc != n.dcterms+"relation" && arc != n.dcterms+"hasPart") {	
			// related to another item by some arc besides see also
			skip = true;
		}
	}
	return skip;
}

function detectType(newItem, node, ret) {
	if(!node) return false;
	
	// also deal with type detection based on parts, so we can differentiate
	// magazine and journal articles, and find container elements
	var isPartOf = getFirstResults(node, [n.dcterms+"isPartOf", n.so+"isPartOf"]);
	
	// get parts of parts, because parts are sections of wholes.
	if(isPartOf) {
		//keep track of processed parts, so we don't end up in an infinite loop
		var processedParts = [];
		for(var i=0; i<isPartOf.length; i++) {
			if(processedParts.includes(isPartOf[i])) continue;
			var subParts = getFirstResults(isPartOf[i], [n.dcterms+"isPartOf", n.so+"isPartOf"]);
			if(subParts) {
				isPartOf = isPartOf.concat(subParts);
			}
			processedParts.push(isPartOf[i]);
		}
		
		//remove self from parts
		for(var i=0; i<isPartOf.length; i++) {
			if(Zotero.RDF.getResourceURI(isPartOf[i]) == Zotero.RDF.getResourceURI(node)) {
				isPartOf.splice(i,1);
				i--;
			}
		}
	}
	
	var container;
	// for schema.org we need several containers
	var containerPeriodical;
	var containerPublicationVolume;
	var containerPublicationIssue;
	var t = {};
	// rdf:type
	var type = getFirstResults(node, [rdf+"type"], true);
	if(type) {
		var pref = '';
		if(type.substr(0,n.bib.length) == n.bib) {
			pref = n.bib;
		} else if(type.substr(0,n.bibo.length) == n.bibo) {
			pref = n.bibo;
		} else if (type.substr(0,n.so.length) == n.so) {
			pref = n.so;
		} else if(type == n.z+"Attachment") {
			pref = n.z;
		}
		type = type.substr(pref.length).toLowerCase();
		switch(type) {
			case "book":
			case "thesis":
			case "letter":
			case "manuscript":
			case "interview":
			case "report":
			case "patent":
			case "map":
				//these are the same as zotero types,
				//just start with lower case
				if (pref==n.bib || pref==n.bibo) t.bib = type;
				if (pref==n.z) t.z = type;
				if (pref==n.so) t.so = type;
			break;
			
			// bib, bibo types
			case "booksection":
				t.bib = 'bookSection';
				container = getNodeByType(isPartOf, n.bib+"Book");
			break;
			case "motionpicture":
				t.bib = "film";
			break;
			case "image":
			case "illustration":
				t.bib = "artwork";
			break;
			case "legislation":
				t.bib = "statute";
			break;
			case "recording":
				t.bib = "audioRecording";
			break;
			case "memo":
				t.bib = "note";
			break;
			case "document":
				if(container = getNodeByType(isPartOf,
						[n.bib+"CourtReporter", n.bibo+"CourtReporter"])) {
					t.bib = "case";
				} else if (getFirstResults(node, [n.bibo+"isbn10", n.bibo+"isbn13"], true)) {
					t.bib = "book";
				} else {
					t.bib = "webpage";
				}
			break;
			
			// schema.org types
			// subtypes of http://schema.org/CreativeWork and https://bib.schema.org/
			case 'newsarticle':
			case 'analysisnewsarticle':
			case 'backgroundnewsarticle':
			case 'opinionNewsarticle':
			case 'reportagenewsarticle':
			case 'reviewnewsarticle':
				t.so = 'newspaperArticle'; break;
			case 'scholarlyarticle':
			case 'medicalscholarlyarticle':
				t.so = 'journalArticle';
				containerPublicationIssue = getNodeByType(isPartOf, [n.so+"PublicationIssue"]);
				containerPublicationVolume = getNodeByType(isPartOf, [n.so+"PublicationVolume"]);
				containerPeriodical = getNodeByType(isPartOf, [n.so+"Periodical"]);
				container = getNodeByType(isPartOf, [n.so+"PublicationIssue", n.so+"PublicationVolume", n.so+"Periodical"]);
				break;
			case 'chapter':
				t.so = 'bookSection';
				container = getNodeByType(isPartOf, [n.so+"Book"]);
				break;
			case 'socialmediaposting':
			case 'blogposting':
			case 'liveblogposting':
				t.so = 'blogPost';
				break;
			case 'discussionforumposting':
				t.so = 'forumPost'; break;
			case 'techarticle':
			case 'apireference':
				t.soGuess = 'report'; break;
			case 'clip':
			case 'movieclip':
			case 'videogameclip':
				t.soGuess = 'videoRecording'; break;
			case 'tvclip':
			case 'tvepisode':
				t.so = 'tvBroadcast'; break;
			case 'tvseries':
			case 'episode':
				t.soGuess = 'tvBroadcast'; break;
			case 'radioclip':
			case 'radioepisode':
				t.so = 'radioBroadcast'; break;
			case 'radioseries':
				t.soGuess = 'radioBroadcast'; break;
			case 'presentationdigitaldocument':
				t.soGuess = 'presentation'; break;
			case 'message':
			case 'emailmessage':
				t.so = 'email'; break;
			case 'movie':
				t.so = 'film'; break;
			case 'musicrecording':
			case 'musicalbum':
			case 'audiobook':
			case 'audioobject':
				t.so = 'audioRecording'; break;
			case 'softwareapplication':
			case 'mobileapplication':
			case 'videogame':
			case 'webapplication':
			case 'softwaresourcecode':
				t.so = 'computerProgram'; break;
			case 'painting':
			case 'photograph':
			case 'visualartwork':
			case 'sculpture':
				t.so = 'artwork'; break;
			case 'datacatalog':
			case 'dataset':
				t.so = 'journalArticle'; break;  //until dataset gets implemented
			
			// specials cases
			case "article":
				// choose between journal, newspaper, and magazine articles
				// use of container = (not container ==) is intentional
				if(container = getNodeByType(isPartOf,
						[n.bib+"Journal", n.bibo+"Journal"])) {
					t.bib = "journalArticle";
				} else if(container = getNodeByType(isPartOf,
						[n.bib+"Periodical", n.bibo+"Periodical"])) {
					t.bib = "magazineArticle";
				} else if(container = getNodeByType(isPartOf,
						[n.bib+"Newspaper", n.bibo+"Newspaper"])) {
					t.bib = "newspaperArticle";
				} else if (pref==n.so) {
					if(container = getNodeByType(isPartOf,
						[n.so+"PublicationIssue", n.so+"PublicationVolume"])) {
							t.so = "journalArticle";
					} else {
						t.soGuess = 'magazineArticle';
					}
				}
			break;
			//zotero
			case "attachment":
				// unless processing of independent attachment is intended, don't
				// process

				// process as file
				t.zotero = "attachment";
	
				var path = getFirstResults(node, [rdf+"resource"]);
				if(path) {
					newItem.path = Zotero.RDF.getResourceURI(path[0]);
				}
				newItem.charset = getFirstResults(node, [n.link+"charset"], true);
				newItem.mimeType = getFirstResults(node, [n.link+"type"], true);
		}
	}
	
	// zotero:itemType, zotero:type
	type = getFirstResults(node, [n.z+"itemType", n.z+"type"], true);
	if(type && isNaN(parseInt(type)) //itemTypeExists also takes item type IDs. We don't want to consider those
		&& ZU.itemTypeExists(type)
	) {
		t.zotero = type;
		if(type == "encyclopediaArticle" || type == "dictionaryEntry") {
			container = getNodeByType(isPartOf, n.bib+"Book");
		} else if(type == "conferencePaper") {
			container = getNodeByType(isPartOf, n.bib+"Journal");
		}
	}

	// dc:type, dcterms:type
	type = getFirstResults(node, [n.dc+"type", n.dc1_0+"type", n.dcterms+"type"], true);
	if(type) {
		if(isNaN(parseInt(type)) && ZU.itemTypeExists(type)) {
			t.dc = type;
		} else {
			//on eprints the type fields are often in the form "Journal Article", "Conference Item" etc.
			type = type.toLowerCase().replace(/\s/g, "");
			switch (type) {
				//eprints
				//from http://www.ukoln.ac.uk/repositories/digirep/index/Eprints_Type_Vocabulary_Encoding_Scheme
				case 'book':
				case 'patent':
				case 'report':
				case 'thesis':
					t.dc = type;
					break;
				case 'bookitem':
					t.dc = 'bookSection';
					break;
				//case 'bookreview':
				case 'conferenceitem':
				case 'conferencepaper':
				case 'conferenceposter':
					t.dc = 'conferencePaper';
					break;
				case 'article':  //from http://www.idealliance.org/specifications/prism/specifications/prism-controlled-vocabularies/prism-12-controlled-vocabularies
				case 'dataset':  //until dataset gets implemented
				case 'journalitem':
				case 'journalarticle':
				case 'submittedjournalarticle':
					t.dc = 'journalArticle';
					break;
				case 'newsitem':
					t.dc = 'newspaperArticle';
					break;
				case 'scholarlytext':
					t.dc = 'journalArticle';
					break;
				case 'workingpaper':
					t.dc = 'report';
					break;
				
				//via examples from oro.open.ac.uk, http://eprints.soton.ac.uk/
				case 'musicitem':
					t.dcGuess = 'audioRecording';
					break;
				case 'artdesignitem':
					t.dcGuess = 'artwork`';
					break;
				case 'authoredbook':
					t.dc= 'book';
					break;
				case 'bookchapter':
					t.dc = 'bookSection';
					break;

				//from http://www.idealliance.org/specifications/prism/specifications/prism-controlled-vocabularies/prism-12-controlled-vocabularies
				//some are the same as eprints and are handled above
				case 'electronicbook':
					t.dc = 'book';
					break;
				case 'homepage':
				case 'webpage':
					t.dc = 'webpage';
					break;
				case 'illustration':
					t.dc = 'artwork';
					break;
				case 'map':
					t.dc = 'map';
					break;

				//from http://dublincore.org/documents/dcmi-type-vocabulary/
				//this vocabulary is much broader
				case 'event':
					//very broad, but has an associated location
					t.dcGuess = 'presentation';
					break;
				case 'image':
					//this includes almost any graphic, moving or not
					t.dcGuess = 'artwork';
					break;
				case 'movingimage':
					//could be either film, tvBroadcast, or videoRecording
					t.dcGuess = 'videoRecording';
					break;
				case 'software':
					t.dcGuess = 'computerProgram';
					break;
				case 'sound':
					//could be podcast, radioBroadcast, or audioRecording
					t.dcGuess = 'audioRecording';
					break;
				case 'stillimage':
					//could be map or artwork
					t.dcGuess = 'artwork';
					break;
				case 'text':
					//very broad
					t.dcGuess = 'journalArticle';
					break;
				//collection, dataset, interactiveresource, physicalobject,
				//service
			}
		}
	}


	type = getFirstResults(node, [n.eprints+"type"], true);
	if(type) {
			switch (type) {
				//eprints
				//from http://www.ukoln.ac.uk/repositories/digirep/index/Eprints_Type_Vocabulary_Encoding_Scheme
				case 'book':
				case 'patent':
				case 'report':
				case 'thesis':
					t.eprints = type;
					break;
				case 'bookitem':
					t.eprints = 'bookSection';
					break;
				//case 'bookreview':
				
				case 'conferenceitem':
				case 'conferencepaper':
				case 'conferenceposter':
					t.eprints = 'conferencePaper';
					break;
				case 'journalitem':
				case 'journalarticle':
				case 'submittedjournalarticle':
				case 'dataset':
				//map to dataset once we have it as item type
				case 'article':
					t.eprints = 'journalArticle';
					break;
				case 'newsitem':
					t.eprints = 'newspaperArticle';
					break;
				case 'scholarlytext':
					t.eprints = 'journalArticle';
					break;
				case 'workingpaper':
					t.eprints = 'report';
					break;
				//from  samples at http://oro.open.ac.uk, http://eprints.soton.ac.uk/, http://eprints.biblio.unitn.it
				case 'techreport':
					t.eprints = 'report';
					break;
				case 'bookedit':
				case 'proceedings':
					t.eprints = 'book';
					break;
				case 'book_section':
					t.eprints = 'bookSection';
				break;
				case 'ad_item':
					t.eprints = 'artwork';
				break;
				case 'mu_item':
					t.eprints = 'audioRecording';
				break;
				case 'confpaper':
				case 'conference_item':
					if (getFirstResults(node, [n.eprints+"ispublished"], true) == "unpub"){
						t.eprints = 'presentation';
					}
					else t.eprints = 'conferencePaper';
				break;
				
			}
	}




	// og:type
	type = getFirstResults(node, [n.og+"type"], true);
	switch (type) {
		case "video.movie":
		case "video.episode":
		case "video.tv_show":
		case "video.other":
			t.og = "videoRecording";
		break;
		case "article":
			t.ogGuess = "journalArticle";
		break;
		case "book":
			t.og = "book";
		break;
		case "music.song":
		case "music.album":
			t.og = "audioRecording";
		break;
		case "website":
			t.og = "webpage";
		break;
	}
	
	// PRISM:aggregationtype
	/**is this actually inside container?*/
	type = getFirstResults(node, [n.prism+"aggregationtype",
		n.prism2_0+"aggregationtype", n.prism2_1+"aggregationtype"]);
	switch(type) {
		case 'book':
			t.prism = 'bookSection';
		break;
		case 'feed':
			//could also be email
			t.prismGuess = 'blogPost';
		break;
		case 'journal':
			t.prism = 'journalArticle';
		break;
		case 'magazine':
			t.prism = 'magazineArticle';
		break;
		case 'newsletter':
			t.prism = 'newspaperArticle';
		break;
		//pamphlet, other, manual, catalog
	}

	//PRISM:genre
	type = getFirstResults(node, [n.prism+"genre", n.prism2_0+"genre",
		n.prism2_1+"genre"]);
	switch(type) {
		case 'abstract':
		case 'acknowledgements':
		case 'authorbio':
		case 'bibliography':
		case 'index':
		case 'tableofcontents':
			t.prism = 'bookSection';
		break;
		case 'autobiography':
		case 'biography':
			t.prism = 'book';
		break;
		case 'blogentry':
			t.prism = 'blogPost';
		break;
		case 'homepage':
		case 'webliography':
			t.prism = 'webpage';
		break;
		case 'interview':
			t.prism = 'interview';
		break;
		case 'letters':
			t.prism = 'letter';
		break;
		case 'adaptation':
		case 'analysis':
			t.prismGuess = 'journalArticle';
		break;
		case 'column':
		case 'newsbulletin':
		case 'opinion':
			//magazine or newspaper
			t.prismGuess = 'newspaperArticle';
		break;
		case 'coverstory':
		case 'essay':
		case 'feature':
		case 'insidecover':
			//journal or magazine
			t.prismGuess = 'magazineArticle';
		break;
		//advertorial; advertisement; brief; chronology; classifiedad;
		//correction; cover; coverpackage; electionresults; eventscalendar;
		//excerpt; photoshoot; featurepackage; financialstatement;
		//interactivecontent; legaldocument; masthead; notice; obituary;
		//photoessay; poem; poll; pressrelease; productdescription; profile;
		//quotation; ranking; recipe; reprint; response; review; schedule;
		//sidebar; stockquote; sectiontableofcontents; transcript; wirestory
	}

	//PRISM:platform
	type = getFirstResults(node, [n.prism+"platform", n.prism2_0+"platform",
		n.prism2_1+"platform"]);
	switch(type) {
		case 'broadcast':
			t.prismGuess = 'tvBroadcast';
		break;
		case 'web':
			t.prismGuess = 'webpage';
		break;
	}

	var itemType = t.zotero || t.bib || t.prism || t.eprints || t.og || t.dc ||
		t.so ||
		exports.defaultUnknownType || t.zoteroGuess || t.bibGuess ||
		t.prismGuess || t.ogGuess || t.dcGuess || t.soGuess;

	//Z.debug(t);
	//in case we still don't have a container, double-check
	//some are copied from above
	if(!container) {
		switch(itemType) {
			case "blogPost":
				container = getNodeByType(isPartOf, n.z+"Blog");
			break;
			case "forumPost":
				container = getNodeByType(isPartOf, n.z+"Forum");
			break;
			case "webpage":
				container = getNodeByType(isPartOf, n.z+"Website");
			break;
			case "bookSection":
				container = getNodeByType(isPartOf, n.bib+"Book");
			break;
			case "case":
				container = getNodeByType(isPartOf,[n.bib+"CourtReporter", n.bibo+"CourtReporter"]);
			break;
			case "journalArticle":
				container = getNodeByType(isPartOf, [n.bib+"Journal", n.bibo+"Journal"]);
			break;
			case "magazineArticle":
				container = getNodeByType(isPartOf, [n.bib+"Periodical", n.bibo+"Periodical", n.so+"Periodical"]);
			break;
			case "newspaperArticle":
				container = getNodeByType(isPartOf, [n.bib+"Newspaper", n.bibo+"Newspaper"]);
			break;
		}
	}
	
	// fill return object which is passed as an argument
	ret.container = container;
	ret.containerPeriodical = containerPeriodical;
	ret.containerPublicationVolume = containerPublicationVolume;
	ret.containerPublicationIssue = containerPublicationVolume;
	ret.isPartOf = isPartOf;

	return 	itemType;
}


function importItem(newItem, node) {
	var ret = {};
	var itemType = detectType(newItem, node, ret);
	var isZoteroRDF = false;
	if (getFirstResults(node, [n.z+"itemType", n.z+"type"], true)) {
		isZoteroRDF = true;
	}
	newItem.itemType = exports.itemType || itemType;
	var container = ret.container;
	var containerPeriodical = ret.containerPeriodical;
	var containerPublicationVolume = ret.containerPublicationVolume;
	var containerPublicationIssue = ret.containerPublicationIssue;
	var isPartOf = ret.isPartOf;

	// title
	newItem.title = getFirstResults(node, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title",
		n.eprints+"title", n.vcard2+"fn", n.og+"title",
		n.so+"headline"], true);
	if(!newItem.itemType) {
		if(!newItem.title) {	// require the title
								// (if not a known type)
			return false;
		} else {
			// default to journalArticle
			newItem.itemType = "journalArticle";
		}
	} else if (!newItem.title) {
		// name is a generic property and not only for titles
		newItem.title = getFirstResults(node, [n.so+"name"], true);
	}
	
	// regular author-type creators
	var possibleCreatorTypes = Zotero.Utilities.getCreatorsForType(newItem.itemType);
	var creators;
	for (var i=0; i<possibleCreatorTypes.length; i++) {
		var creatorType = possibleCreatorTypes[i];
		if(creatorType == "author") {
			creators = getFirstResults(node, [n.bib+"authors", n.so+"author",
				n.so+"creator", n.dc+"creator", n.dc1_0+"creator",
				n.dcterms+"creator", n.eprints+"creators_name",
				n.dc+"contributor", n.dc1_0+"contributor", n.dcterms+"contributor"]);
		} else if(creatorType == "editor" || creatorType == "contributor") {
			creators = getFirstResults(node, [n.bib+creatorType+"s", n.eprints+creatorType+"s_name",
				n.so+creatorType]);
		//get presenters in unpublished conference papers on eprints
		} else if(creatorType == "presenter") {
			creators = getFirstResults(node, [n.z+creatorType+"s", n.eprints+"creators_name"]);
		} else if(creatorType == "castMember") {
			creators = getFirstResults(node, [n.video+"actor"]);
		} else if(creatorType == "scriptwriter") {
			creators = getFirstResults(node, [n.video+"writer"]);
		} else if(creatorType == "producer") {
			creators = getFirstResults(node, [n.so+"producer"]);
		} else if(creatorType == "programmer") {
			creators = getFirstResults(node, [n.so+"author", n.codemeta+"maintainer"]);
		} else {
			creators = getFirstResults(node, [n.z+creatorType+"s"]);
		}
		
		if(creators) handleCreators(newItem, creators, creatorType);
	}
	
	
	// publicationTitle -- first try PRISM, then DC
	newItem.publicationTitle = getFirstResults(node, [n.prism+"publicationName", n.prism2_0+"publicationName", n.prism2_1+"publicationName", n.eprints+"publication", n.eprints+"book_title",
		n.dc+"source", n.dc1_0+"source", n.dcterms+"source", n.og+"site_name"], true);
	if (container) {
		newItem.publicationTitle = getFirstResults(container, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title", n.so+"name"], true);
		// these fields mean the same thing
		newItem.reporter = newItem.publicationTitle;
	}
	if (containerPeriodical) {
		newItem.publicationTitle = getFirstResults([containerPeriodical, containerPublicationVolume], [n.so+"name"], true);
	}

	// rights
	newItem.rights = getFirstResults(node, [n.prism+"copyright", n.prism2_0+"copyright", n.prism2_1+"copyright", n.dc+"rights", n.dc1_0+"rights", n.dcterms+"rights", n.so+"license"], true);
	
	// section
	var section = getNodeByType(isPartOf, n.bib+"Part");
	if(section) {
		newItem.section = getFirstResults(section, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title"], true);
	}
	if (!section) {
		newItem.section = getFirstResults(node, [n.article+"section", n.so+"genre"], true);
	}
	
	// series
	var series = getNodeByType(isPartOf, n.bib+"Series");
	if(series) {
		newItem.series = getFirstResults(series, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title"], true);
		newItem.seriesTitle = getFirstResults(series, [n.dcterms+"alternative"], true);
		newItem.seriesText = getFirstResults(series, [n.dc+"description", n.dc1_0+"description", n.dcterms+"description"], true);
		newItem.seriesNumber = getFirstResults(series, [n.dc+"identifier", n.dc1_0+"identifier", n.dcterms+"description"], true);
	}
	
	// volume
	newItem.volume = getFirstResults([container, node, containerPublicationVolume, containerPeriodical], [n.prism+"volume", n.prism2_0+"volume", n.prism2_1+"volume",
			n.eprints+"volume", n.bibo+"volume", n.dcterms+"citation.volume", n.so+"volumeNumber"], true);
	
	// issue
	if(container) {
		newItem.issue = getFirstResults([container, node], [n.prism+"number", n.prism2_0+"number", n.prism2_1+"number",
			n.eprints+"number", n.bibo+"issue", n.dcterms+"citation.issue", n.so+"issueNumber"], true);
	}

	// these mean the same thing
	newItem.patentNumber = newItem.number = newItem.issue;
	
	// edition
	newItem.edition = getFirstResults(node, [n.prism+"edition", n.prism2_0+"edition", n.prism2_1+"edition", n.bibo+"edition", n.so+"bookEdition", n.so+"version"], true);
	// these fields mean the same thing
	newItem.versionNumber = newItem.edition;
	
	// pages
	newItem.pages = getFirstResults(node, [n.bib+"pages", n.eprints+"pagerange", n.prism2_0+"pageRange", n.prism2_1+"pageRange", n.bibo+"pages", n.so+"pagination"], true);
	if(!newItem.pages) {
		var pages = [];
		var spage = getFirstResults(node, [n.prism+"startingPage", n.prism2_0+"startingPage", n.prism2_1+"startingPage", n.bibo+"pageStart", n.dcterms+"relation.spage", n.so+"pageStart"], true),
			epage = getFirstResults(node, [n.prism+"endingPage", n.prism2_0+"endingPage", n.prism2_1+"endingPage", n.bibo+"pageEnd", n.dcterms+"relation.epage", n.so+"pageEnd"], true);
		if(spage) pages.push(spage);
		if(epage) pages.push(epage);
		if(pages.length) newItem.pages = pages.join("-");
	}
	
	// numPages
	newItem.numPages = getFirstResults(node, [n.bibo+"numPages", n.eprints+"pages", n.so+"numberOfPages"], true);

	// numberOfVolumes
	newItem.numberOfVolumes = getFirstResults(node, [n.bibo+"numVolumes"], true);

	// short title
	newItem.shortTitle = getFirstResults(node, [n.bibo+"shortTitle"], true);
	
	// mediums
	newItem.artworkMedium = newItem.interviewMedium = getFirstResults(node, [n.dcterms+"medium"], true);
	
	// programmingLanguage
	newItem.programmingLanguage = getFirstResults(node, [n.so+"programmingLanguage"], true);
	
	// system
	newItem.system = getFirstResults(node, [n.so+"operatingSystem"], true);
	
	// publisher
	var publisher = getFirstResults([node, containerPeriodical, containerPublicationVolume], [ n.dc+"publisher", n.dc1_0+"publisher",
		n.dcterms+"publisher", n.vcard2+"org", n.eprints+"institution",
		n.so+"publisher", n.so+"publishedBy" ]);
	if (publisher) {
		if (typeof(publisher[0]) == "string") {
			newItem.publisher = publisher[0];
		} else {
			var type = Zotero.RDF.getTargets(publisher[0], rdf+"type");
			if (type) {
				type = Zotero.RDF.getResourceURI(type[0]);
				switch (type){
					case n.foaf+"Organization":
					case n.foaf+"Agent":
						newItem.publisher = getFirstResults(publisher[0], [n.foaf+"name"], true);
						var place = getFirstResults(publisher[0], [n.vcard+"adr"]);
						if (place) {
							newItem.place = getFirstResults(place[0], [n.vcard+"locality"]);
						}
						break;
					case n.vcard2+"Organization":
						newItem.publisher = getFirstResults(publisher[0], [n.vcard2+"organization-name"], true);
						break;
					default:
						newItem.publisher = getFirstResults(publisher[0], [n.so+"name"], true);
						newItem.place = getFirstResults(publisher[0], [n.so+"location"], true);
						break;
				}
			}
		}
	}

	//place
	if (!newItem.place){
		//Prefer place of publication to conference location
		newItem.place = getFirstResults(node, [n.eprints+"place_of_pub", n.eprints+"event_location"], true);
	}
	
	// these fields mean the same thing
	newItem.distributor = newItem.label = newItem.company = newItem.institution = newItem.publisher;
	
	// date
	newItem.date = getFirstResults(node, [n.eprints+"date", n.prism+"publicationDate", n.prism2_0+"publicationDate", n.prism2_1+"publicationDate",
		n.og+"published_time", n.article+"published_time", n.book+"release_date", n.music+"release_date", n.video+"release_date",
		n.dc+"date.issued", n.dcterms+"date.issued", n.dcterms+"issued", n.dc+"date", n.dc1_0+"date", n.dcterms+"date",
		n.dcterms+"dateSubmitted", n.eprints+"datestamp",
		n.so+"datePublished"], true);
	// accessDate
	newItem.accessDate = getFirstResults(node, [n.dcterms+"dateSubmitted"], true);
	// lastModified
	newItem.lastModified = getFirstResults(node, [n.dcterms+"modified",
		n.so+"dateModified"], true);
	
	// identifier
	var identifiers = getFirstResults(node, [n.dc+"identifier", n.dc1_0+"identifier", n.dcterms+"identifier"]);
	if(container) {
		var containerIdentifiers = getFirstResults(container, [n.dc+"identifier", n.dc1_0+"identifier", n.dcterms+"identifier"]);
		// concatenate sets of identifiers
		if(containerIdentifiers) {
			if(identifiers) {
				identifiers = identifiers.concat(containerIdentifiers);
			} else {
				identifiers = containerIdentifiers;
			}
		}
	}
	
	if(identifiers) {
		for(var i in identifiers) {
			if(typeof(identifiers[i]) == "string") {
				// grab other things
				var beforeSpace = identifiers[i].substr(0, identifiers[i].indexOf(" ")).toUpperCase();
			
				// Attempt to determine type of identifier by prefix label
				if(beforeSpace == "ISBN") {
					newItem.ISBN = identifiers[i].substr(5).toUpperCase();
				} else if(beforeSpace == "ISSN") {
					newItem.ISSN = identifiers[i].substr(5).toUpperCase();
				} else if(beforeSpace == "DOI") {
					newItem.DOI = identifiers[i].substr(4);
				}
				// Or just try parsing values
				else if(ZU.cleanISBN(identifiers[i])) {
					newItem.ISBN = identifiers[i];
				} else if(ZU.cleanISSN(identifiers[i])) {
					newItem.ISSN = identifiers[i];
				} else if(ZU.cleanDOI(identifiers[i])) {
					newItem.DOI = identifiers[i];
				}
			} else {
				// grab URLs
				var type = Zotero.RDF.getTargets(identifiers[i], rdf+"type");
				if(type && (type = Zotero.RDF.getResourceURI(type[0])) && type == n.dcterms+"URI") {
					newItem.url = getFirstResults(identifiers[i], [rdf+"value"], true);
				}
			}
		}
	}
	
	// ISSN, if encoded per PRISM (DC uses "identifier")
	newItem.ISSN = getFirstResults([container, node, containerPeriodical, containerPublicationVolume], [n.prism+"issn", n.prism2_0+"issn", n.prism2_1+"issn", n.eprints+"issn", n.bibo+"issn",
		n.prism+"eIssn", n.prism2_0+"eIssn", n.prism2_1+"eIssn", n.bibo+"eissn", n.so+"issn"], true) || newItem.ISSN;
	// ISBN from PRISM or OG
	newItem.ISBN = getFirstResults((container ? container : node), [n.prism2_1+"isbn", n.bibo+"isbn", n.bibo+"isbn13", n.bibo+"isbn10", n.book+"isbn", n.so+"isbn"], true) || newItem.ISBN;
	// ISBN from eprints
	newItem.ISBN = getFirstResults(node, [n.eprints+"isbn"], true) || newItem.ISBN;
	// DOI from PRISM
	newItem.DOI = getFirstResults(node, [n.prism2_0+"doi", n.prism2_1+"doi", n.bibo+"doi"], true) || newItem.DOI;
	
	if(!newItem.url) {
		var url = getFirstResults(node, [n.eprints+"official_url", n.vcard2+"url", n.og+"url", n.prism2_0+"url", n.prism2_1+"url", n.bibo+"uri",
										 n.so+"url", n.so+"sameAs"]);
		if(url) {
			newItem.url = Zotero.RDF.getResourceURI(url[0]);
		}
	}
	
	// archiveLocation
	newItem.archiveLocation = getFirstResults(node, [n.dc+"coverage", n.dc1_0+"coverage", n.dcterms+"coverage"], true);
	
	// abstract
	newItem.abstractNote = getFirstResults(node, [n.eprints+"abstract", n.prism+"teaser", n.prism2_0+"teaser", n.prism2_1+"teaser", n.og+"description",
		n.bibo+"abstract", n.dcterms+"abstract", n.dc+"description.abstract", n.dcterms+"description.abstract", n.dc1_0+"description", n.so+"description"], true);
	
	// type
	var type = getFirstResults(node, [n.dc+"type", n.dc1_0+"type", n.dcterms+"type"], true);
	
	/**CUSTOM ITEM TYPE  -- Currently only Dataset **/
	if (type && (type.toLowerCase() == "dataset" || type.toLowerCase() == "datacatalog")) {
		if (newItem.extra) {
			newItem.extra += "\ntype: dataset";
		}
		else newItem.extra = "type: dataset";
	}


	// these all mean the same thing
	var typeProperties = ["reportType", "letterType", "manuscriptType",
				"mapType", "thesisType", "websiteType",
				"presentationType", "postType",	"audioFileType"];
	for (var i=0; i<typeProperties.length; i++) {
		newItem[ typeProperties[i] ] = type;
	}
	
	

	//thesis type from eprints
	if (newItem.itemType == "thesis"){
		newItem.thesisType = getFirstResults(node, [n.eprints+"thesis_type"], true) || newItem.thesisType;
	}
	//presentation type from eprints
	if (newItem.itemType == "presentation"){
		newItem.presentationType = getFirstResults(node, [n.eprints+"event_type"], true) || newItem.presentationType;
	}

	// conferenceName
	var conference = getFirstResults(node, [n.bib+"presentedAt"]);
	if(conference) {
		conference = conference[0];
		if(typeof(conference) == "string") {
			newItem.conferenceName = conference;
		} else {
			newItem.conferenceName = getFirstResults(conference, [n.dc+"title", n.dc1_0+"title", n.dcterms+"title"], true);
		}
	}
	//from eprints
	if (!newItem.conferenceName){
		newItem.conferenceName = getFirstResults(node, [n.eprints+"event_title"]);
	}
	//conference and meeting name are the same	
	newItem.meetingName = newItem.conferenceName;

	// journalAbbreviation
	newItem.journalAbbreviation = getFirstResults((container ? container : node), [n.dcterms+"alternative"], true);

	//running Time
	newItem.runningTime = getFirstResults(node, [n.video+"duration", n.song+"duration", n.so+"duration"], true);

	// address
	var adr = getFirstResults(node, [n.vcard2+"adr"]);
	if(adr) {
		newItem.address = getFirstResults(adr[0], [n.vcard2+"label"], true);
	}
	
	// telephone
	newItem.telephone = getFirstResults(node, [n.vcard2+"tel"], true);
	
	// email
	newItem.email = getFirstResults(node, [n.vcard2+"email"], true);
	
	// accepted
	newItem.accepted = getFirstResults(node, [n.dcterms+"dateAccepted"], true);

	// language
	newItem.language = getFirstResults(node, [n.dc+"language", n.dc1_0+"language", n.dcterms+"language", n.so+"inLanguage"], true);
	
	// see also
	processSeeAlso(node, newItem);
	
	// description/attachment note
	if(newItem.itemType == "attachment") {
		newItem.note = getFirstResults(node, [n.dc+"description", n.dc1_0+"description", n.dcterms+"description"], true);
	}
	// extra for Zotero RDF
	else if (isZoteroRDF) {
		newItem.extra = getFirstResults(node, [n.dc+"description"], true);
	}
	else if (!newItem.abstractNote) {
		newItem.abstractNote = getFirstResults(node, [n.dc+"description", n.dcterms+"description"], true);
	}
	
	/** NOTES **/
	
	var referencedBy = Zotero.RDF.getTargets(node, n.dcterms+"isReferencedBy");
	for (var i=0; i<referencedBy.length; i++) {
		var referentNode = referencedBy[i];
		var type = Zotero.RDF.getTargets(referentNode, rdf+"type");
		if(type && Zotero.RDF.getResourceURI(type[0]) == n.bib+"Memo") {
			// if this is a memo
			var note = {};
			note.note = getFirstResults(referentNode, [rdf+"value", n.dc+"description", n.dc1_0+"description", n.dcterms+"description"], true);
			if(note.note != undefined) {
				// handle see also
				processSeeAlso(referentNode, note);
				processTags(referentNode, note);
				
				// add note
				newItem.notes.push(note);
			}
		}
	}

	
	if(newItem.itemType == "note") {
		// add note for standalone
		var note = getFirstResults(node, [rdf+"value", n.dc+"description", n.dc1_0+"description", n.dcterms+"description"], true);
		// temporary fix for Zotero 3.0.7: set note to " " if it would otherwise be
		// empty to avoid an error
		newItem.note = note ? note : " ";
	}
	
	/** TAGS **/
	
	var subjects = getFirstResults(node, [n.dc+"subject", n.dc1_0+"subject", n.dcterms+"subject", n.article+"tag",
		n.prism2_0+"keyword", n.prism2_1+"keyword", n.prism2_0+"object", n.prism2_1+"object", n.prism2_0+"organization", n.prism2_1+"organization", n.prism2_0+"person", n.prism2_1+"person",
		n.so+"keywords", n.so+"about"]);
	if (subjects) {
		for (var i=0; i<subjects.length; i++) {
			var subject = subjects[i];
			if(typeof(subject) == "string") {	// a regular tag
				newItem.tags.push(subject);
			} else {							// a call number or automatic tag
				var type = Zotero.RDF.getTargets(subject, rdf+"type");
				if(type) {
					type = Zotero.RDF.getResourceURI(type[0]);
					if(callNumberTypes.includes(type)) {
						newItem.callNumber = getFirstResults(subject, [rdf+"value"], true);
					} else if(type == n.z+"AutomaticTag") {
						newItem.tags.push({tag:getFirstResults(subject, [rdf+"value"], true), type:1});
					}
				}
			}
		}
	}
	
	/** ATTACHMENTS **/
	var relations = getFirstResults(node, [n.link+"link"]);
	if (relations) {
		for (var i=0; i<relations.length; i++) {
			var relation = relations[i];		
			var type = Zotero.RDF.getTargets(relation, rdf+"type");
			if(Zotero.RDF.getResourceURI(type[0]) == n.z+"Attachment") {
				var attachment = new Zotero.Item();
				newItem.attachments.push(attachment);
				importItem(attachment, relation, n.z+"Attachment");
			}
		}
	}
	
	var pdfURL = getFirstResults(node, [n.eprints+"document_url"]);
	if(pdfURL) {
		newItem.attachments.push({
			"title":"Full Text PDF",
			"mimeType":"application/pdf",
			"path":pdfURL[0]
		});
	}
	
	/** OTHER FIELDS **/
	var arcs = Zotero.RDF.getArcsOut(node);
	for (var i=0; i<arcs.length; i++) {
		var uri = Zotero.RDF.getResourceURI(arcs[i]);
		if(uri.substr(0, n.z.length) == n.z) {
			var property = uri.substr(n.z.length);
			newItem[property] = Zotero.RDF.getTargets(node, n.z+property)[0];
		}
	}
	
	return true;
}

function getNodes(skipCollections) {
	var nodes = Zotero.RDF.getAllResources();

	var goodNodes = [];
	for (var i=0; i<nodes.length; i++) {
		var node = nodes[i];
		// figure out if this is a part of another resource, or a linked
		// attachment, or a creator
		if(Zotero.RDF.getSources(node, n.dcterms+"isPartOf") ||
		   Zotero.RDF.getSources(node, n.bib+"presentedAt") ||
		   Zotero.RDF.getSources(node, n.link+"link") ||
		   Zotero.RDF.getSources(node, n.dcterms+"creator")) {
			continue;
		}
		
		// type
		var type = Zotero.RDF.getTargets(node, rdf+"type");
		if(type) {
			type = Zotero.RDF.getResourceURI(type[0]);

			// skip if this is not an independent attachment,
			if((type == n.z+"Attachment" || type == n.bib+"Memo") && isPart(node)) {
				continue;
			} else if(skipCollections &&
				(type == n.bib+"Collection" || type == n.z+"Collection")) {
				continue;
			}
		}
		goodNodes.push(node);
	}
	return goodNodes;
}

function doImport() {
	if (typeof Promise == 'undefined') {
		startImport(
			function () {},
			function (e) {
				throw e;
			}
		);
	}
	else {
		return new Promise(function (resolve, reject) {
			startImport(resolve, reject);
		});
	}
}

function startImport(resolve, reject) {
	try {
		Zotero.setProgress(null);
		var nodes = getNodes();
		if (!nodes.length) {
			resolve();
			return;
		}
		
		// keep track of collections while we're looping through
		var collections = [];
		importNext(nodes, 0, collections, resolve, reject);
	}
	catch (e) {
		reject(e);
	}
}

function importNext(nodes, index, collections, resolve, reject) {
	try {
		for (var i = index; i < nodes.length; i++) {
			var node = nodes[i];
			
			// type
			var type = Zotero.RDF.getTargets(node, rdf+"type");
			if (type) {
				type = Zotero.RDF.getResourceURI(type[0]);
				
				// skip if this is not an independent attachment,
				if((type == n.z+"Attachment" || type == n.bib+"Memo") && isPart(node)) {
					continue;
				}
				
				// skip collections until all the items are done
				if(type == n.bib+"Collection" || type == n.z+"Collection") {
					collections.push(node);
					continue;
				}
			}
			
			var newItem = new Zotero.Item();
			newItem.itemID = Zotero.RDF.getResourceURI(node);
			
			if (importItem(newItem, node)) {
				var maybePromise = newItem.complete();
				if (maybePromise) {
					maybePromise.then(function () {
						importNext(nodes, i + 1, collections, resolve, reject);
					});
					return;
				}
			}
			
			Zotero.setProgress((i + 1) / nodes.length * 100);
		}
		
		// Collections
		for (var i=0; i<collections.length; i++) {
			var collection = collections[i];
			if(!Zotero.RDF.getArcsIn(collection)) {
				var newCollection = new Zotero.Collection();
				processCollection(collection, newCollection);
				newCollection.complete();
			}
		}
	}
	catch (e) {
		reject(e);
	}
	
	resolve();
}

/**
 * Export doImport and defaultUnknownType to other translators
 */
var exports = {
	"doImport":doImport,
	"detectType":detectType,
	"getNodes":getNodes,
	"defaultUnknownType":false,
	"itemType": false
};
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n         xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\"\n         xmlns:bibo=\"http://purl.org/ontology/bibo/\"\n         xmlns:dc=\"http://purl.org/dc/terms/\"\n         xmlns:owl=\"http://www.w3.org/2002/07/owl#\"\n         xmlns:dc11=\"http://purl.org/dc/elements/1.1/\"\n         xmlns:ns0=\"http://rdaregistry.info/Elements/u/\"\n         xmlns:ns1=\"http://iflastandards.info/ns/isbd/elements/\"\n         xmlns:foaf=\"http://xmlns.com/foaf/0.1/\">\n\n  <bibo:Book rdf:about=\"http://d-nb.info/1054873992\">\n    <dc:medium rdf:resource=\"http://rdaregistry.info/termList/RDACarrierType/1044\"/>\n    <owl:sameAs rdf:resource=\"http://hub.culturegraph.org/resource/DNB-1054873992\"/>\n    <dc11:identifier>(DE-101)1054873992</dc11:identifier>\n    <dc11:identifier>(OCoLC)888461076</dc11:identifier>\n    <bibo:isbn13>9783658060268</bibo:isbn13>\n    <ns0:P60521>kart. : ca. EUR 39.99 (DE), ca. EUR 41.11 (AT), ca. sfr 50.00 (freier Pr.)</ns0:P60521>\n    <bibo:isbn10>3658060263</bibo:isbn10>\n    <bibo:gtin14>9783658060268</bibo:gtin14>\n    <dc:language rdf:resource=\"http://id.loc.gov/vocabulary/iso639-2/ger\"/>\n    <dc11:title>Das Adam-Smith-Projekt</dc11:title>\n    <dc:creator rdf:resource=\"http://d-nb.info/gnd/136486045\"/>\n    <dc11:publisher>Springer VS</dc11:publisher>\n    <ns0:P60163>Wiesbaden</ns0:P60163>\n    <ns0:P60333>Wiesbaden : Springer VS</ns0:P60333>\n    <ns1:P1053>447 S.</ns1:P1053>\n    <dc:isPartOf>Edition Theorie und Kritik</dc:isPartOf>\n    <ns0:P60489>Zugl. leicht überarb. Fassung von: Berlin, Freie Univ., Diss., 2012</ns0:P60489>\n    <dc:relation rdf:resource=\"http://d-nb.info/1064805604\"/>\n    <dc:subject>Smith, Adam</dc:subject>\n    <dc:subject>Liberalismus</dc:subject>\n    <dc:subject>Rechtsordnung</dc:subject>\n    <dc:subject>Foucault, Michel</dc:subject>\n    <dc:subject>Macht</dc:subject>\n    <dc:subject>Politische Philosophie</dc:subject>\n    <dc:subject rdf:resource=\"http://dewey.info/class/320.512092/e22/\"/>\n    <dc:tableOfContents rdf:resource=\"http://d-nb.info/1054873992/04\"/>\n    <dc:issued>2015</dc:issued>\n    <ns0:P60493>zur Genealogie der liberalen Gouvernementalität</ns0:P60493>\n  </bibo:Book>\n  \n  <foaf:Person rdf:about=\"http://d-nb.info/gnd/136486045\">\n    <foaf:familyName>Ronge</foaf:familyName>\n    <foaf:givenName>Bastian</foaf:givenName>\n  </foaf:Person>\n  \n\n</rdf:RDF>",
		"items": [
			{
				"itemType": "book",
				"title": "Das Adam-Smith-Projekt",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Ronge",
						"firstName": "Bastian"
					}
				],
				"date": "2015",
				"ISBN": "9783658060268",
				"itemID": "http://d-nb.info/1054873992",
				"language": "http://id.loc.gov/vocabulary/iso639-2/ger",
				"publisher": "Springer VS",
				"attachments": [],
				"tags": [
					{
						"tag": "Foucault, Michel"
					},
					{
						"tag": "Liberalismus"
					},
					{
						"tag": "Macht"
					},
					{
						"tag": "Politische Philosophie"
					},
					{
						"tag": "Rechtsordnung"
					},
					{
						"tag": "Smith, Adam"
					}
				],
				"notes": [],
				"seeAlso": [
					"http://d-nb.info/1064805604"
				]
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<rdf:RDF\n  xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n  xmlns:schema=\"http://schema.org/\"\n>\n  <schema:ScholarlyArticle rdf:nodeID=\"N523cd27ac2f84bbca7fe726b027db6d2\">\n    <schema:pageStart>360</schema:pageStart>\n    <schema:isPartOf rdf:resource=\"http://schema.org/Article#bib-2/issue\"/>\n    <schema:about>Catalog</schema:about>\n    <schema:about>Works</schema:about>\n    <schema:pageEnd>368</schema:pageEnd>\n    <schema:author>Smiraglia, Richard P.</schema:author>\n    <schema:name>Be Careful What You Wish For: FRBR, Some Lacunae, A Review</schema:name>\n    <schema:sameAs rdf:resource=\"http://dx.doi.org/10.1080/01639374.2012.682254\"/>\n    <schema:description>The library catalog as a catalog of works was an infectious idea, which together with research led to reconceptualization in the form of the FRBR conceptual model. Two categories of lacunae emerge--the expression entity, and gaps in the model such as aggregates and dynamic documents. Evidence needed to extend the FRBR model is available in contemporary research on instantiation. The challenge for the bibliographic community is to begin to think of FRBR as a form of knowledge organization system, adding a final dimension to classification. The articles in the present special issue offer a compendium of the promise of the FRBR model.</schema:description>\n  </schema:ScholarlyArticle>\n  <schema:PublicationIssue rdf:about=\"http://schema.org/Article#bib-2/issue\">\n    <schema:isPartOf>\n      <schema:Periodical rdf:about=\"http://schema.org/Article#bib-2/periodical\">\n        <schema:volumeNumber>50</schema:volumeNumber>\n        <schema:publisher>Taylor &amp; Francis Group</schema:publisher>\n        <schema:issn>1544-4554</schema:issn>\n        <schema:issn>0163-9374</schema:issn>\n        <schema:name>Cataloging &amp; Classification Quarterly</schema:name>\n        <rdf:type rdf:resource=\"http://schema.org/PublicationVolume\"/>\n      </schema:Periodical>\n    </schema:isPartOf>\n    <schema:issueNumber>5</schema:issueNumber>\n    <schema:datePublished rdf:datatype=\"http://schema.org/Date\">2012</schema:datePublished>\n  </schema:PublicationIssue>\n</rdf:RDF>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Be Careful What You Wish For: FRBR, Some Lacunae, A Review",
				"creators": [
					{
						"firstName": "Richard P.",
						"lastName": "Smiraglia",
						"creatorType": "author"
					}
				],
				"ISSN": "1544-4554",
				"abstractNote": "The library catalog as a catalog of works was an infectious idea, which together with research led to reconceptualization in the form of the FRBR conceptual model. Two categories of lacunae emerge--the expression entity, and gaps in the model such as aggregates and dynamic documents. Evidence needed to extend the FRBR model is available in contemporary research on instantiation. The challenge for the bibliographic community is to begin to think of FRBR as a form of knowledge organization system, adding a final dimension to classification. The articles in the present special issue offer a compendium of the promise of the FRBR model.",
				"issue": "5",
				"itemID": "_:n82",
				"pages": "360-368",
				"publicationTitle": "Cataloging & Classification Quarterly",
				"url": "http://dx.doi.org/10.1080/01639374.2012.682254",
				"volume": "50",
				"attachments": [],
				"tags": [
					{
						"tag": "Catalog"
					},
					{
						"tag": "Works"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<rdf:RDF\n  xmlns:codemeta=\"https://codemeta.github.io/terms/\"\n  xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n  xmlns:schema=\"http://schema.org/\"\n>\n  <schema:SoftwareSourceCode rdf:nodeID=\"N7272101842f544e2a9a7508327eb329b\">\n    <schema:name>CodeMeta: Minimal metadata schemas for science software and code, in JSON-LD</schema:name>\n    <schema:description>CodeMeta is a concept vocabulary that can be used to standardize the exchange of software metadata across repositories and organizations.</schema:description>\n    <schema:dateCreated rdf:datatype=\"http://schema.org/Date\">2017-06-05</schema:dateCreated>\n    <schema:datePublished rdf:datatype=\"http://schema.org/Date\">2017-06-05</schema:datePublished>\n    <schema:version>2.0</schema:version>\n    <schema:softwareVersion>2.0</schema:softwareVersion>\n    <schema:programmingLanguage>JSON-LD</schema:programmingLanguage>\n    <schema:license rdf:resource=\"https://spdx.org/licenses/Apache-2.0\"/>\n    <codemeta:developmentStatus rdf:resource=\"file:///base/data/home/apps/s%7Erdf-translator/2.408516547054015808/active\"/>\n    <codemeta:funding>National Science Foundation Award #1549758; Codemeta: A Rosetta Stone for Metadata in Scientific Software</codemeta:funding>\n    <schema:codeRepository rdf:resource=\"https://github.com/codemeta/codemeta\"/>\n    <schema:downloadUrl rdf:resource=\"https://github.com/codemeta/codemeta/archive/2.0.zip\"/>\n    <codemeta:contIntegration rdf:resource=\"https://travis-ci.org/codemeta/codemeta\"/>\n    <schema:identifier rdf:resource=\"file:///base/data/home/apps/s%7Erdf-translator/2.408516547054015808/CodeMeta\"/>\n    <codemeta:issueTracker rdf:resource=\"https://github.com/codemeta/codemeta/issues\"/>\n    <schema:keywords>software</schema:keywords>\n    <schema:keywords>metadata</schema:keywords>\n    <codemeta:maintainer rdf:resource=\"http://orcid.org/0000-0002-1642-628X\"/>\n    <schema:author rdf:resource=\"http://orcid.org/0000-0002-1642-628X\"/>\n    <schema:author rdf:resource=\"http://orcid.org/0000-0003-0077-4738\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-4925-7248\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0001-5636-0433\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0002-9300-5278\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-1419-2405\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0002-8876-7606\"/>\n    <schema:contributor rdf:resource=\"N99ac8e31c13d4ae5994cbc8669e01866\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0001-8465-8341\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-4741-0309\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-2720-0339\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0002-1642-628X\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-1219-2137\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0002-3957-2474\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-3477-2845\"/>\n    <schema:contributor rdf:resource=\"Nefd7fe71736c433db9ada28e54018b34\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-1304-1939\"/>\n    <schema:contributor rdf:resource=\"Nc65fe076896346a9a8859f25f5e3bca9\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0003-4425-7097\"/>\n    <schema:contributor rdf:resource=\"http://orcid.org/0000-0002-2192-403X\"/>\n  </schema:SoftwareSourceCode>\n  \n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-4925-7248\">\n    <schema:familyName>Druskat</schema:familyName>\n    <schema:email>mail@sdruskat.net</schema:email>\n    <schema:givenName>Stephan</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0001-5636-0433\">\n    <schema:givenName>Ashley</schema:givenName>\n    <schema:familyName>Sands</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0002-9300-5278\">\n    <schema:givenName>Patricia</schema:givenName>\n    <schema:familyName>Cruse</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-1419-2405\">\n    <schema:givenName>Martin</schema:givenName>\n    <schema:familyName>Fenner</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0002-8876-7606\">\n    <schema:givenName>Neil</schema:givenName>\n    <schema:familyName>Chue Hong</schema:familyName>\n    <schema:email>n.chuehong@epcc.ed.ac.uk</schema:email>\n  </schema:Person>\n  <schema:Person rdf:nodeID=\"N99ac8e31c13d4ae5994cbc8669e01866\">\n    <schema:familyName>Nowak</schema:familyName>\n    <schema:givenName>Krzysztof</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0001-8465-8341\">\n    <schema:familyName>Gil</schema:familyName>\n    <schema:email>GIL@ISI.EDU</schema:email>\n    <schema:givenName>Yolanda</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-4741-0309\">\n    <schema:familyName>Hahnel</schema:familyName>\n    <schema:givenName>Mark</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-2720-0339\">\n    <schema:email>dskatz@illinois.edu</schema:email>\n    <schema:givenName>Dan</schema:givenName>\n    <schema:familyName>Katz</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0002-1642-628X\">\n    <schema:givenName>Carl</schema:givenName>\n    <schema:familyName>Boettiger</schema:familyName>\n    <schema:email>cboettig@gmail.com</schema:email>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-1219-2137\">\n    <schema:email>carole.goble@manchester.ac.uk</schema:email>\n    <schema:familyName>Goble</schema:familyName>\n    <schema:givenName>Carole</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0002-3957-2474\">\n    <schema:familyName>Smith</schema:familyName>\n    <schema:givenName>Arfon</schema:givenName>\n    <schema:email>arfon.smith@gmail.com</schema:email>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-3477-2845\">\n    <schema:givenName>Alice</schema:givenName>\n    <schema:email>aallen@ascl.net</schema:email>\n    <schema:familyName>Allen</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:nodeID=\"Nefd7fe71736c433db9ada28e54018b34\">\n    <schema:email>abbycabs@gmail.com</schema:email>\n    <schema:givenName>Abby Cabunoc</schema:givenName>\n    <schema:familyName>Mayes</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-1304-1939\">\n    <schema:givenName>Mercè</schema:givenName>\n    <schema:familyName>Crosas</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"Nc65fe076896346a9a8859f25f5e3bca9\">\n    <schema:email>luke.coy@rit.edu</schema:email>\n    <schema:familyName>Coy</schema:familyName>\n    <schema:givenName>Luke</schema:givenName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-4425-7097\">\n    <schema:givenName>Kyle</schema:givenName>\n    <schema:email>Kyle.Niemeyer@oregonstate.edu</schema:email>\n    <schema:familyName>Niemeyer</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0002-2192-403X\">\n    <schema:givenName>Peter</schema:givenName>\n    <schema:email>slaughter@nceas.ucsb.edu</schema:email>\n    <schema:familyName>Slaughter</schema:familyName>\n  </schema:Person>\n  <schema:Person rdf:about=\"http://orcid.org/0000-0003-0077-4738\">\n    <schema:givenName>Matthew B.</schema:givenName>\n    <schema:familyName>Jones</schema:familyName>\n    <schema:email>jones@nceas.ucsb.edu</schema:email>\n  </schema:Person>\n</rdf:RDF>",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "CodeMeta: Minimal metadata schemas for science software and code, in JSON-LD",
				"creators": [
					{
						"creatorType": "programmer",
						"lastName": "Boettiger",
						"firstName": "Carl"
					},
					{
						"creatorType": "programmer",
						"lastName": "Jones",
						"firstName": "Matthew B."
					},
					{
						"creatorType": "contributor",
						"lastName": "Druskat",
						"firstName": "Stephan"
					},
					{
						"creatorType": "contributor",
						"lastName": "Sands",
						"firstName": "Ashley"
					},
					{
						"creatorType": "contributor",
						"lastName": "Cruse",
						"firstName": "Patricia"
					},
					{
						"creatorType": "contributor",
						"lastName": "Fenner",
						"firstName": "Martin"
					},
					{
						"creatorType": "contributor",
						"lastName": "Chue Hong",
						"firstName": "Neil"
					},
					{
						"creatorType": "contributor",
						"lastName": "Gil",
						"firstName": "Yolanda"
					},
					{
						"creatorType": "contributor",
						"lastName": "Hahnel",
						"firstName": "Mark"
					},
					{
						"creatorType": "contributor",
						"lastName": "Katz",
						"firstName": "Dan"
					},
					{
						"creatorType": "contributor",
						"lastName": "Boettiger",
						"firstName": "Carl"
					},
					{
						"creatorType": "contributor",
						"lastName": "Goble",
						"firstName": "Carole"
					},
					{
						"creatorType": "contributor",
						"lastName": "Smith",
						"firstName": "Arfon"
					},
					{
						"creatorType": "contributor",
						"lastName": "Allen",
						"firstName": "Alice"
					},
					{
						"creatorType": "contributor",
						"lastName": "Crosas",
						"firstName": "Mercè"
					},
					{
						"creatorType": "contributor",
						"lastName": "Coy",
						"firstName": "Luke"
					},
					{
						"creatorType": "contributor",
						"lastName": "Niemeyer",
						"firstName": "Kyle"
					},
					{
						"creatorType": "contributor",
						"lastName": "Slaughter",
						"firstName": "Peter"
					}
				],
				"date": "2017-06-05",
				"abstractNote": "CodeMeta is a concept vocabulary that can be used to standardize the exchange of software metadata across repositories and organizations.",
				"itemID": "_:n79",
				"programmingLanguage": "JSON-LD",
				"rights": "https://spdx.org/licenses/Apache-2.0",
				"versionNumber": "2.0",
				"attachments": [],
				"tags": [
					{
						"tag": "metadata"
					},
					{
						"tag": "software"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
