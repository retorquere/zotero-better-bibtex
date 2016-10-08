Translator.TitleCaser.state =
  opt: lang: 'en'
  locale: en: opts: {}

Translator.TitleCaser.titleCase = (text) ->
  opts = Translator.TitleCaser.state.locale[Translator.TitleCaser.state.opt.lang].opts
  if !opts['skip-words']
    opts['skip-words'] = Translator.TitleCaser.SKIP_WORDS
    opts['skip-words-regexp'] = new RegExp( '(?:(?:[?!:]*\\s+|-|^)(?:' + opts['skip-words'].map((term) -> term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]\s*/g, '\\$&')).join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')
  return Translator.TitleCaser.Output.Formatters.title(Translator.TitleCaser.state, text)
