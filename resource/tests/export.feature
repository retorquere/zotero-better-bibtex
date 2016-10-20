@export
Feature: Export

Background:
  When I set preference .citekeyFormat to [auth][year]
  And I set preference .jabrefGroups to false
  And I set preference .titleCase to true
  And I set preference .defaultDateParserLocale to en-GB
  And I set preference .bibtexURL to 'note'

### BibLaTeX cookie-cutter ###

@test-cluster-1 @127 @201 @219 @253 @268 @288 @294 @302 @308 @309 @310 @326 @327 @351 @376 @389 @bblt-0 @bblt @485 @515 @573
Scenario Outline: BibLaTeX Export
  And I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibLaTeX' should match 'export/<file>.biblatex'

  Examples:
     | file                                                                                           | references  |
     | transliteration for citekey #580                                                               | 1           |
     | CSL status = biblatex pubstate #573                                                            | 1           |
     | Title case of latex greek text on biblatex export #564                                         | 2           |
     | pre not working in Extra field #559                                                            | 1           |
     | @jurisdiction; map court,authority to institution #326                                         | 1           |
     | @legislation; map code,container-title to journaltitle #327                                    | 1           |
     | Abbreviations in key generated for Conference Proceedings #548                                 | 1           |
     | Be robust against misconfigured journal abbreviator #127                                       | 1           |
     | Better BibLaTeX.001                                                                            | 1           |
     | Better BibLaTeX.002                                                                            | 2           |
     | Better BibLaTeX.003                                                                            | 2           |
     | Better BibLaTeX.004                                                                            | 1           |
     | Better BibLaTeX.005                                                                            | 1           |
     | Better BibLaTeX.006                                                                            | 1           |
     | Better BibLaTeX.007                                                                            | 1           |
     | Better BibLaTeX.009                                                                            | 2           |
     | BibLaTeX; export CSL override 'issued' to date or year #351                                    | 1           |
     | BibTeX variable support for journal titles. #309                                               | 1           |
     | Book converted to mvbook #288                                                                  | 1           |
     | Book sections have book title for journal in citekey #409                                      | 1           |
     | BraceBalancer                                                                                  | 1           |
     | Colon in bibtex key #405                                                                       | 1           |
     | Colon not allowed in citation key format #268                                                  | 1           |
     | Date parses incorrectly with year 1000 when source Zotero field is in datetime format. #515    | 1           |
     | Dollar sign in title not properly escaped #485                                                 | 1           |
     | Export error for items without publicationTitle and Preserve BibTeX variables enabled #201     | 1           |
     | Export mapping for reporter field #219                                                         | 1           |
     | Fields in Extra should override defaults                                                       | 1           |
     | Non-ascii in dates is not matched by date parser #376                                          | 1           |
     | Oriental dates trip up date parser #389                                                        | 1           |
     | Spaces not stripped from citation keys #294                                                    | 1           |
     | Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253 | 1 |
     | auth leaves punctuation in citation key #310                                                   | 1           |
     | condense in cite key format not working #308                                                   | 1           |
     | csquotes #302                                                                                  | 2           |
     | italics in title - capitalization #541                                                         | 1           |

@test-cluster-1 @bblt-1 @bblt @435 @293 @381
Scenario Outline: BibLaTeX Export
  And I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibLaTeX' should match 'export/<file>.biblatex'

  Examples:
     | file                                                                               | references  |
     | CSL title, volume-title, container-title=BL title, booktitle, maintitle #381       | 2           |
     | Better BibLaTeX.019                                                                | 1           |
     | Extra semicolon in biblatexadata causes export failure #133                        | 2           |
     | Ignore HTML tags when generating citation key #264                                 | 1           |
     | map csl-json variables #293                                                        | 2           |
     | Export Forthcoming as Forthcoming                                                  | 1           |
     | biblatex export of phdthesis does not case-protect -type- #435                     | 1           |
     | CSL variables only recognized when in lowercase #408                               | 1           |
     | date and year are switched #406                                                    | 4           |
     | Do not caps-protect literal lists #391                                             | 3           |
     | biblatex; Language tag xx is exported, xx-XX is not #380                           | 1           |
     | Normalize date ranges in citekeys #356                                             | 3           |
     | remove the field if the override is empty #303                                     | 1           |
     | markup small-caps, superscript, italics #301                                       | 2           |
     | don't escape entry key fields for #296                                             | 1           |
     | typo stature-statute (zotero item type) #284                                       | 1           |
     | bookSection is always converted to @inbook, never @incollection #282               | 1           |
     | referencetype= does not work #278                                                  | 1           |
     | BBT export of square brackets in date #245 -- xref should not be escaped #246      | 3           |
     | References with multiple notes fail to export #174                                 | 1           |
     | Better BibTeX does not use biblatex fields eprint and eprinttype #170              | 1           |
     | Capitalisation in techreport titles #160                                           | 1           |
     | German Umlaut separated by brackets #146                                           | 1           |
     | HTML Fragment separator escaped in url #140 #147                                   | 1           |
     | Export Newspaper Article misses section field #132                                 | 1           |
     | Exporting of single-field author lacks braces #130                                 | 1           |
     | Math parts in title #113                                                           | 1           |
     | Hang on non-file attachment export #112 - URL export broken #114                   | 2           |
     | DOI with underscores in extra field #108                                           | 1           |
     | underscores in URL fields should not be escaped #104                               | 1           |
     | Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105  | 1           |
     | Better BibLaTeX.023                                                                | 1           |
     | Better BibLaTeX.022                                                                | 1           |
     | Better BibLaTeX.021                                                                | 1           |
     | Better BibLaTeX.020                                                                | 1           |
     | Better BibLaTeX.017                                                                | 1           |
     | Better BibLaTeX.016                                                                | 1           |
     | Better BibLaTeX.015                                                                | 1           |
     | Better BibLaTeX.014                                                                | 1           |
     | Better BibLaTeX.013                                                                | 1           |
     | Better BibLaTeX.012                                                                | 1           |
     | Better BibLaTeX.011                                                                | 1           |
     | Better BibLaTeX.010                                                                | 1           |
     | Malformed HTML                                                                     | 1           |
     | Better BibLaTeX.stable-keys                                                        | 6           |
     | Allow explicit field override                                                      | 1           |

@test-cluster-1 @482
Scenario Outline: BibLaTeX Export
  And I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibLaTeX' should match 'export/<file>.biblatex'

  Examples:
     | file                                                                               | references  |
     | Juris-M missing multi-lingual fields #482                                          | 2           |

### BibTeX cookie-cutter ###

@441 @439 @bbt @300 @565 @551 @558
Scenario Outline: BibTeX Export
  Given I import <references> references from 'export/<file>.json'
  Then a library export using 'Better BibTeX' should match 'export/<file>.bibtex'

  Examples:
     | file                                                                               | references |
     | veryshorttitle and compound words #551                                             | 4          |
     | titles are title-cased in .bib file #558                                           | 2          |
     | Braces around author last name when exporting BibTeX #565                          | 5          |
     | Missing JabRef pattern; authEtAl #554                                              | 1          |
     | Missing JabRef pattern; authorsN+initials #553                                     | 1          |
     | custom fields should be exported as-is #441                                        | 1          |
     | Replicate Zotero key algorithm #439                                                | 3          |
     | preserve BibTeX Variables does not check for null values while escaping #337       | 1          |
     | Underscores break capital-preservation #300                                        | 1          |
     | Numbers confuse capital-preservation #295                                          | 1          |
     | Export C as {v C}, not v{C} #152                                                   | 1          |
     | capital delta breaks .bib output #141                                              | 1          |
     | Empty bibtex clause in extra gobbles whatever follows #99                          | 1          |
     | Export of item to Better Bibtex fails for auth3_1 #98                              | 1          |
     | Better BibTeX.027                                                                  | 1          |
     | Better BibTeX.026                                                                  | 1          |
     | Better BibTeX.018                                                                  | 1          |

### Other ###
@test-cluster-1 @131
Scenario: Omit URL export when DOI present. #131
  When I import 3 references with 2 attachments from 'export/Omit URL export when DOI present. #131.json'
  And I set preference .DOIandURL to both
  And I set preference .jabrefGroups to true
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.default.biblatex'
  And I set preference .DOIandURL to doi
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-DOI.biblatex'
  And I set preference .DOIandURL to url
  Then a library export using 'Better BibLaTeX' should match 'export/Omit URL export when DOI present. #131.prefer-url.biblatex'

@test-cluster-1 @438 @bbt
Scenario: BibTeX name escaping has a million inconsistencies #438
  When I import 2 references from 'export/BibTeX name escaping has a million inconsistencies #438.json'
  And I set preference .relaxAuthors to true
  Then a library export using 'Better BibTeX' should match 'export/BibTeX name escaping has a million inconsistencies #438.bibtex'

@117
Scenario: Bibtex key regenerating issue when trashing items #117
  When I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I remove the selected item
  And I import 1 reference from 'export/Bibtex key regenerating issue when trashing items #117.json' as 'Second Import.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Bibtex key regenerating issue when trashing items #117.biblatex'

@412 @bbt
Scenario: BibTeX URLs
  Given I import 1 reference from 'export/BibTeX; URL missing in bibtex for Book Section #412.json'
  And I set preference .bibtexURL to 'off'
  Then a library export using 'Better BibTeX' should match 'export/BibTeX; URL missing in bibtex for Book Section #412.off.bibtex'
  When I set preference .bibtexURL to 'note'
  Then a library export using 'Better BibTeX' should match 'export/BibTeX; URL missing in bibtex for Book Section #412.note.bibtex'
  When I set preference .bibtexURL to 'url'
  Then a library export using 'Better BibTeX' should match 'export/BibTeX; URL missing in bibtex for Book Section #412.url.bibtex'

@cayw
Scenario: CAYW picker
  When I import 3 references from 'export/cayw.json'
  And I pick '6 The time it takes: temporalities of planning' for CAYW:
    | label | page |
    | locator | 1 |
  And I pick 'A bicycle made for two? The integration of scientific techniques into archaeological interpretation' for CAYW:
    | label | chapter |
    | locator | 1 |
  Then the picks for pandoc should be '@bentley_academic_2011, p. 1; @pollard_bicycle_2007, ch. 1'
  And the picks for mmd should be '[#bentley_academic_2011][][#pollard_bicycle_2007][]'
  And the picks for latex should be '\cite[1]{bentley_academic_2011}\cite[ch. 1]{pollard_bicycle_2007}'
  And the picks for scannable-cite should be '{|Abram, 2014|p. 1||zu:0:ITEMKEY}{|Pollard and Bray, 2007|ch. 1||zu:0:ITEMKEY}'
  And the picks for asciidoctor-bibtex should be 'cite:[bentley_academic_2011(1), pollard_bicycle_2007(ch. 1)]'

@307 @bbt
Scenario: thesis zotero entries always create @phpthesis bibtex entries #307
  When I import 2 references from 'export/thesis zotero entries always create @phdthesis bibtex entries #307.json'
  Then a library export using 'Better BibTeX' should match 'export/thesis zotero entries always create @phdthesis bibtex entries #307.bibtex'
  And a library export using 'Better BibLaTeX' should match 'export/thesis zotero entries always create @phdthesis bibtex entries #307.biblatex'

@402 @bbt
Scenario: bibtex; url export does not survive underscores #402
  When I import 1 reference from 'export/bibtex; url export does not survive underscores #402.json'
  Then a library export using 'Better BibLaTeX' should match 'export/bibtex; url export does not survive underscores #402.biblatex'
  And a library export using 'Better BibTeX' should match 'export/bibtex; url export does not survive underscores #402.bibtex'

@110 @111
Scenario: two ISSN number are freezing browser #110 / Generating keys and export broken #111
  When I import 1 reference from 'export/two ISSN number are freezing browser #110.json'
  And I select the first item where publicationTitle = 'Genetics'
  And I set the citation key
  Then a library export using 'Better BibLaTeX' should match 'export/two ISSN number are freezing browser #110.biblatex'

@arXiv @85 @bbt
Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
  When I import 1 references from 'export/Square brackets in Publication field (85).json'
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85).bibtex'
  And I set preference .citekeyFormat to [year]-updated
  Then a library export using 'Better BibTeX' should match 'export/Square brackets in Publication field (85) after pattern change.bibtex'

@86 @bbt @arXiv
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I import 1 reference from 'export/Include first name initial(s) in cite key generation pattern (86).json'
   And I set preference .citekeyFormat to [auth+initials][year]
  Then a library export using 'Better BibTeX' should match 'export/Include first name initial(s) in cite key generation pattern (86).bibtex'

@372 @pandoc
Scenario: BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372
  When I import 1 reference from 'export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.json'
  Then a library export using 'Better CSL JSON' should match 'export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.csl.json'

@365 @pandoc
Scenario: Export of creator-type fields from embedded CSL variables #365
  When I import 6 references from 'export/Export of creator-type fields from embedded CSL variables #365.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Export of creator-type fields from embedded CSL variables #365.biblatex'
  And a library export using 'Better CSL JSON' should match 'export/Export of creator-type fields from embedded CSL variables #365.csl.json'

@360 @pandoc
Scenario: Date export to Better CSL-JSON #360
  When I import 6 references from 'export/Date export to Better CSL-JSON #360.json'
  And a library export using 'Better CSL JSON' should match 'export/Date export to Better CSL-JSON #360.csl.json'

@432 @447 @pandoc
Scenario: Pandoc/LaTeX Citation Export
  When I import 4 references with 3 attachments from 'export/Pandoc Citation.json'
  And I set preference .quickCopyMode to 'pandoc'
  Then a library export using 'Better BibTeX Quick Copy' should match 'export/Pandoc Citation.pandoc'
  When I set preference .quickCopyMode to 'latex'
  Then a library export using 'Better BibTeX Quick Copy' should match 'export/Pandoc Citation.latex'
  And a library export using 'Better CSL JSON' should match 'export/Pandoc Citation.csl.json'
  And a library export using 'Better CSL YAML' should match 'export/Pandoc Citation.csl.yml'

@journal-abbrev @bbt
Scenario: Journal abbreviations
  Given I import 1 reference with 1 attachment from 'export/Better BibTeX.029.json'
  And I set preferences:
    | .citekeyFormat    | [authors][year][journal]          |
    | .autoAbbrev       | true                              |
    | .autoAbbrevStyle  | http://www.zotero.org/styles/cell |
    | .pinCitekeys      | on-export                         |
  Then the following library export should match 'export/Better BibTeX.029.bibtex':
    | translator             | Better BibTeX  |
    | useJournalAbbreviation | true           |

@81 @bbt
Scenario: Journal abbreviations exported in bibtex (81)
  Given I import 1 reference from 'export/Journal abbreviations exported in bibtex (81).json'
  And I set preferences:
    | .citekeyFormat          | [authors2][year][journal:nopunct] |
    | .autoAbbrev             | true                              |
    | .autoAbbrevStyle        | http://www.zotero.org/styles/cell |
    | .pinCitekeys            | on-export                         |
  Then the following library export should match 'export/Journal abbreviations exported in bibtex (81).bibtex':
    | translator              | Better BibTeX  |
    | useJournalAbbreviation  | true           |

@postscript @bbt
Scenario: Post script
  Given I import 3 references from 'export/Export web page to misc type with notes and howpublished custom fields #329.json'
  And I set preference .postscript to 'export/Export web page to misc type with notes and howpublished custom fields #329.js'
  Then a library export using 'Better BibTeX' should match 'export/Export web page to misc type with notes and howpublished custom fields #329.bibtex'

@460
Scenario: arXiv identifiers in BibLaTeX export #460
  Given I import 3 references from 'export/arXiv identifiers in BibLaTeX export #460.json'
  Then a library export using 'Better BibTeX' should match 'export/arXiv identifiers in BibLaTeX export #460.bibtex'
  And a library export using 'Better BibLaTeX' should match 'export/arXiv identifiers in BibLaTeX export #460.biblatex'

@456
Scenario: Ignoring upper cases in German titles #456
  Given I import 2 references from 'export/Ignoring upper cases in German titles #456.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Ignoring upper cases in German titles #456.biblatex'
  And a library export using 'Better BibTeX' should match 'export/Ignoring upper cases in German titles #456.bibtex'

@266 @286 @bblt
Scenario: Diacritics stripped from keys regardless of ascii or fold filters #266
  Given I import 1 reference from 'export/Diacritics stripped from keys regardless of ascii or fold filters #266.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Diacritics stripped from keys regardless of ascii or fold filters #266-fold.biblatex'
  When I set preference .citekeyFold to false
  Then a library export using 'Better BibLaTeX' should match 'export/Diacritics stripped from keys regardless of ascii or fold filters #266-nofold.biblatex'

@384 @bbt @565 @566
Scenario: Do not caps-protect name fields #384 #565 #566
  Given I import 40 references from 'export/Do not caps-protect name fields #384 #565 #566.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Do not caps-protect name fields #384 #565 #566.biblatex'
  And a library export using 'Better BibTeX' should match 'export/Do not caps-protect name fields #384 #565 #566.bibtex'
  When I set preference .bibtexParticleNoOp to true
  Then a library export using 'Better BibTeX' should match 'export/Do not caps-protect name fields #384 #565 #566.noopsort.bibtex'
  When I set preference .biblatexExtendedNameFormat to true
  Then a library export using 'Better BibLaTeX' should match 'export/Do not caps-protect name fields #384 #565 #566.biber26.biblatex'

@383 @bblt
Scenario: Capitalize all title-fields for language en #383
  Given I import 8 references from 'export/Capitalize all title-fields for language en #383.json'
  Then a library export using 'Better BibLaTeX' should match 'export/Capitalize all title-fields for language en #383.biblatex'

#@411 @bblt
#Scenario: Sorting and optional particle handling #411
#  Given I import 2 references from 'export/Sorting and optional particle handling #411.json'
#  And I set preference .parseParticles to true
#  Then a library export using 'Better BibLaTeX' should match 'export/Sorting and optional particle handling #411.on.biblatex'
#  When I set preference .parseParticles to false
#  Then a library export using 'Better BibLaTeX' should match 'export/Sorting and optional particle handling #411.off.biblatex'

@test-cluster-1 @ae
Scenario: auto-export
  Given I import 3 references with 2 attachments from 'export/autoexport.json'
  Then a library export using 'Better BibLaTeX' should match 'export/autoexport.before.biblatex'
  And I export the library to 'tmp/autoexport.bib':
    | translator    | Better BibLaTeX |
    | Keep updated  | true            |
  When I select the first item where publisher = 'IEEE'
  And I remove the selected item
  And I wait 5 seconds
  Then 'tmp/autoexport.bib' should match 'export/autoexport.after.biblatex'

#@163
#Scenario: Preserve Bib variable names #163
#  When I import 1 reference from 'export/Preserve Bib variable names #163.json'
#  Then a library export using 'Better BibLaTeX' should match 'export/Preserve Bib variable names #163.biblatex'

@313 @bblt
Scenario: (non-)dropping particle handling #313
  When I import 53 references from 'export/(non-)dropping particle handling #313.json'
  Then a library export using 'Better BibLaTeX' should match 'export/(non-)dropping particle handling #313.biblatex'
