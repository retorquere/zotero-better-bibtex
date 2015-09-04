start =
  expression

expression "expression" =
  _ atom:atom {return atom;}
/ _ "'" "(" exps:expression+ ")" _ {return ['quote', exps];}
/ _ "(" exps:expression+ ")" _ {return exps;}

atom "atom" =
  chars:validChars+ {return chars.join("");}
/ number

validChars "valid chars" =
  [a-zA-Z_?!+\<\>\-=@#$%^&*/.]

number "number" =
  nums:[0-9]+ {return parseInt(nums.join(""), 10);}

_ = (whitespace / eol / comment)*

comment "comment" =
    ";" [^\n\r]*

eol "line end" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029"

whitespace "whitespace" =
    [ \t\v\f\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]
