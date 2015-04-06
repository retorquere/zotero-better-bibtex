@export @export2
Feature: Export

Background:
  Given I set preference translators.better-bibtex.testMode.timestamp to '2015-02-24 12:14:36 +0100'

@stable-keys
Scenario: Stable citation keys
  When I import 6 references from 'export/Better BibLaTeX.stable-keys.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibLaTeX.stable-keys.bib'

@81
Scenario: Journal abbreviations exported in bibtex (81)
  When I set preference translators.better-bibtex.citekeyFormat to '[authors2][year][journal:nopunct]'
   And I set preference translators.better-bibtex.autoAbbrev to true
   And I set preference translators.better-bibtex.autoAbbrevStyle to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pinCitekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference from 'export/Journal abbreviations exported in bibtex (81).json'
  Then a library export using 'Better BibTeX' should match 'export/Journal abbreviations exported in bibtex (81).bib'

@85
Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
  When I import 1 reference with 1 attachment from 'export/Square brackets in Publication field (85).json'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85).bib'
  When I set preference translators.better-bibtex.citekeyFormat to '[year]-updated'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85) after pattern change.bib'

@86
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I import 1 reference with 1 attachment from 'export/Include first name initial(s) in cite key generation pattern (86).json'
   And I set preference translators.better-bibtex.citekeyFormat to '[auth+initials][year]'
  Then a library export using 'Better BibTeX' should match 'export/Include first name initial(s) in cite key generation pattern (86).bib'

@bulk
Scenario: Bulk export cache testing
  When I import 1241 references with 581 attachments from 'export/Big whopping library.json'
   And I set preference translators.better-bibtex.caching to true
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'

@98
Scenario: Export of item to Better Bibtex fails for auth3_1 #98
  When I import 1 reference from 'export/Export of item to Better Bibtex fails for auth3_1 #98.json'
  Then a library export using 'Better BibTeX' should match 'export/Export of item to Better Bibtex fails for auth3_1 #98.bib'

@99
Scenario: Empty 'bibtex:' clause in extra gobbles whatever follows #99
  When I import 1 reference from 'export/biber error on generated biblatex file #99.json'
  Then a library export using 'Better BibTeX' should match 'export/biber error on generated biblatex file #99.bib'

@102 @105
Scenario: Shortjournal does not get exported to biblatex format #102 / biblatexcitekey[my_key] does not seem to work -- bibtex: does #105
  When I import 1 reference from 'export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.bib'

@108
Scenario: DOI with underscores in extra field #108
  When I import 1 reference from 'export/DOI with underscores in extra field #108.json'
  Then a library export using 'Better BibLaTeX' should match 'export/DOI with underscores in extra field #108.bib'

@110 @111
Scenario: two ISSN number are freezing browser #110 / Generating keys and export broken #111
  When I import 1 reference from 'export/two ISSN number are freezing browser #110.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I generate a new citation key
  Then a library export using 'Better BibLaTeX' should match 'export/two ISSN number are freezing browser #110.bib'

@112 @114
Scenario: Hang on non-file attachment export #112/URL export broken for fancy URLs #114
  When I import 2 references with 2 attachments from 'export/Hang on non-file attachment export #112 - URL export broken #114.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Hang on non-file attachment export #112 - URL export broken #114.bib'

@113
Scenario: Math parts in title #113
  When I import 1 references from 'export/Math parts in title #113.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Math parts in title #113.bib'

@117
Scenario: Bibtex key regenerating issue when trashing items #117
  When I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I remove the selected item
  And I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json' as 'Second Import.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Bibtex key regenerating issue when trashing items #117.bib'

@malformed
Scenario: Malformed HTML
  When I import 1 reference from 'export/Malformed HTML.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Malformed HTML.bib'

@127
Scenario: Be robust against misconfigured journal abbreviator/html parser failure
  When I import 1 reference from 'export/Be robust against misconfigured journal abbreviator #127.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Be robust against misconfigured journal abbreviator #127.bib'

@130
Scenario: Exporting of single-field author lacks braces #130
  When I import 1 reference with 1 attachment from 'export/Exporting of single-field author lacks braces #130.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Exporting of single-field author lacks braces #130.bib'

@132
Scenario: Export Newspaper Article misses section field #132
  When I import 1 reference with 1 attachment from 'export/Export Newspaper Article misses section field #132.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Export Newspaper Article misses section field #132.bib'

@131
Scenario: Omit URL export when DOI present. #131
  When I import 3 references with 2 attachments from 'export/Omit URL export when DOI present. #131.json'
  And I set preference translators.better-bibtex.DOIandURL to 'both'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.default.bib'
  And I set preference translators.better-bibtex.DOIandURL to 'doi'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-DOI.bib'
  And I set preference translators.better-bibtex.DOIandURL to 'url'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-url.bib'

@133
Scenario: Extra ';' in biblatexadata causes export failure #133
  When I import 2 references from 'export/Extra semicolon in biblatexadata causes export failure #133.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Extra semicolon in biblatexadata causes export failure #133.bib'

@140 @147
Scenario: HTML Fragment separator escaped in url #140 / Specify custom reference type #147
  When I import 1 reference with 1 attachment from 'export/HTML Fragment separator escaped in url #140.json'
  Then a library export using 'Better BibLaTeX' should match 'export/HTML Fragment separator escaped in url #140.bib'

@141
Scenario: capital delta breaks .bib output #141
  When I import 1 reference from 'export/capital delta breaks .bib output #141.json'
  Then a library export using 'Better BibTeX' should match 'export/capital delta breaks .bib output #141.bib'

@146
Scenario: German Umlaut "separated" by brackets #146
  When I import 1 reference with 1 attachment from 'export/German Umlaut "separated" by brackets #146.json'
  Then a library export using 'Better BibLaTeX' should match 'export/German Umlaut "separated" by brackets #146.bib'

@forthcoming
Scenario: Export "Forthcoming" as "Forthcoming"
  When I import 1 reference with 1 attachment from 'export/Export "Forthcoming" as "Forthcoming".json'
  Then a library export using 'Better BibLaTeX' should match 'export/Export "Forthcoming" as "Forthcoming".bib'

@152
Scenario: Export Č as {\v C}, not \v{C} #152
  When I import 1 reference with 2 attachment from 'export/Export C as {v C}, not v{C} #152.json'
  Then a library export using 'Better BibTeX' should match 'export/Export C as {v C}, not v{C} #152.bib'

@160
Scenario: Capitalisation in techreport titles #160
  When I import 1 reference from 'export/Capitalisation in techreport titles #160.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Capitalisation in techreport titles #160.bib'

#@163
#Scenario: Preserve Bib variable names #163
#  When I import 1 reference from 'export/Preserve Bib variable names #163.json'
#  Then a library export using 'Better BibLaTeX' should match 'export/Preserve Bib variable names #163.bib'

@170
Scenario: Better BibTeX does not use biblatex fields eprint and eprinttype #170
  When I import 1 reference with 2 attachments from 'export/Better BibTeX does not use biblatex fields eprint and eprinttype #170.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Better BibTeX does not use biblatex fields eprint and eprinttype #170.bib'

@174
Scenario: References with multiple notes fail to export #174
  When I import 1 reference with 2 attachments from 'export/References with multiple notes fail to export #174.json'
  Then a library export using 'Better BibLaTeX' should match 'export/References with multiple notes fail to export #174.bib'
