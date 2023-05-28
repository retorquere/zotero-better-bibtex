start = strings:string* {
      return strings.reduce((acc, string) => {
        if (string) acc[string.key] = string.value
        return acc
      }, {})
    }

string
  = _ { return null }
  / '<!--' comment* '-->' { return null }
  / '<!' _? 'entity'i _ key:key _ value:value _? '>' { return { key, value } }

comment
  = !'-->' '-'
  / [^-]

key = key:$[-a-zA-Z0-9._]+ { return key }

value
  = "'" value:$[^']* "'" { return value }
  / '"' value:$[^"]* '"' { return value }

_ = [ \t\n\r]+

