{
	"translatorID": "fcf41bed-0cbc-3704-85c7-8062a0068a7a",
	"label": "PubMed XML",
	"creator": "Simon Kornblith, Michael Berkowitz, Avram Lyon, and Rintze Zelle",
	"target": "xml",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"dataMode": "xml/dom"
	},
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-10-17 05:38:38"
}

/*******************************
 * Import translator functions *
 *******************************/

function detectImport() {
	var text = Zotero.read(1000);
	return text.indexOf("<PubmedArticleSet>") != -1;
}

function processAuthors(newItem, authorsLists) {
	for (var j=0, m=authorsLists.length; j<m; j++) {
		//default to 'author' unless it's 'editor'
		var type = "author";
		if (authorsLists[j].hasAttribute('Type')
			&& authorsLists[j].getAttribute('Type') === "editors") {
			type = "editor";
		}
	
		var authors = ZU.xpath(authorsLists[j], 'Author');
	
		for (var k=0, l=authors.length; k<l; k++) {
			var author = authors[k];
			var lastName = ZU.xpathText(author, 'LastName');
			var firstName = ZU.xpathText(author, 'FirstName');
			if (!firstName) {
				firstName = ZU.xpathText(author, 'ForeName');
			}
	
			var suffix = ZU.xpathText(author, 'Suffix');
			if (suffix && firstName) {
				firstName += ", " + suffix
			}
	
			if (firstName || lastName) {
				var creator = ZU.cleanAuthor(lastName + ', ' + firstName, type, true);
				if (creator.lastName.toUpperCase() == creator.lastName) {
					creator.lastName = ZU.capitalizeTitle(creator.lastName, true);
				}
				if (creator.firstName.toUpperCase() == creator.firstName) {
					creator.firstName = ZU.capitalizeTitle(creator.firstName, true);
				}
				newItem.creators.push(creator);
			} else if (lastName = ZU.xpathText(author, 'CollectiveName')) {
				//corporate author
				newItem.creators.push({
					creatorType: type,
					lastName: lastName,
					fieldMode: 1
				});
			}
		}
	}
}

function doImport() {
	var doc = Zotero.getXML();

	var pageRangeRE = /(\d+)-(\d+)/g;

	//handle journal articles
	var articles = ZU.xpath(doc, '/PubmedArticleSet/PubmedArticle');
	for (var i=0, n=articles.length; i<n; i++) {
		var newItem = new Zotero.Item("journalArticle");

		var citation = ZU.xpath(articles[i], 'MedlineCitation')[0];

		var article = ZU.xpath(citation, 'Article')[0];
		
		var title = ZU.xpathText(article, 'ArticleTitle');
		if (title) {
			if (title.charAt(title.length-1) == ".") {
				title = title.substring(0, title.length-1);
			}
			newItem.title = title;
		}
		
		var fullPageRange = ZU.xpathText(article, 'Pagination/MedlinePgn');
		if (fullPageRange) {
			//where page ranges are given in an abbreviated format, convert to full
			pageRangeRE.lastIndex = 0;
			var range;
			while (range = pageRangeRE.exec(fullPageRange)) {
				var pageRangeStart = range[1];
				var pageRangeEnd = range[2];
				var diff = pageRangeStart.length - pageRangeEnd.length;
				if (diff > 0) {
					pageRangeEnd = pageRangeStart.substring(0,diff) + pageRangeEnd;
					var newRange = pageRangeStart + "-" + pageRangeEnd;
					fullPageRange = fullPageRange.substring(0, range.index) //everything before current range
						+ newRange	//insert the new range
						+ fullPageRange.substring(range.index + range[0].length);	//everything after the old range
					//adjust RE index
					pageRangeRE.lastIndex += newRange.length - range[0].length;
				}
			}
			newItem.pages = fullPageRange;
		}
		
		var journal = ZU.xpath(article, 'Journal')[0];
		if (journal) {
			newItem.ISSN = ZU.xpathText(journal, 'ISSN');
			
			var abbreviation;
			if ((abbreviation = ZU.xpathText(journal, 'ISOAbbreviation'))) {
				newItem.journalAbbreviation = abbreviation;	
			} else if ((abbreviation = ZU.xpathText(journal, 'MedlineTA'))) {
				newItem.journalAbbreviation = abbreviation;
			}
			
			var title = ZU.xpathText(journal, 'Title');
			if (title) {
				title = ZU.trimInternal(title);
				// Fix sentence-cased titles, but be careful...
				if (!( // of accronyms that could get messed up if we fix case
					/\b[A-Z]{2}/.test(title) // this could mean that there's an accronym in the title
					&& (title.toUpperCase() != title // the whole title isn't in upper case, so bail
						|| !(/\s/.test(title))) // it's all in upper case and there's only one word, so we can't be sure
				)) {
					title = ZU.capitalizeTitle(title, true);
				}
				newItem.publicationTitle = title;
			} else if (newItem.journalAbbreviation) {
				newItem.publicationTitle = newItem.journalAbbreviation;
			}
			// (do we want this?)
			if (newItem.publicationTitle) {
				newItem.publicationTitle = ZU.capitalizeTitle(newItem.publicationTitle);
			}
			
			var journalIssue = ZU.xpath(journal, 'JournalIssue')[0];
			if (journalIssue) {
				newItem.volume = ZU.xpathText(journalIssue, 'Volume');
				newItem.issue = ZU.xpathText(journalIssue, 'Issue');
				var pubDate = ZU.xpath(journalIssue, 'PubDate')[0];
				if (pubDate) {	// try to get the date
					var day = ZU.xpathText(pubDate, 'Day');
					var month = ZU.xpathText(pubDate, 'Month');
					var year = ZU.xpathText(pubDate, 'Year');
					
					if (day) {
						newItem.date = month+" "+day+", "+year;
					} else if (month) {
						newItem.date = month+" "+year;
					} else if (year) {
						newItem.date = year;
					} else {
						newItem.date = ZU.xpathText(pubDate, 'MedlineDate');
					}
				}
			}
		}

		var authorLists = ZU.xpath(article, 'AuthorList');
		processAuthors(newItem, authorLists);
		
		newItem.language = ZU.xpathText(article, 'Language');
		
		var keywords = ZU.xpath(citation, 'MeshHeadingList/MeshHeading');
		for (var j=0, m=keywords.length; j<m; j++) {
			newItem.tags.push(ZU.xpathText(keywords[j], 'DescriptorName'));
		}
		//OT Terms
		var otherKeywords = ZU.xpath(citation, 'KeywordList/Keyword');
		for (var j=0, m=otherKeywords.length; j<m; j++) {
			newItem.tags.push(otherKeywords[j].textContent);
		}
		var abstractSections = ZU.xpath(article, 'Abstract/AbstractText');
		var abstractNote = [];
		for (var j=0, m=abstractSections.length; j<m; j++) {
			var abstractSection = abstractSections[j];
			var paragraph = abstractSection.textContent.trim();
			if (paragraph) paragraph += '\n';
			
			var label = abstractSection.hasAttribute("Label") && abstractSection.getAttribute("Label");
			if (label && label != "UNLABELLED") {
				paragraph = label + ": " + paragraph;
			}
			abstractNote.push(paragraph);
		}
		newItem.abstractNote = abstractNote.join('');
		
		newItem.DOI = ZU.xpathText(articles[i], 'PubmedData/ArticleIdList/ArticleId[@IdType="doi"]');
		
		var PMID = ZU.xpathText(citation, 'PMID');
		var PMCID = ZU.xpathText(articles[i], 'PubmedData/ArticleIdList/ArticleId[@IdType="pmc"]');
		if (PMID) {
			newItem.extra = "PMID: "+PMID;
			//this is a catalog, so we should store links as attachments
			newItem.attachments.push({
				title: "PubMed entry",
				url: "http://www.ncbi.nlm.nih.gov/pubmed/" + PMID,
				mimeType: "text/html",
				snapshot: false
			});
		}
		
		if (PMCID) {
			newItem.extra = (newItem.extra ? newItem.extra + "\n" : "")
				+ "PMCID: " + PMCID;
		}
		
		newItem.complete();
	}

	//handle books and chapters
	var books = ZU.xpath(doc, '/PubmedArticleSet/PubmedBookArticle');
	for (var i=0, n=books.length; i<n; i++) {
		var citation = ZU.xpath(books[i], 'BookDocument')[0];
		
		//check if this is a section
		var sectionTitle = ZU.xpathText(citation, 'ArticleTitle');
		var isBookSection = !!sectionTitle;
		var newItem = new Zotero.Item(isBookSection ? 'bookSection' : 'book');
		
		if (isBookSection) {
			newItem.title = sectionTitle;
		}

		var book = ZU.xpath(citation, 'Book')[0];

		//title
		var title = ZU.xpathText(book, 'BookTitle');
		if (title) {
			if (title.charAt(title.length-1) == ".") {
				title = title.substring(0, title.length-1);
			}
			if (isBookSection) {
				newItem.publicationTitle = title;
			} else {
				newItem.title = title;
			}
		}

		//date
		//should only need year for books
		newItem.date = ZU.xpathText(book, 'PubDate/Year');

		//edition
		newItem.edition = ZU.xpathText(book, 'Edition');
		
		//series
		newItem.series = ZU.xpathText(book, 'CollectionTitle');
		
		//volume
		newItem.volume = ZU.xpathText(book, 'Volume');

		//place
		newItem.place = ZU.xpathText(book, 'Publisher/PublisherLocation');

		//publisher
		newItem.publisher = ZU.xpathText(book, 'Publisher/PublisherName');

		//chapter authors
		if (isBookSection) {
			var authorsLists = ZU.xpath(citation, 'AuthorList');
			processAuthors(newItem, authorsLists);
		}
		
		//book creators
		var authorsLists = ZU.xpath(book, 'AuthorList');
		processAuthors(newItem, authorsLists);
	
		//language
		newItem.language = ZU.xpathText(citation, 'Language');

		//abstractNote
		newItem.abstractNote = ZU.xpathText(citation, 'Abstract/AbstractText');
		
		//rights
		newItem.rights = ZU.xpathText(citation, 'Abstract/CopyrightInformation');
		
		//seriesNumber, numPages, numberOfVolumes
		//not available
		
		//ISBN
		newItem.ISBN = ZU.xpathText(book, 'Isbn');
		
		var PMID = ZU.xpathText(citation, 'PMID');
		if (PMID) {
			newItem.extra = "PMID: "+PMID;
			
			//this is a catalog, so we should store links as attachments
			newItem.attachments.push({
				title: "PubMed entry",
				url: "http://www.ncbi.nlm.nih.gov/pubmed/" + PMID,
				mimeType: "text/html",
				snapshot: false
			});
		}
		
		newItem.callNumber = ZU.xpathText(citation,
			'ArticleIdList/ArticleId[@IdType="bookaccession"]');
		//attach link to the bookshelf page
		if (newItem.callNumber) {
			var url = "http://www.ncbi.nlm.nih.gov/books/" + newItem.callNumber + "/";
			if (PMID) {	//books with PMIDs appear to be hosted at NCBI
				newItem.url = url;
				//book sections have printable views, which can stand in for full text PDFs
				if (newItem.itemType == 'bookSection') {
					newItem.attachments.push({
						title: "Printable HTML",
						url: 'http://www.ncbi.nlm.nih.gov/books/'
							+ newItem.callNumber + '/?report=printable',
						mimeType: 'text/html',
						snapshot: true
					});
				}
			} else {	//currently this should not trigger, since we only import books with PMIDs
				newItem.attachments.push({
					title: "NCBI Bookshelf entry",
					url: "http://www.ncbi.nlm.nih.gov/books/" + newItem.callNumber + "/",
					mimeType: "text/html",
					snapshot: false
				});
			}
		}

		newItem.complete();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\"?>\n<!DOCTYPE PubmedArticleSet PUBLIC \"-//NLM//DTD PubMedArticle, 1st January 2015//EN\" \"http://www.ncbi.nlm.nih.gov/corehtml/query/DTD/pubmed_150101.dtd\">\n<PubmedArticleSet>\n<PubmedArticle>\n    <MedlineCitation Owner=\"NLM\" Status=\"MEDLINE\">\n        <PMID Version=\"1\">20729678</PMID>\n        <DateCreated>\n            <Year>2010</Year>\n            <Month>08</Month>\n            <Day>23</Day>\n        </DateCreated>\n        <DateCompleted>\n            <Year>2010</Year>\n            <Month>12</Month>\n            <Day>21</Day>\n        </DateCompleted>\n        <Article PubModel=\"Print\">\n            <Journal>\n                <ISSN IssnType=\"Electronic\">1538-9855</ISSN>\n                <JournalIssue CitedMedium=\"Internet\">\n                    <Volume>35</Volume>\n                    <Issue>5</Issue>\n                    <PubDate>\n                        <MedlineDate>2010 Sep-Oct</MedlineDate>\n                    </PubDate>\n                </JournalIssue>\n                <Title>Nurse educator</Title>\n                <ISOAbbreviation>Nurse Educ</ISOAbbreviation>\n            </Journal>\n            <ArticleTitle>Zotero: harnessing the power of a personal bibliographic manager.</ArticleTitle>\n            <Pagination>\n                <MedlinePgn>205-7</MedlinePgn>\n            </Pagination>\n            <ELocationID EIdType=\"doi\" ValidYN=\"Y\">10.1097/NNE.0b013e3181ed81e4</ELocationID>\n            <Abstract>\n                <AbstractText>Zotero is a powerful free personal bibliographic manager (PBM) for writers. Use of a PBM allows the writer to focus on content, rather than the tedious details of formatting citations and references. Zotero 2.0 (http://www.zotero.org) has new features including the ability to synchronize citations with the off-site Zotero server and the ability to collaborate and share with others. An overview on how to use the software and discussion about the strengths and limitations are included.</AbstractText>\n            </Abstract>\n            <AuthorList CompleteYN=\"Y\">\n                <Author ValidYN=\"Y\">\n                    <LastName>Coar</LastName>\n                    <ForeName>Jaekea T</ForeName>\n                    <Initials>JT</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>School of Nursing, Georgia College &amp; State University, Milledgeville, Georgia 61061, USA.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Sewell</LastName>\n                    <ForeName>Jeanne P</ForeName>\n                    <Initials>JP</Initials>\n                </Author>\n            </AuthorList>\n            <Language>eng</Language>\n            <PublicationTypeList>\n                <PublicationType UI=\"D016428\">Journal Article</PublicationType>\n            </PublicationTypeList>\n        </Article>\n        <MedlineJournalInfo>\n            <Country>United States</Country>\n            <MedlineTA>Nurse Educ</MedlineTA>\n            <NlmUniqueID>7701902</NlmUniqueID>\n            <ISSNLinking>0363-3624</ISSNLinking>\n        </MedlineJournalInfo>\n        <CitationSubset>N</CitationSubset>\n        <MeshHeadingList>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"Y\" UI=\"D001634\">Bibliography as Topic</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"Y\" UI=\"D003628\">Database Management Systems</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D006801\">Humans</DescriptorName>\n            </MeshHeading>\n        </MeshHeadingList>\n    </MedlineCitation>\n    <PubmedData>\n        <History>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2010</Year>\n                <Month>8</Month>\n                <Day>24</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2010</Year>\n                <Month>8</Month>\n                <Day>24</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2010</Year>\n                <Month>12</Month>\n                <Day>22</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"doi\">10.1097/NNE.0b013e3181ed81e4</ArticleId>\n            <ArticleId IdType=\"pii\">00006223-201009000-00011</ArticleId>\n            <ArticleId IdType=\"pubmed\">20729678</ArticleId>\n        </ArticleIdList>\n    </PubmedData>\n</PubmedArticle>\n\n</PubmedArticleSet>\n",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: harnessing the power of a personal bibliographic manager",
				"creators": [
					{
						"firstName": "Jaekea T.",
						"lastName": "Coar",
						"creatorType": "author"
					},
					{
						"firstName": "Jeanne P.",
						"lastName": "Sewell",
						"creatorType": "author"
					}
				],
				"date": "2010 Sep-Oct",
				"DOI": "10.1097/NNE.0b013e3181ed81e4",
				"ISSN": "1538-9855",
				"abstractNote": "Zotero is a powerful free personal bibliographic manager (PBM) for writers. Use of a PBM allows the writer to focus on content, rather than the tedious details of formatting citations and references. Zotero 2.0 (http://www.zotero.org) has new features including the ability to synchronize citations with the off-site Zotero server and the ability to collaborate and share with others. An overview on how to use the software and discussion about the strengths and limitations are included.",
				"extra": "PMID: 20729678",
				"issue": "5",
				"journalAbbreviation": "Nurse Educ",
				"language": "eng",
				"pages": "205-207",
				"publicationTitle": "Nurse Educator",
				"volume": "35",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Bibliography as Topic",
					"Database Management Systems",
					"Humans"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\"?>\n<!DOCTYPE PubmedArticleSet PUBLIC \"-//NLM//DTD PubMedArticle, 1st January 2015//EN\" \"http://www.ncbi.nlm.nih.gov/corehtml/query/DTD/pubmed_150101.dtd\">\n<PubmedArticleSet>\n<PubmedArticle>\n    <MedlineCitation Owner=\"NLM\" Status=\"MEDLINE\">\n        <PMID Version=\"1\">18157122</PMID>\n        <DateCreated>\n            <Year>2008</Year>\n            <Month>01</Month>\n            <Day>18</Day>\n        </DateCreated>\n        <DateCompleted>\n            <Year>2008</Year>\n            <Month>02</Month>\n            <Day>08</Day>\n        </DateCompleted>\n        <DateRevised>\n            <Year>2014</Year>\n            <Month>07</Month>\n            <Day>25</Day>\n        </DateRevised>\n        <Article PubModel=\"Print-Electronic\">\n            <Journal>\n                <ISSN IssnType=\"Electronic\">1552-4469</ISSN>\n                <JournalIssue CitedMedium=\"Internet\">\n                    <Volume>4</Volume>\n                    <Issue>2</Issue>\n                    <PubDate>\n                        <Year>2008</Year>\n                        <Month>Feb</Month>\n                    </PubDate>\n                </JournalIssue>\n                <Title>Nature chemical biology</Title>\n                <ISOAbbreviation>Nat. Chem. Biol.</ISOAbbreviation>\n            </Journal>\n            <ArticleTitle>High-content single-cell drug screening with phosphospecific flow cytometry.</ArticleTitle>\n            <Pagination>\n                <MedlinePgn>132-42</MedlinePgn>\n            </Pagination>\n            <Abstract>\n                <AbstractText>Drug screening is often limited to cell-free assays involving purified enzymes, but it is arguably best applied against systems that represent disease states or complex physiological cellular networks. Here, we describe a high-content, cell-based drug discovery platform based on phosphospecific flow cytometry, or phosphoflow, that enabled screening for inhibitors against multiple endogenous kinase signaling pathways in heterogeneous primary cell populations at the single-cell level. From a library of small-molecule natural products, we identified pathway-selective inhibitors of Jak-Stat and MAP kinase signaling. Dose-response experiments in primary cells confirmed pathway selectivity, but importantly also revealed differential inhibition of cell types and new druggability trends across multiple compounds. Lead compound selectivity was confirmed in vivo in mice. Phosphoflow therefore provides a unique platform that can be applied throughout the drug discovery process, from early compound screening to in vivo testing and clinical monitoring of drug efficacy.</AbstractText>\n            </Abstract>\n            <AuthorList CompleteYN=\"Y\">\n                <Author ValidYN=\"Y\">\n                    <LastName>Krutzik</LastName>\n                    <ForeName>Peter O</ForeName>\n                    <Initials>PO</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Department of Microbiology and Immunology, Baxter Laboratory in Genetic Pharmacology, Stanford University, 269 Campus Drive, Stanford, California 94305, USA.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Crane</LastName>\n                    <ForeName>Janelle M</ForeName>\n                    <Initials>JM</Initials>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Clutter</LastName>\n                    <ForeName>Matthew R</ForeName>\n                    <Initials>MR</Initials>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Nolan</LastName>\n                    <ForeName>Garry P</ForeName>\n                    <Initials>GP</Initials>\n                </Author>\n            </AuthorList>\n            <Language>eng</Language>\n            <DataBankList CompleteYN=\"Y\">\n                <DataBank>\n                    <DataBankName>PubChem-Substance</DataBankName>\n                    <AccessionNumberList>\n                        <AccessionNumber>46391334</AccessionNumber>\n                        <AccessionNumber>46391335</AccessionNumber>\n                        <AccessionNumber>46391336</AccessionNumber>\n                        <AccessionNumber>46391337</AccessionNumber>\n                        <AccessionNumber>46391338</AccessionNumber>\n                        <AccessionNumber>46391339</AccessionNumber>\n                        <AccessionNumber>46391340</AccessionNumber>\n                        <AccessionNumber>46391341</AccessionNumber>\n                        <AccessionNumber>46391342</AccessionNumber>\n                        <AccessionNumber>46391343</AccessionNumber>\n                        <AccessionNumber>46391344</AccessionNumber>\n                        <AccessionNumber>46391345</AccessionNumber>\n                        <AccessionNumber>46391346</AccessionNumber>\n                        <AccessionNumber>46391347</AccessionNumber>\n                        <AccessionNumber>46391348</AccessionNumber>\n                        <AccessionNumber>46391349</AccessionNumber>\n                        <AccessionNumber>46391350</AccessionNumber>\n                        <AccessionNumber>46391351</AccessionNumber>\n                        <AccessionNumber>46391352</AccessionNumber>\n                        <AccessionNumber>46391353</AccessionNumber>\n                        <AccessionNumber>46391354</AccessionNumber>\n                        <AccessionNumber>46391355</AccessionNumber>\n                        <AccessionNumber>46391356</AccessionNumber>\n                        <AccessionNumber>46391357</AccessionNumber>\n                    </AccessionNumberList>\n                </DataBank>\n            </DataBankList>\n            <GrantList CompleteYN=\"Y\">\n                <Grant>\n                    <GrantID>AI35304</GrantID>\n                    <Acronym>AI</Acronym>\n                    <Agency>NIAID NIH HHS</Agency>\n                    <Country>United States</Country>\n                </Grant>\n                <Grant>\n                    <GrantID>N01-HV-28183</GrantID>\n                    <Acronym>HV</Acronym>\n                    <Agency>NHLBI NIH HHS</Agency>\n                    <Country>United States</Country>\n                </Grant>\n                <Grant>\n                    <GrantID>T32 AI007290</GrantID>\n                    <Acronym>AI</Acronym>\n                    <Agency>NIAID NIH HHS</Agency>\n                    <Country>United States</Country>\n                </Grant>\n            </GrantList>\n            <PublicationTypeList>\n                <PublicationType UI=\"D016428\">Journal Article</PublicationType>\n                <PublicationType UI=\"D052061\">Research Support, N.I.H., Extramural</PublicationType>\n                <PublicationType UI=\"D013485\">Research Support, Non-U.S. Gov't</PublicationType>\n            </PublicationTypeList>\n            <ArticleDate DateType=\"Electronic\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>23</Day>\n            </ArticleDate>\n        </Article>\n        <MedlineJournalInfo>\n            <Country>United States</Country>\n            <MedlineTA>Nat Chem Biol</MedlineTA>\n            <NlmUniqueID>101231976</NlmUniqueID>\n            <ISSNLinking>1552-4450</ISSNLinking>\n        </MedlineJournalInfo>\n        <ChemicalList>\n            <Chemical>\n                <RegistryNumber>0</RegistryNumber>\n                <NameOfSubstance UI=\"D050791\">STAT Transcription Factors</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>27YLU75U4W</RegistryNumber>\n                <NameOfSubstance UI=\"D010758\">Phosphorus</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>EC 2.7.10.2</RegistryNumber>\n                <NameOfSubstance UI=\"D053612\">Janus Kinases</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>EC 2.7.11.24</RegistryNumber>\n                <NameOfSubstance UI=\"D020928\">Mitogen-Activated Protein Kinases</NameOfSubstance>\n            </Chemical>\n        </ChemicalList>\n        <CitationSubset>IM</CitationSubset>\n        <MeshHeadingList>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D000818\">Animals</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D045744\">Cell Line, Tumor</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D004353\">Drug Evaluation, Preclinical</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D005434\">Flow Cytometry</DescriptorName>\n                <QualifierName MajorTopicYN=\"Y\" UI=\"Q000379\">methods</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D006801\">Humans</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D053612\">Janus Kinases</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000378\">metabolism</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D051379\">Mice</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D008807\">Mice, Inbred BALB C</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D020928\">Mitogen-Activated Protein Kinases</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000378\">metabolism</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D010758\">Phosphorus</DescriptorName>\n                <QualifierName MajorTopicYN=\"Y\" UI=\"Q000032\">analysis</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D050791\">STAT Transcription Factors</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000378\">metabolism</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D012680\">Sensitivity and Specificity</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D015398\">Signal Transduction</DescriptorName>\n            </MeshHeading>\n        </MeshHeadingList>\n    </MedlineCitation>\n    <PubmedData>\n        <History>\n            <PubMedPubDate PubStatus=\"received\">\n                <Year>2007</Year>\n                <Month>6</Month>\n                <Day>15</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"accepted\">\n                <Year>2007</Year>\n                <Month>10</Month>\n                <Day>30</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"aheadofprint\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>23</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>25</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2008</Year>\n                <Month>2</Month>\n                <Day>9</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>25</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"pii\">nchembio.2007.59</ArticleId>\n            <ArticleId IdType=\"doi\">10.1038/nchembio.2007.59</ArticleId>\n            <ArticleId IdType=\"pubmed\">18157122</ArticleId>\n        </ArticleIdList>\n    </PubmedData>\n</PubmedArticle>\n<PubmedArticle>\n    <MedlineCitation Owner=\"NLM\" Status=\"MEDLINE\">\n        <PMID Version=\"1\">18157123</PMID>\n        <DateCreated>\n            <Year>2008</Year>\n            <Month>01</Month>\n            <Day>18</Day>\n        </DateCreated>\n        <DateCompleted>\n            <Year>2008</Year>\n            <Month>02</Month>\n            <Day>08</Day>\n        </DateCompleted>\n        <DateRevised>\n            <Year>2013</Year>\n            <Month>11</Month>\n            <Day>21</Day>\n        </DateRevised>\n        <Article PubModel=\"Print-Electronic\">\n            <Journal>\n                <ISSN IssnType=\"Electronic\">1552-4469</ISSN>\n                <JournalIssue CitedMedium=\"Internet\">\n                    <Volume>4</Volume>\n                    <Issue>2</Issue>\n                    <PubDate>\n                        <Year>2008</Year>\n                        <Month>Feb</Month>\n                    </PubDate>\n                </JournalIssue>\n                <Title>Nature chemical biology</Title>\n                <ISOAbbreviation>Nat. Chem. Biol.</ISOAbbreviation>\n            </Journal>\n            <ArticleTitle>Site selectivity of platinum anticancer therapeutics.</ArticleTitle>\n            <Pagination>\n                <MedlinePgn>110-2</MedlinePgn>\n            </Pagination>\n            <Abstract>\n                <AbstractText>X-ray crystallographic and biochemical investigation of the reaction of cisplatin and oxaliplatin with nucleosome core particle and naked DNA reveals that histone octamer association can modulate DNA platination. Adduct formation also occurs at specific histone methionine residues, which could serve as a nuclear platinum reservoir influencing adduct transfer to DNA. Our findings suggest that the nucleosome center may provide a favorable target for the design of improved platinum anticancer drugs.</AbstractText>\n            </Abstract>\n            <AuthorList CompleteYN=\"Y\">\n                <Author ValidYN=\"Y\">\n                    <LastName>Wu</LastName>\n                    <ForeName>Bin</ForeName>\n                    <Initials>B</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Division of Structural and Computational Biology, School of Biological Sciences, Nanyang Technological University, 60 Nanyang Drive, Singapore 637551, Singapore.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Dröge</LastName>\n                    <ForeName>Peter</ForeName>\n                    <Initials>P</Initials>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Davey</LastName>\n                    <ForeName>Curt A</ForeName>\n                    <Initials>CA</Initials>\n                </Author>\n            </AuthorList>\n            <Language>eng</Language>\n            <DataBankList CompleteYN=\"Y\">\n                <DataBank>\n                    <DataBankName>PubChem-Substance</DataBankName>\n                    <AccessionNumberList>\n                        <AccessionNumber>46095911</AccessionNumber>\n                        <AccessionNumber>46095912</AccessionNumber>\n                    </AccessionNumberList>\n                </DataBank>\n            </DataBankList>\n            <PublicationTypeList>\n                <PublicationType UI=\"D016428\">Journal Article</PublicationType>\n                <PublicationType UI=\"D013485\">Research Support, Non-U.S. Gov't</PublicationType>\n            </PublicationTypeList>\n            <ArticleDate DateType=\"Electronic\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>23</Day>\n            </ArticleDate>\n        </Article>\n        <MedlineJournalInfo>\n            <Country>United States</Country>\n            <MedlineTA>Nat Chem Biol</MedlineTA>\n            <NlmUniqueID>101231976</NlmUniqueID>\n            <ISSNLinking>1552-4450</ISSNLinking>\n        </MedlineJournalInfo>\n        <ChemicalList>\n            <Chemical>\n                <RegistryNumber>0</RegistryNumber>\n                <NameOfSubstance UI=\"D000970\">Antineoplastic Agents</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>0</RegistryNumber>\n                <NameOfSubstance UI=\"D018736\">DNA Adducts</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>0</RegistryNumber>\n                <NameOfSubstance UI=\"D006657\">Histones</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>0</RegistryNumber>\n                <NameOfSubstance UI=\"D009707\">Nucleosomes</NameOfSubstance>\n            </Chemical>\n            <Chemical>\n                <RegistryNumber>49DFR088MY</RegistryNumber>\n                <NameOfSubstance UI=\"D010984\">Platinum</NameOfSubstance>\n            </Chemical>\n        </ChemicalList>\n        <CitationSubset>IM</CitationSubset>\n        <MeshHeadingList>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D000595\">Amino Acid Sequence</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D000970\">Antineoplastic Agents</DescriptorName>\n                <QualifierName MajorTopicYN=\"Y\" UI=\"Q000737\">chemistry</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D001483\">Base Sequence</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D018360\">Crystallography, X-Ray</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D018736\">DNA Adducts</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000737\">chemistry</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D006657\">Histones</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000737\">chemistry</QualifierName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000378\">metabolism</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D008958\">Models, Molecular</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D008969\">Molecular Sequence Data</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D009707\">Nucleosomes</DescriptorName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000737\">chemistry</QualifierName>\n                <QualifierName MajorTopicYN=\"N\" UI=\"Q000378\">metabolism</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D010984\">Platinum</DescriptorName>\n                <QualifierName MajorTopicYN=\"Y\" UI=\"Q000737\">chemistry</QualifierName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D017434\">Protein Structure, Tertiary</DescriptorName>\n            </MeshHeading>\n            <MeshHeading>\n                <DescriptorName MajorTopicYN=\"N\" UI=\"D012680\">Sensitivity and Specificity</DescriptorName>\n            </MeshHeading>\n        </MeshHeadingList>\n    </MedlineCitation>\n    <PubmedData>\n        <History>\n            <PubMedPubDate PubStatus=\"received\">\n                <Year>2007</Year>\n                <Month>6</Month>\n                <Day>07</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"accepted\">\n                <Year>2007</Year>\n                <Month>10</Month>\n                <Day>26</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"aheadofprint\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>23</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>25</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2008</Year>\n                <Month>2</Month>\n                <Day>9</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2007</Year>\n                <Month>12</Month>\n                <Day>25</Day>\n                <Hour>9</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"pii\">nchembio.2007.58</ArticleId>\n            <ArticleId IdType=\"doi\">10.1038/nchembio.2007.58</ArticleId>\n            <ArticleId IdType=\"pubmed\">18157123</ArticleId>\n        </ArticleIdList>\n    </PubmedData>\n</PubmedArticle>\n\n</PubmedArticleSet>\n",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "High-content single-cell drug screening with phosphospecific flow cytometry",
				"creators": [
					{
						"firstName": "Peter O.",
						"lastName": "Krutzik",
						"creatorType": "author"
					},
					{
						"firstName": "Janelle M.",
						"lastName": "Crane",
						"creatorType": "author"
					},
					{
						"firstName": "Matthew R.",
						"lastName": "Clutter",
						"creatorType": "author"
					},
					{
						"firstName": "Garry P.",
						"lastName": "Nolan",
						"creatorType": "author"
					}
				],
				"date": "Feb 2008",
				"DOI": "10.1038/nchembio.2007.59",
				"ISSN": "1552-4469",
				"abstractNote": "Drug screening is often limited to cell-free assays involving purified enzymes, but it is arguably best applied against systems that represent disease states or complex physiological cellular networks. Here, we describe a high-content, cell-based drug discovery platform based on phosphospecific flow cytometry, or phosphoflow, that enabled screening for inhibitors against multiple endogenous kinase signaling pathways in heterogeneous primary cell populations at the single-cell level. From a library of small-molecule natural products, we identified pathway-selective inhibitors of Jak-Stat and MAP kinase signaling. Dose-response experiments in primary cells confirmed pathway selectivity, but importantly also revealed differential inhibition of cell types and new druggability trends across multiple compounds. Lead compound selectivity was confirmed in vivo in mice. Phosphoflow therefore provides a unique platform that can be applied throughout the drug discovery process, from early compound screening to in vivo testing and clinical monitoring of drug efficacy.",
				"extra": "PMID: 18157122",
				"issue": "2",
				"journalAbbreviation": "Nat. Chem. Biol.",
				"language": "eng",
				"pages": "132-142",
				"publicationTitle": "Nature Chemical Biology",
				"volume": "4",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Animals",
					"Cell Line, Tumor",
					"Drug Evaluation, Preclinical",
					"Flow Cytometry",
					"Humans",
					"Janus Kinases",
					"Mice",
					"Mice, Inbred BALB C",
					"Mitogen-Activated Protein Kinases",
					"Phosphorus",
					"STAT Transcription Factors",
					"Sensitivity and Specificity",
					"Signal Transduction"
				],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Site selectivity of platinum anticancer therapeutics",
				"creators": [
					{
						"firstName": "Bin",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Dröge",
						"creatorType": "author"
					},
					{
						"firstName": "Curt A.",
						"lastName": "Davey",
						"creatorType": "author"
					}
				],
				"date": "Feb 2008",
				"DOI": "10.1038/nchembio.2007.58",
				"ISSN": "1552-4469",
				"abstractNote": "X-ray crystallographic and biochemical investigation of the reaction of cisplatin and oxaliplatin with nucleosome core particle and naked DNA reveals that histone octamer association can modulate DNA platination. Adduct formation also occurs at specific histone methionine residues, which could serve as a nuclear platinum reservoir influencing adduct transfer to DNA. Our findings suggest that the nucleosome center may provide a favorable target for the design of improved platinum anticancer drugs.",
				"extra": "PMID: 18157123",
				"issue": "2",
				"journalAbbreviation": "Nat. Chem. Biol.",
				"language": "eng",
				"pages": "110-112",
				"publicationTitle": "Nature Chemical Biology",
				"volume": "4",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Amino Acid Sequence",
					"Antineoplastic Agents",
					"Base Sequence",
					"Crystallography, X-Ray",
					"DNA Adducts",
					"Histones",
					"Models, Molecular",
					"Molecular Sequence Data",
					"Nucleosomes",
					"Platinum",
					"Protein Structure, Tertiary",
					"Sensitivity and Specificity"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\"?>\n<!DOCTYPE PubmedArticleSet PUBLIC \"-//NLM//DTD PubMedArticle, 1st January 2015//EN\" \"http://www.ncbi.nlm.nih.gov/corehtml/query/DTD/pubmed_150101.dtd\">\n<PubmedArticleSet>\n<PubmedBookArticle>\n    <BookDocument>\n        <PMID>20821847</PMID>\n        <ArticleIdList>\n            <ArticleId IdType=\"bookaccession\">NBK22</ArticleId>\n        </ArticleIdList>\n        <Book>\n            <Publisher>\n                <PublisherName>BIOS Scientific Publishers</PublisherName>\n                <PublisherLocation>Oxford</PublisherLocation>\n            </Publisher>\n            <BookTitle book=\"endocrin\">Endocrinology: An Integrated Approach</BookTitle>\n            <PubDate>\n                <Year>2001</Year>\n            </PubDate>\n            <AuthorList Type=\"authors\">\n                <Author>\n                    <LastName>Nussey</LastName>\n                    <ForeName>Stephen</ForeName>\n                    <Initials>S</Initials>\n                </Author>\n                <Author>\n                    <LastName>Whitehead</LastName>\n                    <ForeName>Saffron</ForeName>\n                    <Initials>S</Initials>\n                </Author>\n            </AuthorList>\n            <Isbn>1859962521</Isbn>\n        </Book>\n        <Language>eng</Language>\n        <Abstract>\n            <AbstractText>Endocrinology has been written to meet the requirements of today's trainee doctors and the demands of an increasing number of degree courses in health and biomedical sciences, and allied subjects. It is a truly integrated text using large numbers of real clinical cases to introduce the basic biochemistry, physiology and pathophysiology underlying endocrine disorders and also the principles of clinical diagnosis and treatment. The increasing importance of the molecular and genetic aspects of endocrinology in relation to clinical medicine is explained.</AbstractText>\n            <CopyrightInformation>Copyright © 2001, BIOS Scientific Publishers Limited</CopyrightInformation>\n        </Abstract>\n        <Sections>\n            <Section>\n                <SectionTitle book=\"endocrin\" part=\"A2\">Preface</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 1</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A3\">Principles of endocrinology</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 2</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A43\">The endocrine pancreas</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 3</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A235\">The thyroid gland</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 4</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A442\">The adrenal gland</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 5</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A742\">The parathyroid glands and vitamin D</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 6</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A972\">The gonad</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 7</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A1257\">The pituitary gland</SectionTitle>\n            </Section>\n            <Section>\n                <LocationLabel Type=\"chapter\">Chapter 8</LocationLabel>\n                <SectionTitle book=\"endocrin\" part=\"A1527\">Cardiovascular and renal endocrinology</SectionTitle>\n            </Section>\n        </Sections>\n    </BookDocument>\n    <PubmedBookData>\n        <History>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2010</Year>\n                <Month>9</Month>\n                <Day>8</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2010</Year>\n                <Month>9</Month>\n                <Day>8</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2010</Year>\n                <Month>9</Month>\n                <Day>8</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"pubmed\">20821847</ArticleId>\n        </ArticleIdList>\n    </PubmedBookData>\n</PubmedBookArticle>\n\n</PubmedArticleSet>\n",
		"items": [
			{
				"itemType": "book",
				"title": "Endocrinology: An Integrated Approach",
				"creators": [
					{
						"firstName": "Stephen",
						"lastName": "Nussey",
						"creatorType": "author"
					},
					{
						"firstName": "Saffron",
						"lastName": "Whitehead",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"ISBN": "1859962521",
				"abstractNote": "Endocrinology has been written to meet the requirements of today's trainee doctors and the demands of an increasing number of degree courses in health and biomedical sciences, and allied subjects. It is a truly integrated text using large numbers of real clinical cases to introduce the basic biochemistry, physiology and pathophysiology underlying endocrine disorders and also the principles of clinical diagnosis and treatment. The increasing importance of the molecular and genetic aspects of endocrinology in relation to clinical medicine is explained.",
				"callNumber": "NBK22",
				"extra": "PMID: 20821847",
				"language": "eng",
				"place": "Oxford",
				"publisher": "BIOS Scientific Publishers",
				"rights": "Copyright © 2001, BIOS Scientific Publishers Limited",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK22/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\"?>\n<!DOCTYPE PubmedArticleSet PUBLIC \"-//NLM//DTD PubMedArticle, 1st January 2015//EN\" \"http://www.ncbi.nlm.nih.gov/corehtml/query/DTD/pubmed_150101.dtd\">\n<PubmedArticleSet>\n\n<PubmedArticle>\n    <MedlineCitation Owner=\"NLM\" Status=\"In-Process\">\n        <PMID Version=\"1\">26074225</PMID>\n        <DateCreated>\n            <Year>2015</Year>\n            <Month>07</Month>\n            <Day>20</Day>\n        </DateCreated>\n        <Article PubModel=\"Print-Electronic\">\n            <Journal>\n                <ISSN IssnType=\"Electronic\">1525-3198</ISSN>\n                <JournalIssue CitedMedium=\"Internet\">\n                    <Volume>98</Volume>\n                    <Issue>8</Issue>\n                    <PubDate>\n                        <Year>2015</Year>\n                        <Month>Aug</Month>\n                    </PubDate>\n                </JournalIssue>\n                <Title>Journal of dairy science</Title>\n                <ISOAbbreviation>J. Dairy Sci.</ISOAbbreviation>\n            </Journal>\n            <ArticleTitle>Evaluation of testing strategies to identify infected animals at a single round of testing within dairy herds known to be infected with Mycobacterium avium ssp. paratuberculosis.</ArticleTitle>\n            <Pagination>\n                <MedlinePgn>5194-210</MedlinePgn>\n            </Pagination>\n            <ELocationID EIdType=\"doi\" ValidYN=\"Y\">10.3168/jds.2014-8211</ELocationID>\n            <ELocationID EIdType=\"pii\" ValidYN=\"Y\">S0022-0302(15)00395-1</ELocationID>\n            <Abstract>\n                <AbstractText>As part of a broader control strategy within herds known to be infected with Mycobacterium avium ssp. paratuberculosis (MAP), individual animal testing is generally conducted to identify infected animals for action, usually culling. Opportunities are now available to quantitatively compare different testing strategies (combinations of tests) in known infected herds. This study evaluates the effectiveness, cost, and cost-effectiveness of different testing strategies to identify infected animals at a single round of testing within dairy herds known to be MAP infected. A model was developed, taking account of both within-herd infection dynamics and test performance, to simulate the use of different tests at a single round of testing in a known infected herd. Model inputs included the number of animals at different stages of infection, the sensitivity and specificity of each test, and the costs of testing and culling. Testing strategies included either milk or serum ELISA alone or with fecal culture in series. Model outputs included effectiveness (detection fraction, the proportion of truly infected animals in the herd that are successfully detected by the testing strategy), cost, and cost-effectiveness (testing cost per true positive detected, total cost per true positive detected). Several assumptions were made: MAP was introduced with a single animal and no management interventions were implemented to limit within-herd transmission of MAP before this test. In medium herds, between 7 and 26% of infected animals are detected at a single round of testing, the former using the milk ELISA and fecal culture in series 5 yr after MAP introduction and the latter using fecal culture alone 15 yr after MAP introduction. The combined costs of testing and culling at a single round of testing increases with time since introduction of MAP infection, with culling costs being much greater than testing costs. The cost-effectiveness of testing varied by testing strategy. It was also greater at 5 yr, compared with 10 or 15 yr, since MAP introduction, highlighting the importance of early detection. Future work is needed to evaluate these testing strategies in subsequent rounds of testing as well as accounting for different herd dynamics and different levels of herd biocontainment.</AbstractText>\n                <CopyrightInformation>Copyright © 2015 American Dairy Science Association. Published by Elsevier Inc. All rights reserved.</CopyrightInformation>\n            </Abstract>\n            <AuthorList CompleteYN=\"Y\">\n                <Author ValidYN=\"Y\">\n                    <LastName>More</LastName>\n                    <ForeName>S J</ForeName>\n                    <Initials>SJ</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Centre for Veterinary Epidemiology and Risk Analysis, UCD School of Veterinary Medicine, University College Dublin, Belfield, Dublin 4, Ireland. Electronic address: simon.more@ucd.ie.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Cameron</LastName>\n                    <ForeName>A R</ForeName>\n                    <Initials>AR</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>AusVet Animal Health Services Pty Ltd., 69001 Lyon, France.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Strain</LastName>\n                    <ForeName>S</ForeName>\n                    <Initials>S</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Animal Health &amp; Welfare Northern Ireland, Dungannon BT71 7DX, Northern Ireland.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Cashman</LastName>\n                    <ForeName>W</ForeName>\n                    <Initials>W</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Riverstown Cross, Glanmire, Co. Cork, Ireland.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Ezanno</LastName>\n                    <ForeName>P</ForeName>\n                    <Initials>P</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>INRA, Oniris, LUNAM Université, UMR1300 Biologie, Epidémiologie et Analyse de Risque en Santé Animale, CS 40706, F-44307 Nantes, France.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Kenny</LastName>\n                    <ForeName>K</ForeName>\n                    <Initials>K</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Central Veterinary Research Laboratory, Department of Agriculture, Food and the Marine, Backweston, Cellbridge, Co. Kildare, Ireland.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Fourichon</LastName>\n                    <ForeName>C</ForeName>\n                    <Initials>C</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>INRA, Oniris, LUNAM Université, UMR1300 Biologie, Epidémiologie et Analyse de Risque en Santé Animale, CS 40706, F-44307 Nantes, France.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author ValidYN=\"Y\">\n                    <LastName>Graham</LastName>\n                    <ForeName>D</ForeName>\n                    <Initials>D</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Animal Health Ireland, Main Street, Carrick-on-Shannon, Co. Leitrim, Ireland.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n            </AuthorList>\n            <Language>eng</Language>\n            <PublicationTypeList>\n                <PublicationType UI=\"D016428\">Journal Article</PublicationType>\n                <PublicationType UI=\"D013485\">Research Support, Non-U.S. Gov't</PublicationType>\n            </PublicationTypeList>\n            <ArticleDate DateType=\"Electronic\">\n                <Year>2015</Year>\n                <Month>07</Month>\n                <Day>07</Day>\n            </ArticleDate>\n        </Article>\n        <MedlineJournalInfo>\n            <Country>United States</Country>\n            <MedlineTA>J Dairy Sci</MedlineTA>\n            <NlmUniqueID>2985126R</NlmUniqueID>\n            <ISSNLinking>0022-0302</ISSNLinking>\n        </MedlineJournalInfo>\n        <CitationSubset>IM</CitationSubset>\n        <KeywordList Owner=\"NOTNLM\">\n            <Keyword MajorTopicYN=\"N\">Johne’s disease</Keyword>\n            <Keyword MajorTopicYN=\"N\">control</Keyword>\n            <Keyword MajorTopicYN=\"N\">evaluation</Keyword>\n            <Keyword MajorTopicYN=\"N\">infected herd</Keyword>\n            <Keyword MajorTopicYN=\"N\">testing strategies</Keyword>\n        </KeywordList>\n    </MedlineCitation>\n    <PubmedData>\n        <History>\n            <PubMedPubDate PubStatus=\"received\">\n                <Year>2014</Year>\n                <Month>4</Month>\n                <Day>7</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"accepted\">\n                <Year>2015</Year>\n                <Month>4</Month>\n                <Day>24</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"aheadofprint\">\n                <Year>2015</Year>\n                <Month>7</Month>\n                <Day>7</Day>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2015</Year>\n                <Month>6</Month>\n                <Day>16</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2015</Year>\n                <Month>6</Month>\n                <Day>16</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2015</Year>\n                <Month>6</Month>\n                <Day>16</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"pubmed\">26074225</ArticleId>\n            <ArticleId IdType=\"pii\">S0022-0302(15)00395-1</ArticleId>\n            <ArticleId IdType=\"doi\">10.3168/jds.2014-8211</ArticleId>\n        </ArticleIdList>\n    </PubmedData>\n</PubmedArticle>\n\n\n<PubmedArticle>\n    <MedlineCitation Status=\"Publisher\" Owner=\"NLM\">\n        <PMID Version=\"1\">26166904</PMID>\n        <DateCreated>\n            <Year>2015</Year>\n            <Month>7</Month>\n            <Day>13</Day>\n        </DateCreated>\n        <DateRevised>\n            <Year>2015</Year>\n            <Month>7</Month>\n            <Day>19</Day>\n        </DateRevised>\n        <Article PubModel=\"Print\">\n            <Journal>\n                <ISSN IssnType=\"Print\">0035-9254</ISSN>\n                <JournalIssue CitedMedium=\"Print\">\n                    <Volume>64</Volume>\n                    <Issue>4</Issue>\n                    <PubDate>\n                        <Year>2015</Year>\n                        <Month>Aug</Month>\n                        <Day>1</Day>\n                    </PubDate>\n                </JournalIssue>\n                <Title>Journal of the Royal Statistical Society. Series C, Applied statistics</Title>\n                <ISOAbbreviation>J R Stat Soc Ser C Appl Stat</ISOAbbreviation>\n            </Journal>\n            <ArticleTitle>Optimal retesting configurations for hierarchical group testing.</ArticleTitle>\n            <Pagination>\n                <MedlinePgn>693-710</MedlinePgn>\n            </Pagination>\n            <Abstract>\n                <AbstractText NlmCategory=\"UNASSIGNED\">Hierarchical group testing is widely used to test individuals for diseases. This testing procedure works by first amalgamating individual specimens into groups for testing. Groups testing negatively have their members declared negative. Groups testing positively are subsequently divided into smaller subgroups and are then retested to search for positive individuals. In our paper, we propose a new class of informative retesting procedures for hierarchical group testing that acknowledges heterogeneity among individuals. These procedures identify the optimal number of groups and their sizes at each testing stage in order to minimize the expected number of tests. We apply our proposals in two settings: 1) HIV testing programs that currently use three-stage hierarchical testing and 2) chlamydia and gonorrhea screening practices that currently use individual testing. For both applications, we show that substantial savings can be realized by our new procedures.</AbstractText>\n            </Abstract>\n            <AuthorList>\n                <Author>\n                    <LastName>Black</LastName>\n                    <ForeName>Michael S</ForeName>\n                    <Initials>MS</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Department of Mathematics, University of Wisconsin-Platteville, Platteville, WI 53818, USA, blackmi@uwplatt.edu.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author>\n                    <LastName>Bilder</LastName>\n                    <ForeName>Christopher R</ForeName>\n                    <Initials>CR</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Department of Statistics, University of Nebraska-Lincoln, Lincoln, NE 68583, USA.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n                <Author>\n                    <LastName>Tebbs</LastName>\n                    <ForeName>Joshua M</ForeName>\n                    <Initials>JM</Initials>\n                    <AffiliationInfo>\n                        <Affiliation>Department of Statistics, University of South Carolina, Columbia, SC 29208, USA, tebbs@stat.sc.edu.</Affiliation>\n                    </AffiliationInfo>\n                </Author>\n            </AuthorList>\n            <Language>ENG</Language>\n            <GrantList>\n                <Grant>\n                    <GrantID>R01 AI067373</GrantID>\n                    <Acronym>AI</Acronym>\n                    <Agency>NIAID NIH HHS</Agency>\n                    <Country>United States</Country>\n                </Grant>\n            </GrantList>\n            <PublicationTypeList>\n                <PublicationType UI=\"\">JOURNAL ARTICLE</PublicationType>\n            </PublicationTypeList>\n        </Article>\n        <MedlineJournalInfo>\n            <MedlineTA>J R Stat Soc Ser C Appl Stat</MedlineTA>\n            <NlmUniqueID>101086541</NlmUniqueID>\n            <ISSNLinking>0035-9254</ISSNLinking>\n        </MedlineJournalInfo>\n        <KeywordList Owner=\"NOTNLM\">\n            <Keyword MajorTopicYN=\"N\">Classification</Keyword>\n            <Keyword MajorTopicYN=\"N\">HIV</Keyword>\n            <Keyword MajorTopicYN=\"N\">Infertility Prevention Project</Keyword>\n            <Keyword MajorTopicYN=\"N\">Informative retesting</Keyword>\n            <Keyword MajorTopicYN=\"N\">Pooled testing</Keyword>\n            <Keyword MajorTopicYN=\"N\">Retesting</Keyword>\n        </KeywordList>\n    </MedlineCitation>\n    <PubmedData>\n        <History>\n            <PubMedPubDate PubStatus=\"entrez\">\n                <Year>2015</Year>\n                <Month>7</Month>\n                <Day>14</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pubmed\">\n                <Year>2015</Year>\n                <Month>7</Month>\n                <Day>15</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"medline\">\n                <Year>2015</Year>\n                <Month>7</Month>\n                <Day>15</Day>\n                <Hour>6</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n            <PubMedPubDate PubStatus=\"pmc-release\">\n                <Year>2016</Year>\n                <Month>8</Month>\n                <Day>1</Day>\n                <Hour>0</Hour>\n                <Minute>0</Minute>\n            </PubMedPubDate>\n        </History>\n        <PublicationStatus>ppublish</PublicationStatus>\n        <ArticleIdList>\n            <ArticleId IdType=\"doi\">10.1111/rssc.12097</ArticleId>\n            <ArticleId IdType=\"pubmed\">26166904</ArticleId>\n            <ArticleId IdType=\"pmc\">PMC4495770</ArticleId>\n            <ArticleId IdType=\"mid\">NIHMS641826</ArticleId>\n        </ArticleIdList>\n        <?nihms?>\n    </PubmedData>\n</PubmedArticle>\n\n</PubmedArticleSet>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Evaluation of testing strategies to identify infected animals at a single round of testing within dairy herds known to be infected with Mycobacterium avium ssp. paratuberculosis",
				"creators": [
					{
						"firstName": "S. J.",
						"lastName": "More",
						"creatorType": "author"
					},
					{
						"firstName": "A. R.",
						"lastName": "Cameron",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Strain",
						"creatorType": "author"
					},
					{
						"firstName": "W.",
						"lastName": "Cashman",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Ezanno",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Kenny",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Fourichon",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "Graham",
						"creatorType": "author"
					}
				],
				"date": "Aug 2015",
				"DOI": "10.3168/jds.2014-8211",
				"ISSN": "1525-3198",
				"abstractNote": "As part of a broader control strategy within herds known to be infected with Mycobacterium avium ssp. paratuberculosis (MAP), individual animal testing is generally conducted to identify infected animals for action, usually culling. Opportunities are now available to quantitatively compare different testing strategies (combinations of tests) in known infected herds. This study evaluates the effectiveness, cost, and cost-effectiveness of different testing strategies to identify infected animals at a single round of testing within dairy herds known to be MAP infected. A model was developed, taking account of both within-herd infection dynamics and test performance, to simulate the use of different tests at a single round of testing in a known infected herd. Model inputs included the number of animals at different stages of infection, the sensitivity and specificity of each test, and the costs of testing and culling. Testing strategies included either milk or serum ELISA alone or with fecal culture in series. Model outputs included effectiveness (detection fraction, the proportion of truly infected animals in the herd that are successfully detected by the testing strategy), cost, and cost-effectiveness (testing cost per true positive detected, total cost per true positive detected). Several assumptions were made: MAP was introduced with a single animal and no management interventions were implemented to limit within-herd transmission of MAP before this test. In medium herds, between 7 and 26% of infected animals are detected at a single round of testing, the former using the milk ELISA and fecal culture in series 5 yr after MAP introduction and the latter using fecal culture alone 15 yr after MAP introduction. The combined costs of testing and culling at a single round of testing increases with time since introduction of MAP infection, with culling costs being much greater than testing costs. The cost-effectiveness of testing varied by testing strategy. It was also greater at 5 yr, compared with 10 or 15 yr, since MAP introduction, highlighting the importance of early detection. Future work is needed to evaluate these testing strategies in subsequent rounds of testing as well as accounting for different herd dynamics and different levels of herd biocontainment.",
				"extra": "PMID: 26074225",
				"issue": "8",
				"journalAbbreviation": "J. Dairy Sci.",
				"language": "eng",
				"pages": "5194-5210",
				"publicationTitle": "Journal of Dairy Science",
				"volume": "98",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Johne’s disease",
					"control",
					"evaluation",
					"infected herd",
					"testing strategies"
				],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Optimal retesting configurations for hierarchical group testing",
				"creators": [
					{
						"firstName": "Michael S.",
						"lastName": "Black",
						"creatorType": "author"
					},
					{
						"firstName": "Christopher R.",
						"lastName": "Bilder",
						"creatorType": "author"
					},
					{
						"firstName": "Joshua M.",
						"lastName": "Tebbs",
						"creatorType": "author"
					}
				],
				"date": "Aug 1, 2015",
				"DOI": "10.1111/rssc.12097",
				"ISSN": "0035-9254",
				"abstractNote": "Hierarchical group testing is widely used to test individuals for diseases. This testing procedure works by first amalgamating individual specimens into groups for testing. Groups testing negatively have their members declared negative. Groups testing positively are subsequently divided into smaller subgroups and are then retested to search for positive individuals. In our paper, we propose a new class of informative retesting procedures for hierarchical group testing that acknowledges heterogeneity among individuals. These procedures identify the optimal number of groups and their sizes at each testing stage in order to minimize the expected number of tests. We apply our proposals in two settings: 1) HIV testing programs that currently use three-stage hierarchical testing and 2) chlamydia and gonorrhea screening practices that currently use individual testing. For both applications, we show that substantial savings can be realized by our new procedures.",
				"extra": "PMID: 26166904\nPMCID: PMC4495770",
				"issue": "4",
				"journalAbbreviation": "J R Stat Soc Ser C Appl Stat",
				"language": "ENG",
				"pages": "693-710",
				"publicationTitle": "Journal of the Royal Statistical Society. Series C, Applied Statistics",
				"volume": "64",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Classification",
					"HIV",
					"Infertility Prevention Project",
					"Informative retesting",
					"Pooled testing",
					"Retesting"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
