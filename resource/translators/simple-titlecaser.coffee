Translator.simpleTitleCaser =
  titleCase: (str) ->
    return str unless str

    @smallWords ||= ///^(#{(term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]\s*/g, "\\$&") for term in (Translator.titleCaseLowerCase || Translator.TitleCaser.SKIP_WORDS)).join('|')})$///i

    return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) =>
      if index > 0 and index + match.length != title.length and match.search(@smallWords) > -1 and title.charAt(index - 2) != ':' and (title.charAt(index + match.length) != '-' or title.charAt(index - 1) == '-') and title.charAt(index - 1).search(/[^\s-]/) < 0
        return match.toLowerCase()
      if match.substr(1).search(/[A-Z]|\../) > -1
        return match
      return match.charAt(0).toUpperCase() + match.substr(1)
    )
