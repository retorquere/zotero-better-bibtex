export declare namespace Cache {
  interface ExportedItemMetadata {
    DeclarePrefChars: string
    noopsort: boolean
    packages: string[]
  }

  interface ExportedItem {
    itemID: number
    reference: string // exported reference

    exportNotes: boolean
    useJournalAbbreviation: boolean

    DOIandURL: boolean
    asciiBibLaTeX: boolean
    asciiBibTeX: boolean
    biblatexExtendedNameFormat: boolean
    bibtexParticleNoOp: boolean
    bibtexURL: string

    metadata: ExportedItemMetadata
  }

  interface Serialized {
    itemID: number,
    legacy: boolean
    skipChildItems: boolean
    item: any
  }
}
