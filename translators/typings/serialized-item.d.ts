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

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram,
  // conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing,
  // instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map,
  // newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  abstractNote: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  // computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  // forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript,
  // map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  accessDate: string

  // exists on patent
  applicationNumber: string

  // exists on artwork, audioRecording, book, bookSection, computerProgram, conferencePaper,
  // dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter,
  // magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast,
  // videoRecording
  archive: string

  // exists on artwork, audioRecording, book, bookSection, computerProgram, conferencePaper,
  // dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter,
  // magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast,
  // videoRecording
  archiveLocation: string

  // exists on artwork
  artworkSize: string

  // exists on patent
  assignee: string

  // exists on artwork, audioRecording, book, bookSection, computerProgram, conferencePaper,
  // dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter,
  // magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast,
  // videoRecording
  callNumber: string

  // exists on bill, statute
  code: string

  // exists on statute
  codeNumber: string

  // exists on hearing
  committee: string

  // exists on conferencePaper
  conferenceName: string

  // exists on patent
  country: string

  // exists on case
  court: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram,
  // conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing,
  // instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map,
  // newspaperArticle, patent, presentation, radioBroadcast, report, statute, thesis, tvBroadcast,
  // videoRecording, webpage
  // also known as case.dateDecided, patent.issueDate, statute.dateEnacted
  date: string

  // exists on conferencePaper, journalArticle
  DOI: string

  // exists on book, bookSection, dictionaryEntry, encyclopediaArticle, map, newspaperArticle
  edition: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram,
  // conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing,
  // instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map,
  // newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  extra: string

  // exists on patent
  filingDate: string

  // exists on bill, case, hearing, statute
  history: string

  // exists on audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry,
  // encyclopediaArticle, map, videoRecording
  ISBN: string

  // exists on journalArticle, magazineArticle, newspaperArticle
  ISSN: string

  // exists on journalArticle, magazineArticle
  issue: string

  // exists on patent
  issuingAuthority: string

  // exists on journalArticle
  journalAbbreviation: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, conferencePaper,
  // dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing, instantMessage,
  // interview, journalArticle, letter, magazineArticle, manuscript, map, newspaperArticle, patent,
  // podcast, presentation, radioBroadcast, report, statute, thesis, tvBroadcast, videoRecording, webpage
  language: string

  // exists on patent
  legalStatus: string

  // exists on bill, hearing
  legislativeBody: string

  // exists on artwork, audioRecording, book, bookSection, computerProgram, conferencePaper,
  // dictionaryEntry, document, encyclopediaArticle, film, interview, journalArticle, letter,
  // magazineArticle, manuscript, map, newspaperArticle, radioBroadcast, report, thesis, tvBroadcast,
  // videoRecording
  libraryCatalog: string

  // exists on artwork, audioRecording, film, interview, podcast, radioBroadcast, tvBroadcast,
  // videoRecording
  // also known as artwork.artworkMedium, audioRecording.audioRecordingFormat, film.videoRecordingFormat,
  // interview.interviewMedium, podcast.audioFileType, radioBroadcast.audioRecordingFormat,
  // tvBroadcast.videoRecordingFormat, videoRecording.videoRecordingFormat
  medium: string

  // exists on presentation
  meetingName: string

  // exists on note
  note: string

  // exists on bill, case, hearing, patent, podcast, radioBroadcast, report, statute, tvBroadcast
  // also known as bill.billNumber, case.docketNumber, hearing.documentNumber, patent.patentNumber,
  // podcast.episodeNumber, radioBroadcast.episodeNumber, report.reportNumber, statute.publicLawNumber,
  // tvBroadcast.episodeNumber
  number: string

  // exists on audioRecording, book, bookSection, dictionaryEntry, encyclopediaArticle, hearing,
  // videoRecording
  numberOfVolumes: string

  // exists on book, manuscript, thesis
  numPages: string

  // exists on bill, bookSection, case, conferencePaper, dictionaryEntry, encyclopediaArticle, hearing,
  // journalArticle, magazineArticle, newspaperArticle, patent, report, statute
  // also known as bill.codePages, case.firstPage
  pages: string

  // exists on audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry,
  // encyclopediaArticle, hearing, manuscript, map, newspaperArticle, patent, presentation,
  // radioBroadcast, report, thesis, tvBroadcast, videoRecording
  place: string

  // exists on patent
  priorityNumbers: string

  // exists on computerProgram
  programmingLanguage: string

  // exists on blogPost, bookSection, conferencePaper, dictionaryEntry, encyclopediaArticle, forumPost,
  // journalArticle, magazineArticle, newspaperArticle, radioBroadcast, tvBroadcast, webpage
  // also known as blogPost.blogTitle, bookSection.bookTitle, conferencePaper.proceedingsTitle,
  // dictionaryEntry.dictionaryTitle, encyclopediaArticle.encyclopediaTitle, forumPost.forumTitle,
  // radioBroadcast.programTitle, tvBroadcast.programTitle, webpage.websiteTitle
  publicationTitle: string

  // exists on audioRecording, book, bookSection, computerProgram, conferencePaper, dictionaryEntry,
  // document, encyclopediaArticle, film, hearing, map, radioBroadcast, report, thesis, tvBroadcast,
  // videoRecording
  // also known as audioRecording.label, computerProgram.company, film.distributor,
  // radioBroadcast.network, report.institution, thesis.university, tvBroadcast.network,
  // videoRecording.studio
  publisher: string

  // exists on patent
  references: string

  // exists on case
  reporter: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram,
  // conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing,
  // instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map,
  // newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  rights: string

  // exists on audioRecording, film, podcast, radioBroadcast, tvBroadcast, videoRecording
  runningTime: string

  // exists on map
  scale: string

  // exists on bill, newspaperArticle, statute
  section: string

  // exists on book, bookSection, conferencePaper, dictionaryEntry, encyclopediaArticle, journalArticle
  series: string

  // exists on book, bookSection, dictionaryEntry, encyclopediaArticle
  seriesNumber: string

  // exists on journalArticle
  seriesText: string

  // exists on audioRecording, computerProgram, journalArticle, map, podcast, report, videoRecording
  seriesTitle: string

  // exists on bill, hearing, statute
  session: string

  // exists on artwork, audioRecording, bill, blogPost, book, bookSection, case, computerProgram,
  // conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film, forumPost, hearing,
  // instantMessage, interview, journalArticle, letter, magazineArticle, manuscript, map,
  // newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  shortTitle: string

  // exists on computerProgram
  system: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  // computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  // forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript,
  // map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  // also known as case.caseName, email.subject, statute.nameOfAct
  title: string

  // exists on blogPost, film, forumPost, letter, manuscript, map, presentation, report, thesis, webpage
  // also known as blogPost.websiteType, film.genre, forumPost.postType, letter.letterType,
  // manuscript.manuscriptType, map.mapType, presentation.presentationType, report.reportType,
  // thesis.thesisType, webpage.websiteType
  type: string

  // exists on artwork, attachment, audioRecording, bill, blogPost, book, bookSection, case,
  // computerProgram, conferencePaper, dictionaryEntry, document, email, encyclopediaArticle, film,
  // forumPost, hearing, instantMessage, interview, journalArticle, letter, magazineArticle, manuscript,
  // map, newspaperArticle, patent, podcast, presentation, radioBroadcast, report, statute, thesis,
  // tvBroadcast, videoRecording, webpage
  url: string

  // exists on computerProgram
  versionNumber: string

  // exists on audioRecording, bill, book, bookSection, case, conferencePaper, dictionaryEntry,
  // encyclopediaArticle, journalArticle, magazineArticle, videoRecording
  // also known as bill.codeVolume, case.reporterVolume
  volume: string

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
