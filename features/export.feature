@export
Feature: Export

@bbltx-e-1 @e-1
Scenario: Better BibLaTeX Export 1
  When I import 1 reference from 'export/Better BibLaTeX.001.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.001.bib'

@pandoc
Scenario: Pandoc Citation Export
  When I import 1 reference with 1 attachment from 'export/Pandoc Citation.001.json'
  Then A library export using 'Pandoc Citation' should match 'export/Pandoc Citation.001.txt'

@e2
Scenario: Better BibLaTeX Export 2
  When I import 2 references from 'export/Better BibLaTeX.002.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.002.bib'

@bbltx-e-3
Scenario: Better BibLaTeX Export 3
  When I import 2 references from 'export/Better BibLaTeX.003.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.003.bib'

@bbltx-e-4
Scenario: Better BibLaTeX Export 4
  When I import 1 reference from 'export/Better BibLaTeX.004.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.004.bib'

@bbltx-e-5
Scenario: Better BibLaTeX Export 5
  When I import 1 reference from 'export/Better BibLaTeX.005.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.005.bib'

@bbltx-e-6
Scenario: Better BibLaTeX Export 6
  When I import 1 reference from 'export/Better BibLaTeX.006.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.006.bib'

@bbltx-e-7
Scenario: Better BibLaTeX Export 7
  When I import 1 reference from 'export/Better BibLaTeX.007.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.007.bib'

@bbltx-e-8
Scenario: Better BibLaTeX Export 8
  When I import 1 reference from 'export/Better BibLaTeX.008.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.008.bib'

@bbltx-e-9
Scenario: Better BibLaTeX Export 9
  When I import 2 references with 2 attachments from 'export/Better BibLaTeX.009.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.009.bib'

@bbltx-e-10
Scenario: Better BibLaTeX Export 10
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.010.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.010.bib'

@bbltx-e-11
Scenario: Better BibLaTeX Export 11
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.011.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.011.bib'

@advanced-keygen
Scenario: Advanced key generator usage
  When I set preference translators.better-bibtex.citeKeyFormat to '[DOI]+[Title:fold:ascii:skipwords:select,1,4:condense,_]'
   And I import 1 reference with 1 attachment from 'export/Better BibLaTeX.012.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.012.bib'

@bbltx-e-13
Scenario: Better BibLaTeX Export 13
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.013.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.013.bib'

@bbltx-e-14
Scenario: Better BibLaTeX Export 14
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.014.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.014.bib'

@bbltx-e-15
Scenario: Better BibLaTeX Export 15
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.015.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.015.bib'

@bbltx-e-16
Scenario: Better BibLaTeX Export 16
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I import 1 reference from 'export/Better BibLaTeX.016.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.016.bib'

@bbltx-e-17
Scenario: Better BibLaTeX Export 17
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I import 1 reference from 'export/Better BibLaTeX.017.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.017.bib'

@bbtx-e-18
Scenario: Better BibTeX Export 18
  When I import 1 reference from 'export/Better BibTeX.018.json'
  Then A library export using 'Better BibTeX' should match 'export/Better BibTeX.018.bib'

@bbltx-e-19
Scenario: Better BibLaTeX Export 19
  When I import 1 reference from 'export/Better BibLaTeX.019.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.019.bib'

@bbltx-e-20
Scenario: Better BibLaTeX Export 20
  When I import 1 reference from 'export/Better BibLaTeX.020.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.020.bib'

@e21
Scenario: Better BibLaTeX Export 21
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.021.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.021.bib'

@bbltx-e-22
Scenario: Better BibLaTeX Export 22
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth][year]-[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.022.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.022.bib'

@bbltx-e-23
Scenario: Better BibLaTeX Export 23
  When I import 1 reference from 'export/Better BibLaTeX.023.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.023.bib'

@bbtx-e-26
Scenario: Better BibTeX Export 26
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year:(ND)][shorttitle:lower]'
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.026.json'
  Then A library export using 'Better BibTeX' should match 'export/Better BibTeX.026.bib'

@bbtx-e-27
Scenario: Better BibTeX Export 27
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors][year]'
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.027.json'
  Then A library export using 'Better BibTeX' should match 'export/Better BibTeX.027.bib'

@journal-abbrev
Scenario: Journal abbreviations
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors][year][journal]'
   And I set preference translators.better-bibtex.auto-abbrev to true
   And I set preference translators.better-bibtex.auto-abbrev.style to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pin-citekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.029.json'
  Then A library export using 'Better BibTeX' should match 'export/Better BibTeX.029.bib'

@stable-keys
Scenario: Stable citation keys
  When I import 6 references from 'export/Better BibLaTeX.stable-keys.json'
  Then A library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.stable-keys.bib'

@81
Scenario: Journal abbreviations exported in bibtex (81)
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors2][year][journal:nopunct]'
   And I set preference translators.better-bibtex.auto-abbrev to true
   And I set preference translators.better-bibtex.auto-abbrev.style to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pin-citekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference from 'export/Journal abbreviations exported in bibtex (81).json'
  Then A library export using 'Better BibTeX' should match 'export/Journal abbreviations exported in bibtex (81).bib'

@85
Scenario: Square brackets in Publication field (85)
  When I import 1 reference with 1 attachment from 'export/Square brackets in Publication field (85).json'
  Then A library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85).bib'

@86
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth+initials][year]'
   And I import 1 reference with 1 attachment from 'export/Include first name initial(s) in cite key generation pattern (86).json'
  Then A library export using 'Better BibTeX' should match 'export/Include first name initial(s) in cite key generation pattern (86).bib'

#@bulk
#Scenario: Bulk import: performance work needed!
#  When I import 2417 references with 52 attachments from 'export/Big whopping library.json'
#  Then Export the library using 'Better BibLaTeX' to '/tmp/BWL.bib'
#  Then write the Zotero log to 'zotero.log'
