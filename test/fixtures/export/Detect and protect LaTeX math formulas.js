if ((Translator.BetterBibTeX || Translator.BetterBibLaTeX) && this.has.title) {
  this.add({ name: 'title', value: item.title.replace(/(\$.*?\$)/g, '<pre>$1</pre>') });
}
