@export
Feature: Export

Background:
  Given I set preference .primeExportCache to 10

@test-cluster-1
@127 @201 @219 @253 @268 @288 @294 @302 @308 @309 @310 @326 @327 @351 @376 @389 @bblt-0 @bblt @485 @515 @573 @590 @747 @edtf @689 @biblatex @644 @889 @482 @979 @746
Scenario Outline: BibLaTeX Export
  And I import <references> references from "export/<file>.json"
  Then an export using "Better BibLaTeX" should match "export/<file>.biblatex"

  Examples:
     | file                                                                                           | references  |
     | Do not use more than three initials in case of authshort key #1079                             | 1           |
     | ADS exports dates like 1993-00-00 #1066                                                        | 1           |
     | BBT export of square brackets in date #245 -- xref should not be escaped #246                  | 3           |
     | date ranges #747+#746                                                                          | 5           |
     | BibLaTeX Patent author handling, type #1060                                                    | 2           |
     | BetterBibLaTeX; Software field company is mapped to publisher instead of organization #1054    | 1           |
     | Don't title-case sup-subscripts #1037                                                          | 8           |
     | Japanese rendered as Chinese in Citekey #979                                                   | 1           |
     | Dates incorrect when Zotero date field includes times #934                                     | 1           |
     | Juris-M missing multi-lingual fields #482                                                      | 2           |
     | biblatex export of Presentation; Use type and venue fields #644                                | 2           |
     | Month showing up in year field on export #889                                                  | 1           |
     | urldate when only DOI is exported #869                                                         | 1           |
     | Citations have month and day next to year #868                                                 | 2           |
     | Thin space in author name #859                                                                 | 1           |
     | Multiple locations and-or publishers and BibLaTeX export #689                                  | 1           |
     | Treat dash-connected words as a single word for citekey generation #619                        | 1           |
     | customized fields with curly brackets are not exported correctly anymore #775                  | 1           |
     | EDTF dates in BibLaTeX #590                                                                    | 27          |
     | Better BibLaTeX.stable-keys                                                                    | 6           |
     | remove the field if the override is empty #303                                                 | 1           |
     | Extra semicolon in biblatexadata causes export failure #133                                    | 3           |
     | Spaces not stripped from citation keys #294                                                    | 1           |
     | Abbreviations in key generated for Conference Proceedings #548                                 | 1           |
     | @jurisdiction; map court,authority to institution #326                                         | 1           |
     | Normalize date ranges in citekeys #356                                                         | 3           |
     | CSL status = biblatex pubstate #573                                                            | 1           |
     | Math parts in title #113                                                                       | 1           |
     | map csl-json variables #293                                                                    | 2           |
     | Fields in Extra should override defaults                                                       | 1           |
     | BibLaTeX; export CSL override 'issued' to date or year #351                                    | 1           |
     | csquotes #302                                                                                  | 2           |
     | Oriental dates trip up date parser #389                                                        | 1           |
     | Non-ascii in dates is not matched by date parser #376                                          | 1           |
     | transliteration for citekey #580                                                               | 1           |
     | Title case of latex greek text on biblatex export #564                                         | 2           |
     | pre not working in Extra field #559                                                            | 1           |
     | @legislation; map code,container-title to journaltitle #327                                    | 1           |
     | Be robust against misconfigured journal abbreviator #127                                       | 1           |
     | Better BibLaTeX.001                                                                            | 1           |
     | Better BibLaTeX.002                                                                            | 2           |
     | Better BibLaTeX.003                                                                            | 2           |
     | Better BibLaTeX.004                                                                            | 1           |
     | Better BibLaTeX.005                                                                            | 1           |
     | Better BibLaTeX.006                                                                            | 1           |
     | Better BibLaTeX.007                                                                            | 1           |
     | Better BibLaTeX.009                                                                            | 2           |
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
     | Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253 | 1 |
     | auth leaves punctuation in citation key #310                                                   | 1           |
     | condense in cite key format not working #308                                                   | 1           |
     | italics in title - capitalization #541                                                         | 1           |
     | CSL title, volume-title, container-title=BL title, booktitle, maintitle #381                   | 2           |
     | Better BibLaTeX.019                                                                            | 1           |
     | Ignore HTML tags when generating citation key #264                                             | 1           |
     | Export Forthcoming as Forthcoming                                                              | 1           |
     | CSL variables only recognized when in lowercase #408                                           | 1           |
     | date and year are switched #406                                                                | 4           |
     | Do not caps-protect literal lists #391                                                         | 3           |
     | biblatex; Language tag xx is exported, xx-XX is not #380                                       | 1           |
     | markup small-caps, superscript, italics #301                                                   | 2           |
     | don't escape entry key fields for #296                                                         | 1           |
     | typo stature-statute (zotero item type) #284                                                   | 1           |
     | bookSection is always converted to @inbook, never @incollection #282                           | 1           |
     | referencetype= does not work #278                                                              | 1           |
     | References with multiple notes fail to export #174                                             | 1           |
     | Better BibTeX does not use biblatex fields eprint and eprinttype #170                          | 1           |
     | Capitalisation in techreport titles #160                                                       | 1           |
     | German Umlaut separated by brackets #146                                                       | 1           |
     | HTML Fragment separator escaped in url #140 #147                                               | 1           |
     | Export Newspaper Article misses section field #132                                             | 1           |
     | Exporting of single-field author lacks braces #130                                             | 1           |
     | Hang on non-file attachment export #112 - URL export broken #114                               | 2           |
     | DOI with underscores in extra field #108                                                       | 1           |
     | underscores in URL fields should not be escaped #104                                           | 1           |
     | Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105              | 1           |
     | Better BibLaTeX.023                                                                            | 1           |
     | Better BibLaTeX.022                                                                            | 1           |
     | Better BibLaTeX.021                                                                            | 1           |
     | Better BibLaTeX.020                                                                            | 1           |
     | Better BibLaTeX.017                                                                            | 1           |
     | Better BibLaTeX.016                                                                            | 1           |
     | Better BibLaTeX.015                                                                            | 1           |
     | Better BibLaTeX.014                                                                            | 1           | must wait for fidus parser
     | Better BibLaTeX.013                                                                            | 1           |
     | Better BibLaTeX.012                                                                            | 1           |
     | Better BibLaTeX.011                                                                            | 1           |
     | Better BibLaTeX.010                                                                            | 1           |
     | Malformed HTML                                                                                 | 1           |
     | Allow explicit field override                                                                  | 1           |

@441 @439 @bbt @300 @565 @551 @558 @747 @892 @899 @901 @976 @977 @978 @746 @1069 @1092 @1091
@1110 @1112
Scenario Outline: BibTeX Export
  Given I import <references> references from "export/<file>.json"
  Then an export using "Better BibTeX" should match "export/<file>.bibtex"

  Examples:
     | file                                                                               | references |
     | No space between author first and last name because last char of first name is translated to a latex command #1091 | 1 |
     | date not always parsed properly into month and year with PubMed #1112              | 2          |
     | error on exporting note with pre tags; duplicate field howpublished #1092          | 2          |
     | No booktitle field when exporting references from conference proceedings #1069     | 1          |
     | braces after textemdash followed by unicode #980                                   | 1          |
     | BetterBibtex export fails for missing last name #978                               | 1          |
     | Export unicode as plain text fails for Vietnamese characters #977                  | 1          |
     | Hyphenated last names not escaped properly (or at all) in BibTeX #976              | 1          |
     | Better BibTeX does not export collections #901                                     | 36         |
     | [authN_M] citation key syntax has off-by-one error #899                            | 1          |
     | creating a key with [authForeIni] and [authN] not working properly #892            | 2          |
     | date ranges #747+#746                                                              | 5          |
     | bibtex export of phdthesis does not case-protect -type- #435                       | 1          |
     | Empty bibtex clause in extra gobbles whatever follows #99                          | 1          |
     | Braces around author last name when exporting BibTeX #565                          | 5          |
     | veryshorttitle and compound words #551                                             | 4          |
     | titles are title-cased in .bib file #558                                           | 2          |
     | Missing JabRef pattern; authEtAl #554                                              | 1          |
     | Missing JabRef pattern; authorsN+initials #553                                     | 1          |
     | custom fields should be exported as-is #441                                        | 1          |
     | Replicate Zotero key algorithm #439                                                | 3          |
     | preserve BibTeX Variables does not check for null values while escaping #337       | 1          |
     | Underscores break capital-preservation #300                                        | 1          |
     | Numbers confuse capital-preservation #295                                          | 1          |
     | Export C as {v C}, not v{C} #152                                                   | 1          |
     | capital delta breaks .bib output #141                                              | 1          |
     | Export of item to Better Bibtex fails for auth3_1 #98                              | 1          |
     | Better BibTeX.027                                                                  | 1          |
     | Better BibTeX.026                                                                  | 1          |
     | Better BibTeX.018                                                                  | 1          |

@test-cluster-1
@131
Scenario: Omit URL export when DOI present. #131
  When I import 3 references with 2 attachments from "export/Omit URL export when DOI present. #131.json" into a new collection
  And I set preference .DOIandURL to both
  And I set preference .jabrefFormat to 3
  Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.groups3.biblatex"
  And I set preference .jabrefFormat to 4
  Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.default.biblatex"
  And I set preference .DOIandURL to doi
  Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-DOI.biblatex"
  And I set preference .DOIandURL to url
  Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-url.biblatex"

@test-cluster-1
@438 @bbt
Scenario: BibTeX name escaping has a million inconsistencies #438
  When I import 2 references from "export/BibTeX name escaping has a million inconsistencies #438.json"
  And I set preference .relaxAuthors to true
  Then an export using "Better BibTeX" should match "export/BibTeX name escaping has a million inconsistencies #438.bibtex"

@test-cluster-1
@708 @957
Scenario: Citekey generation failure #708 and sort references on export #957
  Given I set preference .sorted to true
  When I set preference .citekeyFormat to [auth.etal][shortyear:prefix,.][0][Title:fold:nopunct:skipwords:select,1,1:abbr:lower:alphanum:prefix,.]
  And I import 6 references from "export/Citekey generation failure #708.json"
  And I set preference .citekeyFormat to [auth:lower]_[veryshorttitle:lower]_[year]
  And I import 6 references from "export/Citekey generation failure #708.json"
  Then an export using "Better BibLaTeX" should match "export/Citekey generation failure #708.biblatex"

@test-cluster-1
@117
Scenario: Bibtex key regenerating issue when trashing items #117
  When I import 1 reference from "export/Bibtex key regenerating issue when trashing items #117.json"
  And I select the first item where publicationTitle = "Genetics"
  And I remove the selected item
  And I import 1 reference from "export/Bibtex key regenerating issue when trashing items #117.json" into "Second Import.json"
  Then an export using "Better BibLaTeX" should match "export/Bibtex key regenerating issue when trashing items #117.biblatex"

@test-cluster-1
@412 @bbt
Scenario: BibTeX URLs
  Given I import 1 reference from "export/BibTeX; URL missing in bibtex for Book Section #412.json"
  And I set preference .bibtexURL to "off"
  Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.off.bibtex"
  When I set preference .bibtexURL to "note"
  Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.note.bibtex"
  When I set preference .bibtexURL to "url"
  Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.url.bibtex"

@test-cluster-1
@cayw
Scenario: CAYW picker
  When I import 3 references from "export/cayw.json"
  And I pick "6 The time it takes: temporalities of planning" for CAYW:
    | label | page |
    | locator | 1 |
  And I pick "A bicycle made for two? The integration of scientific techniques into archaeological interpretation" for CAYW:
    | label | chapter |
    | locator | 1 |
  Then the picks for "pandoc" should be "@bentley_academic_2011, p. 1; @pollard_bicycle_2007, ch. 1"
  And the picks for "mmd" should be "[#bentley_academic_2011][][#pollard_bicycle_2007][]"
  And the picks for "latex" should be "\cite[1]{bentley_academic_2011}\cite[ch. 1]{pollard_bicycle_2007}"
  # And the picks for "scannable-cite" should be "{ | Abram, 2014 | p. 1 | | zu:0:ITEMKEY }{ | Pollard, & Bray, 2007 | ch. 1 | | zu:0:ITEMKEY }"
  And the picks for "asciidoctor-bibtex" should be "cite:[bentley_academic_2011(1), pollard_bicycle_2007(ch. 1)]"

@test-cluster-1
@307 @bbt
Scenario: thesis zotero entries always create @phpthesis bibtex entries #307
  When I import 2 references from "export/thesis zotero entries always create @phdthesis bibtex entries #307.json"
  Then an export using "Better BibLaTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.biblatex"
  And an export using "Better BibTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.bibtex"

@test-cluster-1
@402 @bbt
Scenario: bibtex; url export does not survive underscores #402
  When I import 1 reference from "export/bibtex; url export does not survive underscores #402.json"
  Then an export using "Better BibLaTeX" should match "export/bibtex; url export does not survive underscores #402.biblatex"
  And an export using "Better BibTeX" should match "export/bibtex; url export does not survive underscores #402.bibtex"

@test-cluster-1
@110 @111
Scenario: two ISSN number are freezing browser #110 / Generating keys and export broken #111
  When I import 1 reference from "export/two ISSN number are freezing browser #110.json"
  And I select the first item where publicationTitle = "Genetics"
  And I unpin the citation key
  And I refresh the citation key
  Then an export using "Better BibLaTeX" should match "export/two ISSN number are freezing browser #110.biblatex"

@arXiv @85 @bbt
Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
  When I import 1 references from "export/Square brackets in Publication field (85).json"
  Then an export using "Better BibTeX" should match "export/Square brackets in Publication field (85).bibtex"

@86 @bbt @arXiv
Scenario: Include first name initial(s) in cite key generation pattern (86)
  When I set preference .citekeyFormat to [auth+initials][year]
   And I import 1 reference from "export/Include first name initial(s) in cite key generation pattern (86).json"
  Then an export using "Better BibTeX" should match "export/Include first name initial(s) in cite key generation pattern (86).bibtex"

@860
Scenario: Season ranges should be exported as pseudo-months (13-16, or 21-24) #860
  When I import 6 reference from "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.json"
  Then an export using "Better CSL JSON" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.json"
  And an export using "Better CSL YAML" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.yml"
  And an export using "Better BibLaTeX" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.biblatex"

@922
Scenario: CSL YAML export of date with original publication date in [brackets] #922
  When I import 1 reference from "export/CSL YAML export of date with original publication date in [brackets] #922.json"
  Then an export using "Better CSL YAML" should match "export/CSL YAML export of date with original publication date in [brackets] #922.csl.yml"

@856
Scenario: Quotes around last names should be removed from citekeys #856
  When I import 1 reference from "export/Quotes around last names should be removed from citekeys #856.json"
  Then an export using "Better CSL JSON" should match "export/Quotes around last names should be removed from citekeys #856.csl.json"

@372 @pandoc
Scenario: BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372
  When I import 1 reference from "export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.json"
  Then an export using "Better CSL JSON" should match "export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.csl.json"

@365 @pandoc @825
Scenario: Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825
  When I import 7 references from "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.json"
  Then an export using "Better BibLaTeX" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.biblatex"
  And an export using "Better CSL JSON" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.csl.json"

@587
Scenario: Setting the item type via the cheater syntax #587
  When I import 5 references from "export/Setting the item type via the cheater syntax #587.json"
  Then an export using "Better BibLaTeX" should match "export/Setting the item type via the cheater syntax #587.biblatex"
  And an export using "Better BibTeX" should match "export/Setting the item type via the cheater syntax #587.bibtex"
  And an export using "Better CSL JSON" should match "export/Setting the item type via the cheater syntax #587.csl.json"

@test-cluster-1
@360 @811 @pandoc
Scenario: Date export to Better CSL-JSON #360 #811
  When I import 15 references from "export/Date export to Better CSL-JSON #360 #811.json"
  And an export using "Better CSL JSON" should match "export/Date export to Better CSL-JSON #360 #811.csl.json"
  And an export using "Better BibLaTeX" should match "export/Date export to Better CSL-JSON #360 #811.biblatex"

@test-cluster-1
@432 @447 @pandoc @598
Scenario: Pandoc/LaTeX/SCHOMD Citation Export
  When I import 4 references with 3 attachments from "export/Pandoc Citation.json"
  And I set preference .quickCopyMode to "pandoc"
  Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.pandoc"
  When I set preference .quickCopyMode to "latex"
  Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.latex"
  And an export using "Better CSL JSON" should match "export/Pandoc Citation.csl.json"
  And an export using "Better CSL YAML" should match "export/Pandoc Citation.csl.yml"
#  And a schomd bibtex request using '[["Berndt1994"],{"translator":"biblatex"}]' should match "export/Pandoc Citation.schomd.json"

@test-cluster-1
@journal-abbrev @bbt
Scenario: Journal abbreviations
  Given I set the following preferences:
    | .citekeyFormat    | [authors][year][journal]          |
    | .autoAbbrevStyle  | http://www.zotero.org/styles/cell |
    | .pinCitekeys      | on-export                         |
  And I import 1 reference with 1 attachment from "export/Better BibTeX.029.json"
  Then an export using "Better BibTeX" with the following export options should match "export/Better BibTeX.029.bibtex"
    | useJournalAbbreviation | true |

@test-cluster-1
@81 @bbt
Scenario: Journal abbreviations exported in bibtex (81)
  Given I set the following preferences:
    | .citekeyFormat          | [authors2][year][journal:nopunct] |
    | .autoAbbrevStyle        | http://www.zotero.org/styles/cell |
    | .pinCitekeys            | on-export                         |
  And I import 1 reference from "export/Journal abbreviations exported in bibtex (81).json"
  Then an export using "Better BibTeX" with the following export options should match "export/Journal abbreviations exported in bibtex (81).bibtex"
    | useJournalAbbreviation  | true |

@postscript @bbt
Scenario: Post script
  Given I import 3 references from "export/Export web page to misc type with notes and howpublished custom fields #329.json"
  And I set preference .postscript to "export/Export web page to misc type with notes and howpublished custom fields #329.js"
  Then an export using "Better BibTeX" should match "export/Export web page to misc type with notes and howpublished custom fields #329.bibtex"

@postscript @1043
Scenario: Post script
  Given I import 1 references from "export/Unbalanced vphantom escapes #1043.json"
  Then an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043.bibtex"
  When I set preference .postscript to "export/Detect and protect LaTeX math formulas.js"
  Then an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043-mathmode.bibtex"

@460
Scenario: arXiv identifiers in BibLaTeX export #460
  Given I import 3 references from "export/arXiv identifiers in BibLaTeX export #460.json"
  Then an export using "Better BibLaTeX" should match "export/arXiv identifiers in BibLaTeX export #460.biblatex"
  And an export using "Better BibTeX" should match "export/arXiv identifiers in BibLaTeX export #460.bibtex"

@456
Scenario: Ignoring upper cases in German titles #456
  Given I import 2 references from "export/Ignoring upper cases in German titles #456.json"
  Then an export using "Better BibLaTeX" should match "export/Ignoring upper cases in German titles #456.biblatex"
  And an export using "Better BibTeX" should match "export/Ignoring upper cases in German titles #456.bibtex"

@266 @286 @bblt
Scenario: Diacritics stripped from keys regardless of ascii or fold filters #266
  Given I import 1 reference from "export/Diacritics stripped from keys regardless of ascii or fold filters #266.json"
  Then an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-fold.biblatex"
  When I set preference .citekeyFold to false
  And I refresh all citation keys
  Then an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-nofold.biblatex"

@384 @bbt @565 @566
Scenario: Do not caps-protect name fields #384 #565 #566
  Given I import 40 references from "export/Do not caps-protect name fields #384 #565 #566.json"
  Then an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biblatex"
  And an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.bibtex"
  When I set preference .bibtexParticleNoOp to true
  Then an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.noopsort.bibtex"
  When I set preference .biblatexExtendedNameFormat to true
  Then an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biber26.biblatex"

@383 @bblt
Scenario: Capitalize all title-fields for language en #383
  Given I import 8 references from "export/Capitalize all title-fields for language en #383.json"
  Then an export using "Better BibLaTeX" should match "export/Capitalize all title-fields for language en #383.biblatex"

@411 @bblt
Scenario: Sorting and optional particle handling #411
  Given I import 2 references from "export/Sorting and optional particle handling #411.json"
  And I set preference .parseParticles to true
  Then an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.on.biblatex"
  When I set preference .parseParticles to false
  Then an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.off.biblatex"

@test-cluster-1 @ae
Scenario: auto-export
  Given I import 3 references with 2 attachments from "export/autoexport.json" into a new collection
  And I set preference .autoExport to immediate
  And I set preference .jabrefFormat to 3
  Then an auto-export to "/tmp/autoexport.bib" using "Better BibLaTeX" should match "export/autoexport.before.biblatex"
  And an auto-export of "/autoexport" to "/tmp/autoexport.coll.bib" using "Better BibLaTeX" should match "export/autoexport.before.coll.biblatex"
  When I select the first item where publisher = "IEEE"
  And I remove the selected item
  And I wait 5 seconds
  Then "/tmp/autoexport.bib" should match "export/autoexport.after.biblatex"
  And "/tmp/autoexport.coll.bib" should match "export/autoexport.after.coll.biblatex"

@313 @bblt
Scenario: (non-)dropping particle handling #313
  When I import 53 references from "export/(non-)dropping particle handling #313.json"
  Then an export using "Better BibLaTeX" should match "export/(non-)dropping particle handling #313.biblatex"
