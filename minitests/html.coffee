
Translator.csquotes = {
  open: '‹«'
  close: '›»'
}
Translator.unicode = true

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
  console.log(options.source)
  console.log("#{lang}: `#{html}`")
  #ast = Translator.MarkupParser.parse(html, {preserveCase: true})
  #console.log(JSON.stringify(ast))
  console.log(Translator.TitleCaser.titleCase(html))

  options.caseConversion = ((options.language || 'en') == 'en')

  cp = LaTeX.text2latex(html, options)
  console.log("biblatex: {#{cp}}")
  console.log('')

titles = [
  {html: "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes.", language: "fr-FR", source: "test/fixtures/export/Better BibLaTeX.007.json"}
  {html: "The largest U.S. companies would owe $620 billion in U.S. taxes on the cash they store in tax havens, the equivalent of our defense budget. [Tweet]", source: "test/fixtures/export/Dollar sign in title not properly escaped #485.json"}
  {html: "En ny sociologi for et nyt samfund. Introduktion til Aktør-Netværk-Teori", language: "dan", source: "test/fixtures/export/map csl-json variables #293.json"}
  {html: "La démocratie. Sa nature, sa valeur", language: "fr-FR", source: "test/fixtures/export/map csl-json variables #293.json"}
  {html: "Social Capital Predicts Happiness: World-Wide Evidence From Time Series", source: "test/fixtures/export/Export Forthcoming as Forthcoming.json"}
  {html: "Le poêle de Descartes", language: "fr-FR", source: "test/fixtures/export/biblatex; Language tag xx is exported, xx-XX is not #380.json"}
  {html: "Œuvres de Descartes", language: "fr-FR", source: "test/fixtures/export/Normalize date ranges in citekeys #356.json"}
  {html: "Les interventions <i>éclairées</i> devant la Cour européenne des droits de l'homme ou le rôle stratégique des <i>amici curiae</i>", language: "fr-FR", source: "test/fixtures/export/markup small-caps, superscript, italics #301.json"}
  {html: "Opinion et conseil dans la doctrine juridique savante (<sc>xii</sc><sup>e</sup>-<sc>xiv</sc><sup>e</sup> siècles)", language: "fr-FR", source: "test/fixtures/export/markup small-caps, superscript, italics #301.json"}
  {html: "Les actes de l’Administration [1949-1950]", language: "fr-FR", source: "test/fixtures/export/don't escape entry key fields for #296.json"}
  {html: "Problèmes d’organisation de l’Administration [1966-1967]", language: "fr-FR", source: "test/fixtures/export/bookSection is always converted to @inbook, never @incollection #282.json"}
  {html: "Lieb-Robinson bounds, Arveson spectrum and Haag-Ruelle scattering theory for gapped quantum spin systems", source: "test/fixtures/export/Better BibTeX does not use biblatex fields eprint and eprinttype #170.json"}
  {html: "<i>Salmonella</i> in Pork (SALINPORK): Pre-harvest and Harvest Control Options Based on Epidemiologic, Diagnostic and Economic Research: Final Report", source: "test/fixtures/export/Capitalisation in techreport titles #160.json"}
  {html: "Planung öffentlicher Elektrizitätsverteilungs-Systeme", language: "German", source: "test/fixtures/export/German Umlaut separated by brackets #146.json"}
  {html: "(Liquid+liquid) equilibrium of {water+phenol+(1-butanol, or 2-butanol, or tert-butanol)} systems", language: "en", source: "test/fixtures/export/Better BibLaTeX.021.json"}
  {html: "The physical: violent volcanology of the 1600 eruption of Huaynaputina, southern Peru", source: "test/fixtures/export/Better BibLaTeX.016.json"}
  {html: "Comparing archival policies for Blue Waters", source: "test/fixtures/export/autoexport.json"}
  {html: "Application centric energy-efficiency study of distributed multi-core and hybrid CPU-GPU systems", source: "test/fixtures/export/autoexport.json"}
  {html: "An overview of CMIP5 and the Experiment Design", source: "test/fixtures/export/autoexport.json"}
  {html: "CTR Det multiple arkæologiske objekt. Et studie af materialitet og arkæologiske tekstiler", language: "nob", source: "test/fixtures/export/thesis zotero entries always create  bibtex entries #307.json"}
  {html: "A film", source: "test/fixtures/export/Export of creator-type fields from embedded CSL variables #365.json"}
  {html: "A report", source: "test/fixtures/export/Export of creator-type fields from embedded CSL variables #365.json"}
  {html: "Dr. Strangelove or: how I learned to stop worrying and love the bomb", source: "test/fixtures/export/Export of creator-type fields from embedded CSL variables #365.json"}
  {html: "The one with the Princess Leia fantasy", language: "en", source: "test/fixtures/export/Export of creator-type fields from embedded CSL variables #365.json"}
  {html: "BV Master Action for Heterotic and Type II String Field Theories", source: "test/fixtures/export/arXiv identifiers in BibLaTeX export #460.json"}
  {html: "Classical signature of quantum annealing", source: "test/fixtures/export/arXiv identifiers in BibLaTeX export #460.json"}
  {html: "Defining and detecting quantum speedup", source: "test/fixtures/export/arXiv identifiers in BibLaTeX export #460.json"}
  {html: "Sozialpolitik und Bevölkerungsprozeß", language: "de", source: "test/fixtures/export/Ignoring upper cases in German titles #456.json"}
  {html: "Schwindet die integrative Funktion des Sozialstaates?", language: "de", source: "test/fixtures/export/Ignoring upper cases in German titles #456.json"}
  {html: "A carbocyclic carbene as an efficient catalyst ligand for C–C coupling reactions", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Alkanethiolate gold cluster molecules with core diameters from 1.5 to 5.2 <span class=\"nocase\">nm</span>", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "A stochastic model of TCP Reno congestion avoidance and control", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Effect of immobilization on catalytic characteristics of saturated Pd-N-heterocyclic carbenes in Mizoroki-Heck reactions", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Estimateur d'un défaut de fonctionnement d'un modulateur en quadrature et étage de modulation l'utilisant", language: "fr-FR", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "High-speed Digital-to-RF converter", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Pleistocene <i><span class=\"nocase\">Homo sapiens</span></i> from Middle Awash, Ethiopia", language: "en", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Some remarks on <span class=\"nocase\">’t Hooft’s</span> S-matrix for black holes", source: "test/fixtures/export/Capitalize all title-fields for language en #383.json"}
  {html: "Catalogo dos livros, que se haõ de ler para a continuaçaõ do diccionario da lingua Portugueza: mandado publicar pela Academia Real das Sciencias de Lisboa", language: "pt", source: "test/fixtures/export/Sorting and optional particle handling #411.json"}
  {html: "In memoriam, na cidade", source: "test/fixtures/export/Sorting and optional particle handling #411.json"}
  {html: "<span class=\"nocase\">(abbé d' Aubignac) (François Hédelin)</span>", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "<span class=\"nocase\">(Aubignac) (François Hédelin, abbé d')</span>", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "Norm and Action. A Logical Enquiry", language: "en", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "Reading HLA Hart's: <i>The Concept of Law</i>", language: "en", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "Citations, Out of the Box", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "\"I have a dream\" : the quotations of Martin Luther King JR", source: "test/fixtures/export/(non-)dropping particle handling #313.json"}
  {html: "The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru", source: "test/fixtures/export/key migration.json"}
]

titles.push({html: "This is really, <i>really</i> good"})

titles = [
  {html: "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub> sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes.", language: 'fr'}
]

for title in titles
  display(title.html, title)
