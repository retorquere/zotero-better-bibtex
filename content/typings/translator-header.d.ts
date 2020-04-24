interface ITranslatorHeader {
  translatorID: string
  label: string
  target: string
  configOptions?: {
    getCollections?: boolean
  }
}
