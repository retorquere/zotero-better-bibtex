interface ISerializedItem {
  // fields common to all items
  itemID: string | number
  itemType: string
  dateAdded: string
  dateModified: string
  creators: { creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number }[]
  tags: string[]
  notes: string[]
  attachments: { path: string, title?: string, mimeType?: string }

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  //   forumPost, jurism.gazette, hearing, instantMessage, interview, journalArticle, letter,
  //   magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast,
  //   jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording, webpage
  abstractNote: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  //   jurism.classic, computerProgram, conferencePaper, dictionaryEntry, document, email,
  //   encyclopediaArticle, film, forumPost, jurism.gazette, hearing, instantMessage, interview,
  //   journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast,
  //   presentation, radioBroadcast, jurism.regulation, report, jurism.standard, statute, thesis,
  //   jurism.treaty, tvBroadcast, videoRecording, webpage
  accessDate: string

  // exists on patent
  applicationNumber: string

  // exists on artwork, audioRecording, book, bookSection, jurism.case, jurism.classic, computerProgram,
  //   conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle,
  //   letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report,
  //   jurism.standard, thesis, jurism.treaty, tvBroadcast, videoRecording
  archive: string

  // exists on artwork, audioRecording, jurism.bill, book, bookSection, jurism.case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film,
  //   jurism.hearing, interview, journalArticle, letter, magazineArticle, manuscript, map,
  //   newspaperArticle, radioBroadcast, report, jurism.standard, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording
  archiveLocation: string

  // exists on artwork
  artworkSize: string

  // exists on patent
  assignee: string

  // exists on artwork, audioRecording, book, bookSection, jurism.case, jurism.classic, computerProgram,
  //   conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle,
  //   letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report,
  //   jurism.standard, thesis, jurism.treaty, tvBroadcast, videoRecording
  callNumber: string

  // exists on bill, jurism.gazette, jurism.regulation, statute
  code: string

  // exists on jurism.gazette, jurism.regulation, statute
  codeNumber: string

  // exists on hearing, jurism.report
  committee: string

  // exists on conferencePaper
  conferenceName: string

  // exists on patent
  country: string

  // exists on case, jurism.newspaperArticle
  court: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  //   forumPost, jurism.gazette, hearing, instantMessage, interview, journalArticle, letter,
  //   magazineArticle, manuscript, map, newspaperArticle, patent, jurism.podcast, presentation,
  //   radioBroadcast, jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty,
  //   tvBroadcast, videoRecording, webpage
  // also known as case.dateDecided, jurism.gazette.dateEnacted, patent.issueDate,
  //   jurism.regulation.dateEnacted, statute.dateEnacted
  date: string

  // exists on conferencePaper, journalArticle
  DOI: string

  // exists on book, bookSection, dictionaryEntry, encyclopediaArticle, map, newspaperArticle
  edition: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  //   forumPost, jurism.gazette, hearing, instantMessage, interview, journalArticle, letter,
  //   magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast,
  //   jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording, webpage
  extra: string

  // exists on jurism.case, patent
  filingDate: string

  // exists on jurism.patent
  genre: string

  // exists on bill, case, jurism.gazette, hearing, jurism.regulation, statute
  history: string

  // exists on jurism.conferencePaper, jurism.report
  institution: string

  // exists on audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry,
  //   encyclopediaArticle, map, videoRecording
  ISBN: string

  // exists on journalArticle, magazineArticle, newspaperArticle
  ISSN: string

  // exists on jurism.case, jurism.conferencePaper, journalArticle, magazineArticle
  issue: string

  // exists on patent
  issuingAuthority: string

  // exists on journalArticle
  journalAbbreviation: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost,
  //   jurism.gazette, hearing, instantMessage, interview, journalArticle, letter, magazineArticle,
  //   manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast,
  //   jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording, webpage
  language: string

  // exists on patent
  legalStatus: string

  // exists on bill, hearing
  legislativeBody: string

  // exists on artwork, audioRecording, book, bookSection, jurism.classic, computerProgram,
  //   conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle,
  //   letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report,
  //   jurism.standard, thesis, jurism.treaty, tvBroadcast, videoRecording
  libraryCatalog: string

  // exists on artwork, audioRecording, jurism.book, film, interview, podcast, radioBroadcast,
  //   jurism.report, tvBroadcast, videoRecording
  // also known as artwork.artworkMedium, audioRecording.audioRecordingFormat, film.videoRecordingFormat,
  //   interview.interviewMedium, podcast.audioFileType, radioBroadcast.audioRecordingFormat,
  //   tvBroadcast.videoRecordingFormat, videoRecording.videoRecordingFormat
  medium: string

  // exists on presentation
  meetingName: string

  // exists on note
  note: string

  // exists on bill, case, jurism.gazette, hearing, patent, podcast, radioBroadcast, jurism.regulation,
  //   report, jurism.standard, statute, tvBroadcast
  // also known as bill.billNumber, case.docketNumber, jurism.gazette.publicLawNumber,
  //   hearing.documentNumber, patent.patentNumber, podcast.episodeNumber, radioBroadcast.episodeNumber,
  //   jurism.regulation.publicLawNumber, report.reportNumber, statute.publicLawNumber,
  //   tvBroadcast.episodeNumber
  number: string

  // exists on audioRecording, book, bookSection, dictionaryEntry, encyclopediaArticle, hearing,
  //   videoRecording
  numberOfVolumes: string

  // exists on book, jurism.classic, manuscript, thesis
  numPages: string

  // exists on bill, bookSection, case, conferencePaper, dictionaryEntry, encyclopediaArticle,
  //   jurism.gazette, hearing, journalArticle, magazineArticle, newspaperArticle, patent,
  //   jurism.regulation, report, statute, jurism.treaty
  // also known as bill.codePages, case.firstPage
  pages: string

  // exists on audioRecording, book, bookSection, jurism.case, jurism.classic, computerProgram,
  //   conferencePaper, dictionaryEntry, encyclopediaArticle, hearing, jurism.interview,
  //   jurism.magazineArticle, manuscript, map, newspaperArticle, patent, presentation, radioBroadcast,
  //   report, thesis, tvBroadcast, videoRecording
  place: string

  // exists on patent
  priorityNumbers: string

  // exists on computerProgram
  programmingLanguage: string

  // exists on jurism.artwork, blogPost, bookSection, jurism.case, conferencePaper, dictionaryEntry,
  //   encyclopediaArticle, forumPost, jurism.hearing, journalArticle, magazineArticle, newspaperArticle,
  //   radioBroadcast, jurism.report, tvBroadcast, webpage
  // also known as jurism.artwork.websiteTitle, blogPost.blogTitle, bookSection.bookTitle,
  //   jurism.case.reporter, conferencePaper.proceedingsTitle, dictionaryEntry.dictionaryTitle,
  //   encyclopediaArticle.encyclopediaTitle, forumPost.forumTitle, jurism.hearing.reporter,
  //   radioBroadcast.programTitle, jurism.report.bookTitle, tvBroadcast.programTitle,
  //   webpage.websiteTitle
  publicationTitle: string

  // exists on audioRecording, book, bookSection, jurism.case, computerProgram, conferencePaper,
  //   dictionaryEntry, document, encyclopediaArticle, film, jurism.gazette, hearing,
  //   jurism.magazineArticle, map, jurism.podcast, radioBroadcast, jurism.regulation, jurism.report,
  //   zotero.report, jurism.standard, jurism.statute, thesis, jurism.treaty, tvBroadcast, videoRecording
  // also known as audioRecording.label, computerProgram.company, film.distributor,
  //   radioBroadcast.network, zotero.report.institution, thesis.university, tvBroadcast.network,
  //   videoRecording.studio
  publisher: string

  // exists on patent
  references: string

  // exists on zotero.case, jurism.treaty
  reporter: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  //   forumPost, jurism.gazette, hearing, instantMessage, interview, journalArticle, letter,
  //   magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast,
  //   jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording, webpage
  rights: string

  // exists on audioRecording, film, podcast, radioBroadcast, tvBroadcast, videoRecording
  runningTime: string

  // exists on map
  scale: string

  // exists on bill, jurism.gazette, newspaperArticle, jurism.regulation, statute, jurism.treaty
  section: string

  // exists on book, bookSection, conferencePaper, dictionaryEntry, encyclopediaArticle, journalArticle
  series: string

  // exists on book, bookSection, dictionaryEntry, encyclopediaArticle
  seriesNumber: string

  // exists on journalArticle
  seriesText: string

  // exists on audioRecording, computerProgram, journalArticle, map, podcast, report, videoRecording
  seriesTitle: string

  // exists on bill, jurism.gazette, hearing, jurism.regulation, statute
  session: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, jurism.classic,
  //   computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  //   forumPost, jurism.gazette, hearing, instantMessage, interview, journalArticle, letter,
  //   magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast,
  //   jurism.regulation, report, jurism.standard, statute, thesis, jurism.treaty, tvBroadcast,
  //   videoRecording, webpage
  shortTitle: string

  // exists on computerProgram
  system: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  //   jurism.classic, computerProgram, conferencePaper, dictionaryEntry, document, email,
  //   encyclopediaArticle, film, forumPost, jurism.gazette, hearing, instantMessage, interview,
  //   journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast,
  //   presentation, radioBroadcast, jurism.regulation, report, jurism.standard, statute, thesis,
  //   jurism.treaty, tvBroadcast, videoRecording, webpage
  // also known as case.caseName, email.subject, jurism.gazette.nameOfAct, jurism.regulation.nameOfAct,
  //   statute.nameOfAct
  title: string

  // exists on blogPost, jurism.classic, film, forumPost, letter, manuscript, map, presentation, report,
  //   thesis, webpage
  // also known as blogPost.websiteType, jurism.classic.manuscriptType, film.genre, forumPost.postType,
  //   letter.letterType, manuscript.manuscriptType, map.mapType, presentation.presentationType,
  //   report.reportType, thesis.thesisType, webpage.websiteType
  type: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  //   jurism.classic, computerProgram, conferencePaper, dictionaryEntry, document, email,
  //   encyclopediaArticle, film, forumPost, jurism.gazette, hearing, instantMessage, interview,
  //   journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast,
  //   presentation, radioBroadcast, jurism.regulation, report, jurism.standard, statute, thesis,
  //   jurism.treaty, tvBroadcast, videoRecording, webpage
  url: string

  // exists on computerProgram, jurism.document, jurism.standard
  versionNumber: string

  // exists on audioRecording, bill, book, bookSection, case, jurism.classic, conferencePaper,
  //   dictionaryEntry, encyclopediaArticle, jurism.hearing, journalArticle, magazineArticle,
  //   jurism.treaty, videoRecording
  // also known as bill.codeVolume, case.reporterVolume
  volume: string

  // exists on jurism.videoRecording
  websiteTitle: string

  uri: string
  referenceType: string
  cslType: string
  cslVolumeTitle: string
  citekey: string
  collections: string[]
  extraFields: {
    bibtex: { [key: string]: { name: string, type: string, value: any } }
    csl: { [key: string]: { name: string, type: string, value: any } }
    kv: { [key: string]: { name: string, type: string, value: string, raw?: boolean } }
  }
  arXiv: { eprint: string, source?: string, id: string, primaryClass?: string }
  // Juris-M extras
  multi: any
}
