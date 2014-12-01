@export
Feature: Export

@e1 @logcapture
Scenario: Better BibLaTeX Export 1
  When I import 1 reference from 'export/Better BibLaTeX.001.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.001.bib'

@pandoc
Scenario: Pandoc Citation Export
  When I import 1 reference with 1 attachment from 'export/Pandoc Citation.001.json'
  Then a library export using 'Pandoc Citation' should match 'export/Pandoc Citation.001.txt'

@e2 @logcapture
Scenario: Better BibLaTeX Export 2
  When I import 2 references from 'export/Better BibLaTeX.002.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.002.bib'

@bbltx-e-3
Scenario: Better BibLaTeX Export 3
  When I import 2 references from 'export/Better BibLaTeX.003.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.003.bib'

@bbltx-e-4
Scenario: Better BibLaTeX Export 4
  When I import 1 reference from 'export/Better BibLaTeX.004.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.004.bib'

@failing @failing-21 @bbltx-e-5
Scenario: Better BibLaTeX Export 5
  When I import 1 reference from 'export/Better BibLaTeX.005.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.005.bib'

@failing @failing-22 @bbltx-e-6
Scenario: Better BibLaTeX Export 6
  When I import 1 reference from 'export/Better BibLaTeX.006.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.006.bib'

@failing @failing-23 @bbltx-e-7
Scenario: Better BibLaTeX Export 7
  When I import 1 reference from 'export/Better BibLaTeX.007.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.007.bib'

@104
Scenario: underscores in URL fields should not be escaped #104
  When I import 1 reference from 'export/underscores in URL fields should not be escaped #104.json'
  Then a library export using 'Better BibLaTeX' should match 'export/underscores in URL fields should not be escaped #104.bib'

@bbltx-e-9
Scenario: Better BibLaTeX Export 9
  When I import 2 references with 2 attachments from 'export/Better BibLaTeX.009.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.009.bib'

@bbltx-e-10
Scenario: Better BibLaTeX Export 10
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.010.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.010.bib'

@bbltx-e-11
Scenario: Better BibLaTeX Export 11
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.011.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.011.bib'

@advanced-keygen
Scenario: Advanced key generator usage
  When I set preference translators.better-bibtex.citeKeyFormat to '[DOI]+[Title:fold:ascii:skipwords:select,1,4:condense,_]'
   And I import 1 reference with 1 attachment from 'export/Better BibLaTeX.012.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.012.bib'

@bbltx-e-13
Scenario: Better BibLaTeX Export 13
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.013.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.013.bib'

@failing @failing-24 @bbltx-e-14
Scenario: Better BibLaTeX Export 14
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.014.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.014.bib'

@bbltx-e-15
Scenario: Better BibLaTeX Export 15
  When I set preference translators.better-bibtex.citeKeyFormat to '[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.015.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.015.bib'

@bbltx-e-16
Scenario: Better BibLaTeX Export 16
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I import 1 reference from 'export/Better BibLaTeX.016.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.016.bib'

@failing @failing-25 @bbltx-e-17
Scenario: Better BibLaTeX Export 17
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year]'
   And I import 1 reference from 'export/Better BibLaTeX.017.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.017.bib'

@failing @failing-26 @bbtx-e-18
Scenario: Better BibTeX Export 18
  When I import 1 reference from 'export/Better BibTeX.018.json'
  Then a library export using 'Better BibTeX' should match 'export/Better BibTeX.018.bib'

@failing @failing-27 @bbltx-e-19
Scenario: Better BibLaTeX Export 19
  When I import 1 reference from 'export/Better BibLaTeX.019.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.019.bib'

@failing @failing-28 @bbltx-e-20
Scenario: Better BibLaTeX Export 20
  When I import 1 reference from 'export/Better BibLaTeX.020.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.020.bib'

@failing @failing-29 @e21
Scenario: Better BibLaTeX Export 21
  When I import 1 reference with 1 attachment from 'export/Better BibLaTeX.021.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.021.bib'

@failing @failing-30 @bbltx-e-22
Scenario: Better BibLaTeX Export 22
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth][year]-[shorttitle]'
   And I import 1 reference from 'export/Better BibLaTeX.022.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.022.bib'

@failing @failing-31 @bbltx-e-23
Scenario: Better BibLaTeX Export 23
  When I import 1 reference from 'export/Better BibLaTeX.023.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.023.bib'

@failing @failing-32 @bbtx-e-26
Scenario: Better BibTeX Export 26
  When I set preference translators.better-bibtex.citeKeyFormat to '[auth:lower][year:(ND)][shorttitle:lower]'
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.026.json'
  Then a library export using 'Better BibTeX' should match 'export/Better BibTeX.026.bib'

@failing @failing-33 @bbtx-e-27
Scenario: Better BibTeX Export 27
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors][year]'
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.027.json'
  Then a library export using 'Better BibTeX' should match 'export/Better BibTeX.027.bib'

@failing @failing-34 @journal-abbrev
Scenario: Journal abbreviations
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors][year][journal]'
   And I set preference translators.better-bibtex.auto-abbrev to true
   And I set preference translators.better-bibtex.auto-abbrev.style to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pin-citekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.029.json'
  Then a library export using 'Better BibTeX' should match 'export/Better BibTeX.029.bib'

@failing @failing-35 @stable-keys
Scenario: Stable citation keys
  When I import 6 references from 'export/Better BibLaTeX.stable-keys.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.stable-keys.bib'

@failing @failing-36 @81
Scenario: Journal abbreviations exported in bibtex (81)
  When I set preference translators.better-bibtex.citeKeyFormat to '[authors2][year][journal:nopunct]'
   And I set preference translators.better-bibtex.auto-abbrev to true
   And I set preference translators.better-bibtex.auto-abbrev.style to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pin-citekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference from 'export/Journal abbreviations exported in bibtex (81).json'
  Then a library export using 'Better BibTeX' should match 'export/Journal abbreviations exported in bibtex (81).bib'

@failing @failing-37 @85
Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
  When I import 1 reference with 1 attachment from 'export/Square brackets in Publication field (85).json'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85).bib'
  When I set preference translators.better-bibtex.citeKeyFormat to '[year]-updated'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85) after pattern change.bib'

@failing @failing-38 @86
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I import 1 reference with 1 attachment from 'export/Include first name initial(s) in cite key generation pattern (86).json'
  Then a library export using 'Better BibTeX' should match 'export/Include first name initial(s) in cite key generation pattern (86).bib'

#@bulk
#Scenario: Bulk import: performance work needed!
#  When I import 2417 references with 52 attachments from 'export/Big whopping library.json'
#  Then Export the library using 'Better BibLaTeX' to '/tmp/BWL.bib'
#  Then write the Zotero log to 'zotero.log'

@failing @failing-39 @98
Scenario: Export of item to Better Bibtex fails for auth3_1 #98
  When I import 1 reference from 'export/Export of item to Better Bibtex fails for auth3_1 #98.json'
  Then a library export using 'Better BibTeX' should match 'export/Export of item to Better Bibtex fails for auth3_1 #98.bib'

@failing @failing-40 @99
Scenario: Empty 'bibtex:' clause in extra gobbles whatever follows #99
  When I import 1 reference from 'export/biber error on generated biblatex file #99.json'
  Then a library export using 'Better BibTeX' should match 'export/biber error on generated biblatex file #99.bib'

@failing @failing-41 @102 @105
Scenario: Shortjournal does not get exported to biblatex format #102 / biblatexcitekey[my_key] does not seem to work -- bibtex: does #105
  When I import 1 reference from 'export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.bib'

@failing @failing-42 @108
Scenario: DOI with underscores in extra field #108
  When I import 1 reference from 'export/DOI with underscores in extra field #108.json'
  Then a library export using 'Better BibLaTeX' should match 'export/DOI with underscores in extra field #108.bib'

@failing @failing-43 @110 @111
Scenario: two ISSN number are freezing browser #110 / Generating keys and export broken #111
  When I import 1 reference from 'export/two ISSN number are freezing browser #110.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I generate a new citation key
  Then a library export using 'Better BibLaTeX' should match 'export/two ISSN number are freezing browser #110.bib'

@failing @failing-44 @112 @114
Scenario: Hang on non-file attachment export #112/URL export broken for fancy URLs #114
  When I import 2 references with 2 attachments from 'export/Hang on non-file attachment export #112 - URL export broken #114.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Hang on non-file attachment export #112 - URL export broken #114.bib'

@failing @failing-45 @113
Scenario: Math parts in title #113
  When I import 1 references from 'export/Math parts in title #113.json'
  #Then export the library using 'Better BibLaTeX' to '/tmp/bib.bib'
  Then a library export using 'Better BibLaTeX' should match 'export/Math parts in title #113.bib'

@failing @failing-46 @117
Scenario: Bibtex key regenerating issue when trashing items #117
  When I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I remove the selected item
  And I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json' as 'Second Import.json'
  Then export the library using 'Better BibLaTeX' to '/tmp/BWL.bib'
  Then a library export using 'Better BibLaTeX' should match 'export/Bibtex key regenerating issue when trashing items #117.bib'

