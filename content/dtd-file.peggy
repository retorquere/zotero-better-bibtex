start = strings:string* {
      return strings.reduce((acc, string) => {
        if (string) {
          if (acc[string.key] && acc[string.key] !== string.value) throw new Error(`duplicate definition of ${string.key}`)
          acc[string.key] = string.value
        }
        return acc
      }, {})
    }

string
  = _ { return null }
  / '<!--' comment* '-->' { return null }
  / '<!' _? 'entity'i _ key:key _ value:value _? '>' {
      value = value.replace(/&([^;]+);/g, (m, name) => {
        switch (name) {
          case 'amp': return '&'
          case 'quot': return '"'
          case 'lt': return '<'
          case 'gt': return '>'
          default: throw new Error(`Unhandled entity ${m}`)
        }
      })
      return { key, value }
    }

comment
  = !'-->' '-'
  / [^-]

key = key:$[-a-zA-Z0-9._]+ { return key }

value
  = "'" value:$[^']* "'" { return value }
  / '"' value:$[^"]* '"' { return value }

_ = [ \t\n\r]+

