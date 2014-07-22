@export
Feature: Export

@bbltx-e-1
Scenario: Better BibLaTeX Export 1
  When I import 'Better BibLaTeX.001.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.001.bib'

@btxck-e-1
Scenario: BibTeX Citation Keys Export 1
  When I import 'BibTeX Citation Keys.001.json'
   And I export the library using 'BibTeX Citation Keys'
  Then the output should match 'BibTeX Citation Keys.001.tex'

@pc-e-1
Scenario: Pandoc Citation Export 1
  When I import 'Pandoc Citation.001.json'
   And I export the library using 'Pandoc Citation'
  Then the output should match 'Pandoc Citation.001.txt'

@bbltx-e-2
Scenario: Better BibLaTeX Export 2
  When I import 'Better BibLaTeX.002.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.002.bib'

@bbltx-e-3
Scenario: Better BibLaTeX Export 3
  When I import 'Better BibLaTeX.003.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.003.bib'

@bbltx-e-4
Scenario: Better BibLaTeX Export 4
  When I import 'Better BibLaTeX.004.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.004.bib'

@bbltx-e-5
Scenario: Better BibLaTeX Export 5
  When I import 'Better BibLaTeX.005.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.005.bib'

@bbltx-e-6
Scenario: Better BibLaTeX Export 6
  When I import 'Better BibLaTeX.006.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.006.bib'

@bbltx-e-7
Scenario: Better BibLaTeX Export 7
  When I import 'Better BibLaTeX.007.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.007.bib'

@bbltx-e-8
Scenario: Better BibLaTeX Export 8
  When I import 'Better BibLaTeX.008.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.008.bib'

@bbltx-e-9
Scenario: Better BibLaTeX Export 9
  When I import 'Better BibLaTeX.009.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.009.bib'

@bbltx-e-10
Scenario: Better BibLaTeX Export 10
  When I import 'Better BibLaTeX.010.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.010.bib'

@bbltx-e-11
Scenario: Better BibLaTeX Export 11
  When I import 'Better BibLaTeX.011.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.011.bib'

@bbltx-e-12
Scenario: Better BibLaTeX Export 12
  When I import 'Better BibLaTeX.012.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[DOI]+[Title:fold:ascii:skipwords:select,1,4:condense,_]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.012.bib'

@bbltx-e-13
Scenario: Better BibLaTeX Export 13
  When I import 'Better BibLaTeX.013.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.013.bib'

@bbltx-e-14
Scenario: Better BibLaTeX Export 14
  When I import 'Better BibLaTeX.014.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.014.bib'

@bbltx-e-15
Scenario: Better BibLaTeX Export 15
  When I import 'Better BibLaTeX.015.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.015.bib'

@bbltx-e-16
Scenario: Better BibLaTeX Export 16
  When I import 'Better BibLaTeX.016.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.016.bib'

@bbltx-e-17
Scenario: Better BibLaTeX Export 17
  When I import 'Better BibLaTeX.017.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.017.bib'

@bbtx-e-18
Scenario: Better BibTeX Export 18
  When I import 'Better BibTeX.018.json'
   And I export the library using 'Better BibTeX'
  Then the output should match 'Better BibTeX.018.bib'

@bbltx-e-19
Scenario: Better BibLaTeX Export 19
  When I import 'Better BibLaTeX.019.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.019.bib'

@bbltx-e-20
Scenario: Better BibLaTeX Export 20
  When I import 'Better BibLaTeX.020.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.020.bib'

@bbltx-e-21
Scenario: Better BibLaTeX Export 21
  When I import 'Better BibLaTeX.021.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.021.bib'

@bbltx-e-22
Scenario: Better BibLaTeX Export 22
  When I import 'Better BibLaTeX.022.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[auth][year]-[shorttitle]'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.022.bib'

@bbltx-e-23
Scenario: Better BibLaTeX Export 23
  When I import 'Better BibLaTeX.023.json'
   And I export the library using 'Better BibLaTeX'
  Then the output should match 'Better BibLaTeX.023.bib'

@btxck-e-24
Scenario: BibTeX Citation Keys Export 24
  When I import 'BibTeX Citation Keys.024.json'
   And I export the library using 'BibTeX Citation Keys'
  Then the output should match 'BibTeX Citation Keys.024.tex'

@bbtx-e-26
Scenario: Better BibTeX Export 26
  When I import 'Better BibTeX.026.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[auth:lower][year:(ND)][shorttitle:lower]'
   And I export the library using 'Better BibTeX'
  Then the output should match 'Better BibTeX.026.bib'

@bbtx-e-27
Scenario: Better BibTeX Export 27
  When I import 'Better BibTeX.027.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[authors][year]'
   And I export the library using 'Better BibTeX'
  Then the output should match 'Better BibTeX.027.bib'

@ztc-e-28
Scenario: Zotero TestCase Export 28
  When I import 'Zotero TestCase.028.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[authors][year]'
   And I export the library using 'Zotero TestCase'
  Then the output should match 'Zotero TestCase.028.json'

@bbtx-e-29
Scenario: Better BibTeX Export 29
  When I import 'Better BibTeX.029.json'
   And I set preference extensions.zotero.translators.better-bibtex.citeKeyFormat to '[authors][year]'
   And I set preference extensions.zotero.cite.automaticJournalAbbreviations to true
   And I set export option useJournalAbbreviation to true
   And I export the library using 'Better BibTeX'
  Then the output should match 'Better BibTeX.029.bib'

