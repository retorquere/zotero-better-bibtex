@export
Feature: Export

#@163
#Scenario: Preserve Bib variable names #163
#  When I import 1 reference from 'export/Preserve Bib variable names #163.json'
#  Then a library export using 'Better BibLaTeX' should match 'export/Preserve Bib variable names #163.bib'

@test-cluster-0 @131
Scenario: Omit URL export when DOI present. #131
  When I import 3 references with 2 attachments from 'export/Omit URL export when DOI present. #131.json'
  And I set preference translators.better-bibtex.DOIandURL to 'both'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.default.bib'
  And I set preference translators.better-bibtex.DOIandURL to 'doi'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-DOI.bib'
  And I set preference translators.better-bibtex.DOIandURL to 'url'
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-url.bib'

@test-cluster-0 @117
Scenario: Bibtex key regenerating issue when trashing items #117
  When I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I remove the selected item
  And I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json' as 'Second Import.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Bibtex key regenerating issue when trashing items #117.bib'

@test-cluster-0 @110 @111
Scenario: two ISSN number are freezing browser #110 / Generating keys and export broken #111
  When I import 1 reference from 'export/two ISSN number are freezing browser #110.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I generate a new citation key
  Then a library export using 'Better BibLaTeX' should match 'export/two ISSN number are freezing browser #110.bib'

@test-cluster-0 @85
Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
  When I import 1 reference with 1 attachment from 'export/Square brackets in Publication field (85).json'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85).bib'
  When I set preference translators.better-bibtex.citekeyFormat to '[year]-updated'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85) after pattern change.bib'

@test-cluster-0 @86
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I import 1 reference with 1 attachment from 'export/Include first name initial(s) in cite key generation pattern (86).json'
   And I set preference translators.better-bibtex.citekeyFormat to '[auth+initials][year]'
  Then a library export using 'Better BibTeX' should match 'export/Include first name initial(s) in cite key generation pattern (86).bib'

@test-cluster-0 @pandoc
Scenario: Pandoc Citation Export
  When I import 1 reference with 1 attachment from 'export/Pandoc Citation.001.json'
  Then a library export using 'Pandoc Citation' should match 'export/Pandoc Citation.001.txt'

@test-cluster-0 @journal-abbrev
Scenario: Journal abbreviations
  When I set preference translators.better-bibtex.citekeyFormat to '[authors][year][journal]'
   And I set preference translators.better-bibtex.autoAbbrev to true
   And I set preference translators.better-bibtex.autoAbbrevStyle to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pinCitekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference with 1 attachment from 'export/Better BibTeX.029.json'
  Then a library export using 'Better BibTeX' should match 'export/Better BibTeX.029.bib'

@test-cluster-0 @81
Scenario: Journal abbreviations exported in bibtex (81)
  When I set preference translators.better-bibtex.citekeyFormat to '[authors2][year][journal:nopunct]'
   And I set preference translators.better-bibtex.autoAbbrev to true
   And I set preference translators.better-bibtex.autoAbbrevStyle to 'http://www.zotero.org/styles/cell'
   And I set preference translators.better-bibtex.pinCitekeys to 'on-export'
   And I set export option useJournalAbbreviation to true
   And I import 1 reference from 'export/Journal abbreviations exported in bibtex (81).json'
  Then a library export using 'Better BibTeX' should match 'export/Journal abbreviations exported in bibtex (81).bib'

@test-cluster-0 @bbt
Scenario Outline: BibLaTeX Export
  Given I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibTeX' should match 'export/<file>.bib'

  Examples:
     | file                                                                              | references |
     | Better BibTeX.018                                                                 | 1          |
     | Better BibTeX.026                                                                 | 2          |
     | Better BibTeX.027                                                                 | 2          |
     | Empty bibtex: clause in extra gobbles whatever follows #99                        | 1          |
     | capital delta breaks .bib output #141                                             | 1          |
     | Export C as {v C}, not v{C} #152                                                  | 3          |
     | Export of item to Better Bibtex fails for auth3_1 #98                             | 1          |

@test-cluster-0 @bblt
Scenario Outline: BibLaTeX Export
  Given I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibLaTeX' should match 'export/<file>.bib'

  Examples:
     | file                                                                              | references |
     | Be robust against misconfigured journal abbreviator #127                          | 1          |
     | Better BibLaTeX.001                                                               | 1          |
     | Better BibLaTeX.002                                                               | 2          |
     | Better BibLaTeX.003                                                               | 2          |
     | Better BibLaTeX.004                                                               | 1          |
     | Better BibLaTeX.005                                                               | 1          |
     | Better BibLaTeX.006                                                               | 1          |
     | Better BibLaTeX.007                                                               | 1          |
     | Better BibLaTeX.009                                                               | 4          |

@test-cluster-1 @bblt
Scenario Outline: BibLaTeX Export
  Given I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibLaTeX' should match 'export/<file>.bib'

  Examples:
     | file                                                                              | references |
     | Better BibLaTeX.010                                                               | 2          |
     | Better BibLaTeX.011                                                               | 2          |
     | Better BibLaTeX.012                                                               | 2          |
     | Better BibLaTeX.013                                                               | 1          |
     | Better BibLaTeX.014                                                               | 1          |
     | Better BibLaTeX.015                                                               | 1          |
     | Better BibLaTeX.016                                                               | 1          |
     | Better BibLaTeX.017                                                               | 1          |
     | Better BibLaTeX.019                                                               | 1          |
     | Better BibLaTeX.020                                                               | 1          |
     | Better BibLaTeX.021                                                               | 2          |
     | Better BibLaTeX.022                                                               | 1          |
     | Better BibLaTeX.023                                                               | 1          |
     | Better BibLaTeX.stable-keys                                                       | 6          |
     | Better BibTeX does not use biblatex fields eprint and eprinttype #170             | 3          |
     | Capitalisation in techreport titles #160                                          | 1          |
     | DOI with underscores in extra field #108                                          | 1          |
     | Export "Forthcoming" as "Forthcoming"                                             | 2          |
     | Exporting of single-field author lacks braces #130                                | 2          |
     | Export Newspaper Article misses section field #132                                | 2          |
     | Extra semicolon in biblatexadata causes export failure #133                       | 2          |
     | German Umlaut "separated" by brackets #146                                        | 2          |
     | Hang on non-file attachment export #112 - URL export broken #114                  | 4          |
     | HTML Fragment separator escaped in url #140 #147                                  | 2          |
     | Malformed HTML                                                                    | 1          |
     | Math parts in title #113                                                          | 1          |
     | References with multiple notes fail to export #174                                | 3          |
     | Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105 | 1          |
     | underscores in URL fields should not be escaped #104                              | 1          |
     | Allow explicit field override                                                     | 1          |

@test-cluster-0 @ae
Scenario: auto-export
  Given I import 3 references with 2 attachments from 'export/autoexport.json'
  Then a library export using 'Better BibLaTeX' should match 'export/autoexport.before.bib'
  When I set export option Keep updated to true
  And I export the library using 'Better BibLaTeX' to 'tmp/autoexport.bib'
  When I select the first item where publisher = 'IEEE'
  And I remove the selected item
  And I wait 5 seconds, if I'm in CI
  Then 'tmp/autoexport.bib' should match 'export/autoexport.after.bib'
