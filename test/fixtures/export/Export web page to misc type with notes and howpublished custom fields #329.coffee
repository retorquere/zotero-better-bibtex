try
  if @item.itemType == 'webpage' && Translator.BetterBibTeX
    @add({ name: 'note', value: "(accessed #{@has.urldate.value})"}) if @has.urldate
    @add({ name: 'howpublished', bibtex: "{\\url#{@has.url.bibtex}}"}) if @has.url

catch err
  Translator.debug('urldate error', err.message)
