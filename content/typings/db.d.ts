namespace Types {
  namespace DB {
    namespace Cache {
      class ExportedItemMetadata {
        DeclarePrefChars: string
        noopsort: boolean
      }

      class ExportedItem {
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

      interface ISerialized {
        itemID: number,
        legacy: boolean
        skipChildItems: boolean
        item: any
      }
    }
  }
}
