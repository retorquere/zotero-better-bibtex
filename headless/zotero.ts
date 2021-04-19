export const Zotero = new class {
  Debug = { enabled: true }
  export(translator: string, preferences, options, items, collections) {
    console.log(translator)
  }
}
