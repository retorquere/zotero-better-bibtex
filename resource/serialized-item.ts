export interface ISerializedItem {
  DOI: any // [conferencePaper, journalArticle]
  ISBN: any // [audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, encyclopediaArticle, map, videoRecording]
  ISSN: any // [journalArticle, magazineArticle, newspaperArticle]
  abstractNote: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  accessDate: any // [artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  applicationNumber: any // [patent]
  archive: any // [artwork, audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast, videoRecording]
  archiveLocation: any // [artwork, audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast, videoRecording]
  artworkSize: any // [artwork]
  assignee: any // [patent]
  callNumber: any // [artwork, audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast, videoRecording]
  code: any // [bill, statute]
  codeNumber: any // [statute]
  committee: any // [hearing]
  conferenceName: any // [conferencePaper]
  country: any // [patent]
  court: any // [case]
  date: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage] case.dateDecided, patent.issueDate, statute.dateEnacted
  edition: any // [book, bookSection, dictionaryEntry, encyclopediaArticle, map, newspaperArticle]
  extra: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  filingDate: any // [patent]
  history: any // [bill, case, hearing, statute]
  issue: any // [journalArticle, magazineArticle]
  issuingAuthority: any // [patent]
  journalAbbreviation: any // [journalArticle]
  language: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  legalStatus: any // [patent]
  legislativeBody: any // [bill, hearing]
  libraryCatalog: any // [artwork, audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast, videoRecording]
  medium: any // [artwork, audioRecording, film, interview, podcast, radioBroadcast, tvBroadcast, videoRecording] artwork.artworkMedium, audioRecording.audioRecordingFormat, film.videoRecordingFormat, interview.interviewMedium, podcast.audioFileType, radioBroadcast.audioRecordingFormat, tvBroadcast.videoRecordingFormat, videoRecording.videoRecordingFormat
  meetingName: any // [presentation]
  numPages: any // [book, manuscript, thesis]
  number: any // [bill, case, hearing, patent, podcast, radioBroadcast, report, statute, tvBroadcast] bill.billNumber, case.docketNumber, hearing.documentNumber, patent.patentNumber, podcast.episodeNumber, radioBroadcast.episodeNumber, report.reportNumber, statute.publicLawNumber, tvBroadcast.episodeNumber
  numberOfVolumes: any // [audioRecording, book, bookSection, dictionaryEntry, encyclopediaArticle, hearing, videoRecording]
  pages: any // [bill, bookSection, case, conferencePaper, dictionaryEntry, encyclopediaArticle, hearing, journalArticle, magazineArticle, newspaperArticle, patent, report, statute] bill.codePages, case.firstPage
  place: any // [audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, encyclopediaArticle, hearing, manuscript, map, newspaperArticle, patent, presentation, radioBroadcast, report, thesis, tvBroadcast, videoRecording]
  priorityNumbers: any // [patent]
  programmingLanguage: any // [computerProgram]
  publicationTitle: any // [blogPost, bookSection, conferencePaper, dictionaryEntry, encyclopediaArticle, forumPost, journalArticle, magazineArticle, newspaperArticle, radioBroadcast, tvBroadcast, webpage] blogPost.blogTitle, bookSection.bookTitle, conferencePaper.proceedingsTitle, dictionaryEntry.dictionaryTitle, encyclopediaArticle.encyclopediaTitle, forumPost.forumTitle, radioBroadcast.programTitle, tvBroadcast.programTitle, webpage.websiteTitle
  publisher: any // [audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry, document, encyclopediaArticle, film, hearing, map, radioBroadcast, report, thesis, tvBroadcast, videoRecording] audioRecording.label, computerProgram.company, film.distributor, radioBroadcast.network, report.institution, thesis.university, tvBroadcast.network, videoRecording.studio
  references: any // [patent]
  reporter: any // [case]
  rights: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  runningTime: any // [audioRecording, film, podcast, radioBroadcast, tvBroadcast, videoRecording]
  scale: any // [map]
  section: any // [bill, newspaperArticle, statute]
  series: any // [book, bookSection, conferencePaper, dictionaryEntry, encyclopediaArticle, journalArticle]
  seriesNumber: any // [book, bookSection, dictionaryEntry, encyclopediaArticle]
  seriesText: any // [journalArticle]
  seriesTitle: any // [audioRecording, computerProgram, journalArticle, map, podcast, report, videoRecording]
  session: any // [bill, hearing, statute]
  shortTitle: any // [artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  system: any // [computerProgram]
  title: any // [artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage] case.caseName, email.subject, statute.nameOfAct
  type: any // [blogPost, film, forumPost, letter, manuscript, map, presentation, report, thesis, webpage] blogPost.websiteType, film.genre, forumPost.postType, letter.letterType, manuscript.manuscriptType, map.mapType, presentation.presentationType, report.reportType, thesis.thesisType, webpage.websiteType
  url: any // [artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage]
  versionNumber: any // [computerProgram]
  volume: any // [audioRecording, bill, book, bookSection, case, conferencePaper, dictionaryEntry, encyclopediaArticle, journalArticle, magazineArticle, videoRecording] bill.codeVolume, case.reporterVolume

  itemType: string // artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case, computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage
  dateModified: string
  dateAdded: string
  notes: string[]
  tags: string[]
  collections: any[]
  creators: any[]
  attachments: any[]
  itemID: any
  multi: any

  referenceType: string
  cslType: string
  cslVolumeTitle: string
  citekey: string
  extraFields: { bibtex: { [key: string]: { name: string, type: string, value: any } }, csl: { [key: string]: { name: string, type: string, value: any } }, kv: { [key: string]: { name: string, type: string, value: string, raw?: boolean } } }
  arXiv: { eprint: string, source?: string, id: string, primaryClass?: string }
}
