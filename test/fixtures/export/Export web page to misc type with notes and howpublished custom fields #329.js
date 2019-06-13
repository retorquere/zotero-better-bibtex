try {
  if (item.itemType === 'webpage' && Translator.BetterBibTeX) {
    if (item.accessDate) {
      const accessed = item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '')
      reference.add({ name: 'note', value: "(accessed " + accessed + ")" });
    }
    if (item.url) {
      // this (ab)uses the default latex encoder and wraps the result
      reference.add({ name: 'howpublished', value: item.url });
      reference.add({ name: 'howpublished', bibtex: "{\\url" + reference.has.howpublished.bibtex + "}" });

      // another way would be
      // reference.add({ name: 'howpublished', bibtex: "{\\url{" + reference.enc_latex({ value: item.url }) + "}}" });
    }
  }
} catch (err) {
  Zotero.debug('urldate error', err.message);
}
