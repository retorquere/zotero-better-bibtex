Zotero = {
  locale: 'en'
  CiteProc: {
    CSL: {
      DATE_PARTS_ALL: ['year', 'month', 'day', 'season']
    }
  }
  debug: (msg) -> console.log(msg)
  BetterBibTeX: {
    CSLMonths: {}
    Pref: {
      get: (key) ->
        switch key
          when 'defaultDateParserLocale' then return 'n'
        throw "Unexpected pref #{key}"
    }
  }
}
