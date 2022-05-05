// Utilities
const lowerCase = require('./lower-case')
const specials = [] // require('./specials')

const word = "[^\\s'’\\(\\)!?;:\"-]"
const regex = new RegExp(`(?:(?:(\\s?(?:^|[.\\(\\)!?;:"-])\\s*)(${word}))|(${word}))(${word}*[’']*${word}*)`, "g")

const convertToRegExp = specials => specials.map(s => [new RegExp(`\\b${s}\\b`, 'gi'), s])

function parseMatch(match) {
  const firstCharacter = match[0]

  // test first character
  if (/\s/.test(firstCharacter)) {
    // if whitespace - trim and return
    return match.substr(1)
  }
  if (/[\(\)]/.test(firstCharacter)) {
    // if parens - this shouldn't be replaced
    return null
  }

  return match
}

module.exports = (str, options = {}) => {
  str = str.toLowerCase().replace(regex, (m, lead = '', forced, lower, rest, offset, string) => {
    const isLastWord = m.length + offset >= string.length;

    const parsedMatch = parseMatch(m)
    if (!parsedMatch) {
      return m
    }
    if (!forced) {
      const fullLower = lower + rest

      if (lowerCase.has(fullLower) && !isLastWord) {
        return parsedMatch
      }
    }

    return lead + (lower || forced).toUpperCase() + rest
  })

  const customSpecials = options.special || []
  const replace = [...specials, ...customSpecials]
  const replaceRegExp = convertToRegExp(replace)

  replaceRegExp.forEach(([pattern, s]) => {
    str = str.replace(pattern, s)
  })

  return str
}
