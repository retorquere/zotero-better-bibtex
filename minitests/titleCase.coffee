state =
  opt:
    lang: 'en'
  locale:
    en:
      opts:
        "skip-words":["about","above","across","afore","after","against","along","alongside","amid","amidst","among","amongst","anenst","apropos","apud","around","as","aside","astride","at","athwart","atop","barring","before","behind","below","beneath","beside","besides","between","beyond","but","by","circa","despite","down","during","except","for","forenenst","from","given","in","inside","into","lest","like","modulo","near","next","notwithstanding","of","off","on","onto","out","over","per","plus","pro","qua","sans","since","than","through"," thru","throughout","thruout","till","to","toward","towards","under","underneath","until","unto","up","upon","versus","vs.","v.","vs","v","via","vis-à-vis","with","within","without","according to","ahead of","apart from","as for","as of","as per","as regards","aside from","back to","because of","close to","due to","except for","far from","inside of","instead of","near to","next to","on to","out from","out of","outside of","prior to","pursuant to","rather than","regardless of","such as","that of","up to","where as","or", "yet", "so", "for", "and", "nor", "a", "an", "the", "de", "d'", "von", "van", "c", "et", "ca"],
        "leading-noise-words": "a,an,the"

CSL.TAG_ESCAPE = (str) ->
  mx = str.match(/((?:\"|\')|(?:(?:<span\s+class=\"no(?:case|decor)\">).*?(?:<\/span>|<\/?(?:i|sc|b)>)))/g)
  lst = str.split(/(?:(?:\"|\')|(?:(?:<span\s+class=\"no(?:case|decor)\">).*?(?:<\/span>|<\/?(?:i|sc|b)>)))/g)
  myret = [ lst[0] ]
  pos = 1
  len = lst.length
  while pos < len
    myret.push(mx[pos - 1])
    myret.push(lst[pos])
    pos += 1
  lst = myret.slice()
  return lst

makeRegExp = (lst) ->
  lst = lst.slice()
  return new RegExp('(?:(?:[?!:]*\\s+|-|^)(?:' + lst.join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')

state.locale[state.opt.lang].opts["skip-words-regexp"] = makeRegExp(state.locale[state.opt.lang].opts["skip-words"])

titleCase = (string) ->
  string = string.replace(/\(/g, "(\x02 ")
  string = string.replace(/\)/g, " \x03)")
  string = CSL.Output.Formatters.title(state, string)
  string = string.replace(/\x02 /g, '')
  string = string.replace(/ \x03/g, '')
  return string

console.log(titleCase("Wisdom: A <i>metaheuristic</i> pragmatic (pragmatic) to <pre class=\"nocase\">orchestrate</pre>Mind and Virtue toward Excellence."))

