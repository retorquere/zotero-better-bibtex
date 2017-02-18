makeRegExp = (lst) -> new RegExp('(?:(?:[?!:]*\\s+|-|^)(?:' + lst.slice().join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')

state = {
  opt: { lang: 'en' },
  locale: {
    en: {
      opts: {
        'skip-words': CSL.SKIP_WORDS,
        'skip-words-regexp': makeRegExp(CSL.SKIP_WORDS)
      }
    }
  }
}
titleCase = (text) -> CSL.Output.Formatters.title(state, text)

console.log(titleCase("/ ' '"))

# console.log('parse particles:', CSL.parseParticles({family: 'Heyns', given: 'Emiliano'}))

# titles = require('./titleCase.json')

# display = (text) ->
#  return text.replace(/[^\x00-\x7F]/g, (match) -> "\\u#{('0000' + match.charCodeAt(0).toString(16).toUpperCase()).slice(-4)}")

# for input, expected of titles
#   found = titleCase(input)
#   if found != expected
#     console.log('input:', display(input))
#     console.log('output:', display(found))
#     console.log('  (or):', found)
#     console.log('expected:', display(expected))
#     console.log('    (or):', expected)
#     console.log('')
