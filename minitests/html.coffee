
Translator.csquotes = {
  open: '‹«'
  close: '›»'
}
Translator.titleCaseLowerCase = '''
  about above across afore after against along
  alongside amid amidst among amongst anenst apropos apud around as
  aside astride at athwart atop barring before behind below beneath
  beside besides between beyond but by circa despite down during
  except for forenenst from given in inside into lest like modulo
  near next notwithstanding of off on onto out over per plus pro qua
  sans since than through thru throughout thruout till to toward
  towards under underneath until unto up upon versus vs. v. vs v via
  vis-à-vis with within without according to ahead of apart from as
  for as of as per as regards aside from back to because of close to
  due to except for far from inside of instead of near to next to on
  to out from out of outside of prior to pursuant to rather than
  regardless of such as that of up to where as or yet so and nor a
  an the de d' von van c et ca thru according ahead apart regards
  back because close due far instead outside prior pursuant rather
  regardless such their where
'''.replace(/\n/g, ' ').trim().split(/\s+/)

display = (html, options) ->
  lang = ((options.language || '<none>') + '        ').substr(0, 8)
  console.log("#{lang}: [#{html}]")
  #ast = Translator.MarkupParser.parse(html, {preserveCase: true})
  #console.log(JSON.stringify(ast))
  #console.log(Translator.TitleCaser.titleCase(html))

  options.caseConversion = ((options.language || 'en') == 'en')

  cp = LaTeX.text2latex(html, options)
  console.log("bibtex  : {#{cp}}")
  console.log('')

titles = [
  {html: "The largest U.S. companies would owe $620 billion in U.S. taxes on the cash they store in tax havens, the equivalent of our defense budget. [Tweet]"}
  {html: "<i><span class=\"nocase\">Nodo unitatis et caritatis</span></i>: The Structure and Argument of Augustine's <i><span class=\"nocase\">De doctrina Christiana</span></i>"}
  {html: "La démocratie. Sa nature, sa valeur", language: 'fr'}
  {html: "Social Capital Predicts Happiness: World-Wide Evidence From Time Series"}
  {html: "Lieb-Robinson bounds, Arveson spectrum and Haag-Ruelle scattering theory for gapped quantum spin systems"}
  {html: "<i>Salmonella</i> in Pork (SALINPORK): Pre-harvest and Harvest Control Options Based on Epidemiologic, Diagnostic and Economic Research: Final Report"}
  {html: "Automated Defect Prevention : Best Practices in Software Management"}
  {html: "(Liquid+liquid) equilibrium of {water+phenol+(1-butanol, or 2-butanol, or tert-butanol)} systems", language: 'en'}
  {html: "The physical: violent volcanology of the 1600 eruption of Huaynaputina, southern Peru"}
  {html: "Technical Report : Towards a Formally Verified Proof Assistant"}
  {html: "Full-text databse"}
  {html: "High Performance Computing (HiPC), 2011 18th international conference on"}
  {html: "High-speed jet flows over spillway aerators"}
  {html: "Replicate Zotero key algorithm · Issue #439 · retorquere/zotero-better-bibtex"}
  {html: "11-Oxygenated Steroids. XIII. Synthesis and proof of structure of <span class=\"nocase\">Δ1,4-Pregnadiene-17α,21-diol-3,11,20-trione and Δ1,4-Pregnadiene-11β,17α,21-triol-3,20-dione</span>"}
  {html: "Computational Models of Non-cooperative dialogue"}
  {html: "Dr. Strangelove or: how I learned to stop worrying and love the bomb"}
  {html: "The Multiobjective Traveling Salesman Problem: A Survey and a New Approach"}
  {html: "Classical signature of quantum annealing"}
  {html: "Defining and detecting quantum speedup"}
  {html: "Sozialpolitik und Sozialstaat: Soziologische Analysen", language: "de"}
  {html: "Effect of immobilization on catalytic characteristics of saturated Pd-N-heterocyclic carbenes in Mizoroki-Heck reactions"}
  {html: "High-speed Digital-to-RF converter"}
  {html: "Some remarks on <span class=\"nocase\">’t Hooft’s</span> S-matrix for black holes"}
  {html: "In memoriam, na cidade", language: 'por'}
  {html: "Norm and Action. A Logical Enquiry"}
  {html: "The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru"}
  {html: "Critique d'une métanotion fonctionnelle. La notion (trop) fonctionnelle de « notion fonctionnelle »", language: 'fr'}
]

for title in titles
  display(title.html, title)
