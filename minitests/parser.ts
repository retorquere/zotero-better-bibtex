import { HTMLParser } from '../content/markupparser'
import { Preferences as Prefs } from './prefs'

function walk(node, level = 0) {
  if (node.nodeName === '#text') return node.value

  for (const mark of ['smallcaps', 'nocase', 'relax', 'enquote']) {
    if (node[mark]) node.attr[mark] = mark
  }

  let html = `<${node.nodeName}`
  for (const [attr, v] of Object.entries(node.attr)) {
    html += ` ${attr}="${v}"`
  }
  html += '>'
  if (node.childNodes) {
    for (const child of node.childNodes) {
      html += walk(child, level + 1)
    }
  }
  html += `</${node.nodeName}>`

  return html
}

const strings = [
  {
    text: 'I like ISDN heaps better than dialup',
    options: { caseConversion: true },
    preferences: { exportTitleCase: false }
  }
]

/*
for (const item of require('../test/fixtures/export/Extra semicolon in biblatexadata causes export failure #133.json').items) {
  // strings.push({ text: item.abstractNote })
}

for (const item of require('../test/fixtures/export/Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253.json').items) {
  // strings.push({ text: item.abstractNote })
}

for (const item of require('../test/fixtures/export/Be robust against misconfigured journal abbreviator #127.json').items) {
  // strings.push({ text: item.title, options: { caseConversion: true } })
}

for (const item of require('../test/fixtures/export/markup small-caps, superscript, italics #301.json').items) {
  // strings.push({ text: item.title, options: { caseConversion: true } })
}

// strings.push('Dates incorrect when Zotero date field includes times #934')
// strings.push("<div><div><p class='nocase'>In the past <nc>thirty years<nc>, historians have <script>broadened the scope </script> of their discipline to include many previously neglected topics and perspectives. They have chronicled language, madness, gender, and sexuality and have experimented with new forms of presentation. They have turned to the histories of non-Western peoples and to the troubled relations between “the West” and the rest. Allan Megill welcomes these developments, but he also suggests that there is now confusion among historians about what counts as a justified account of the past.<br><br> In <i>Historical Knowledge, Historical Error</i>, Megill dispels some of the confusion. Here, he discusses issues of narrative, objectivity, and memory. He attacks what he sees as irresponsible uses of evidence while accepting the art of speculation, which incomplete evidence forces upon historians. Along the way, he offers succinct accounts of the epistemological road historians have traveled from Herodotus and Thucydides through Leopold von Ranke and Alexis de Tocqueville, and on to Hayden White, Natalie Zemon Davis, and Lynn Hunt.</p></div></div>")

// strings.push('<i>tasty <span class="nocase">Thunnus thynnus</span></i>')
*/

for (let s of strings) {
  if (s.preferences) Prefs.preferences = s.preferences
  console.log(s.text)
  console.log(walk(HTMLParser.parse(s.text, s.options || {})))
}
