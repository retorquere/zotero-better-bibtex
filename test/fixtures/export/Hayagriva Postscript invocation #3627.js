if (Translator.Hayagriva) {
  Zotero.debug("3-6-2-7 pre: ".replace(/-/g, '') + JSON.stringify(hayagriva))
  hayagriva.author = hayagriva.author.map(a => a.toUpperCase())
  Zotero.debug("3-6-2-7 post: ".replace(/-/g, '') + JSON.stringify(hayagriva))
}
