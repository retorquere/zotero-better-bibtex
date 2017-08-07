try {
  if (this.item.itemType === 'webpage' && BetterBibTeX.BetterBibTeX) {
    if (this.has.urldate) {
      this.add({ name: 'note', value: "(accessed " + this.has.urldate.value + ")" });
    }
    if (this.has.url) {
      this.add({ name: 'howpublished', bibtex: "{\\url" + this.has.url.bibtex + "}" });
    }
  }
} catch (err) {
  Zotero.debug('urldate error', err.message);
}
