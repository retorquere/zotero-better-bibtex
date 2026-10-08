Zotero.debug("3627 entry: " + JSON.stringify(hayagriva))
if (Translator.Hayagriva) {
  Zotero.debug("Extra fields: " + JSON.stringify(extra))
  hayagriva.author = hayagriva.author.map(a => a.toUpperCase())
}
