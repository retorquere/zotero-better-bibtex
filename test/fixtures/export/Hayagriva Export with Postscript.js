if (Translator.Hayagriva) {
  Zotero.debug("Extra fields: " + JSON.stringify(extra))
  target.author = target.author.map(a => a.toUpperCase())
}
