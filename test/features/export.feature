@export
Feature: Export

  Background:
    Given I set the temp directory to "test/tmp"

  # And I cap the total memory use to 1.1G
  # And I cap the memory increase use to 100M
  @biblatex
  Scenario Outline: Export <references> references for BibLaTeX to <file>
    When I import <references> references from "export/<file>.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

    Examples:
      | file                                                                                                                     | references |
      | Zotero's Manuscript 'Type' is mapped to both biblatex's 'type' and 'howpublished' #2114                                  | 1          |
      | Configurable journal abbreviation for citekey #2097                                                                      | 1          |
      | BetterBibLaTeX exports articles as online #2058                                                                          | 3          |
      | How to export bib without month and date in year item (Using better bibtex) #2022                                        | 1          |
      | Capitalized words after colons not brace protected #1978                                                                 | 1          |
      | Extensions to citation format syntax #1933                                                                               | 1          |
      | Specific BBT citation key format is no longer working for my use case after update #1970                                 | 1          |
      | Define word delimiter characters #1943                                                                                   | 1          |
      | How to use the last word of the title? #1746                                                                             | 1          |
      | Detect journal abbreviation in the publication field #1951                                                               | 1          |
      | Define word delimiter characters #1943                                                                                   | 1          |
      | Export of hypen for range in the volume field #1929                                                                      | 1          |
      | Kuroshiro hardcoded to apply to all CJK language items when option checked #1928                                         | 2          |
      | Language field in the metadata exported incorrectly #1921                                                                | 86         |
      | Export article title capitalisation; P-Type vs n-type #1913                                                              | 1          |
      | Better Biblatex export generates invalid latex when processing zero-width spaces #1892                                   | 1          |
      | Cite archive documents with BetterBibLaTeX #1799                                                                         | 1          |
      | biber 2.14 rejects the date field generated from Better BibLaTex #1695                                                   | 1          |
      | Export fails for duplicate "extra" field #1739                                                                           | 1          |
      | type dataset exported as @data instead of @dataset for BibLaTeX #1720                                                    | 1          |
      | google-scholar like references #1705                                                                                     | 2          |
      | Book Title exports to Journaltitle for Biblatex @incollection reference type #1691                                       | 2          |
      | When exporting notes, also handle the blockquote tag #1656                                                               | 1          |
      | Entries with URL exported with (partial) URL in eprint field #1639                                                       | 2          |
      | error during export: duplicate field note #1636                                                                          | 1          |
      | Unexpected HTML tags abort export #1575                                                                                  | 1          |
      | JSTOR eprint data export depends on whether jstor link starts with https vs http #1543                                   | 1          |
      | lone ogonek should have brace                                                                                            | 1          |
      | Dateparser does not recognize de in Spanish dates #1513                                                                  | 1          |
      | Inconsistent date field formatting in BibLaTeX export #1493                                                              | 1          |
      | Regression in export to better biblatex #1491                                                                            | 1          |
      | Some Unicode characters converted to LaTeX #1481                                                                         | 1          |
      | @jurisdiction; map court,authority to institution #326                                                                   | 1          |
      | BBT export of square brackets in date #245 -- xref should not be escaped #246                                            | 3          |
      | BBT yields error with quality report #1387                                                                               | 1          |
      | Be robust against misconfigured journal abbreviator #127                                                                 | 1          |
      | Better BibLaTeX.001                                                                                                      | 1          |
      | Better BibLaTeX.002                                                                                                      | 2          |
      | Better BibLaTeX.003                                                                                                      | 2          |
      | Better BibLaTeX.004                                                                                                      | 1          |
      | Better BibLaTeX.005                                                                                                      | 1          |
      | Better BibLaTeX.006                                                                                                      | 1          |
      | Better BibLaTeX.007                                                                                                      | 1          |
      | Better BibLaTeX.009                                                                                                      | 2          |
      | Better BibLaTeX.010                                                                                                      | 1          |
      | Better BibLaTeX.011                                                                                                      | 1          |
      | Better BibLaTeX.012                                                                                                      | 1          |
      | Better BibLaTeX.013                                                                                                      | 1          |
      | Better BibLaTeX.014                                                                                                      | 1          |
      | Better BibLaTeX.015                                                                                                      | 1          |
      | Better BibLaTeX.016                                                                                                      | 1          |
      | Better BibLaTeX.017                                                                                                      | 1          |
      | Better BibLaTeX.019                                                                                                      | 1          |
      | Better BibLaTeX.020                                                                                                      | 1          |
      | Better BibLaTeX.021                                                                                                      | 1          |
      | Better BibLaTeX.022                                                                                                      | 1          |
      | Better BibLaTeX.023                                                                                                      | 1          |
      | Better BibLaTeX.stable-keys                                                                                              | 6          |
      | Better BibTeX does not use biblatex fields eprint and eprinttype #170                                                    | 1          |
      | BetterBibLaTeX; Software field company is mapped to publisher instead of organization #1054                              | 1          |
      | BibLaTeX Patent author handling, type #1060                                                                              | 2          |
      | BibLaTeX; export CSL override 'issued' to date or year #351                                                              | 1          |
      | BibTeX variable support for journal titles. #309                                                                         | 1          |
      | Book converted to mvbook #288                                                                                            | 1          |
      | Book sections have book title for journal in citekey #409                                                                | 1          |
      | BraceBalancer                                                                                                            | 1          |
      | CSL status = biblatex pubstate #573                                                                                      | 1          |
      | CSL title, volume-title, container-title=BL title, booktitle, maintitle #381                                             | 2          |
      | CSL variables only recognized when in lowercase #408                                                                     | 1          |
      | Capitalisation in techreport titles #160                                                                                 | 1          |
      | Citations have month and day next to year #868                                                                           | 2          |
      | Colon in bibtex key #405                                                                                                 | 1          |
      | Colon not allowed in citation key format #268                                                                            | 1          |
      | DOI with underscores in extra field #108                                                                                 | 1          |
      | Date parses incorrectly with year 1000 when source Zotero field is in datetime format. #515                              | 1          |
      | Dates incorrect when Zotero date field includes times #934                                                               | 1          |
      | Do not caps-protect literal lists #391                                                                                   | 3          |
      | Do not use more than three initials in case of authshort key #1079                                                       | 1          |
      | Does the publisher field work when put in Zoteros extra field #1370                                                      | 1          |
      | Dollar sign in title not properly escaped #485                                                                           | 1          |
      | Don't title-case sup-subscripts #1037                                                                                    | 8          |
      | Duplicate number field causes export error #1448                                                                         | 1          |
      | EDTF dates in BibLaTeX #590                                                                                              | 27         |
      | Error exporting duplicate eprinttype #1128                                                                               | 1          |
      | Export Forthcoming as Forthcoming                                                                                        | 1          |
      | Export Newspaper Article misses section field #132                                                                       | 1          |
      | Export Patent Applications as such #1413                                                                                 | 2          |
      | Export error for items without publicationTitle and Preserve BibTeX variables enabled #201                               | 1          |
      | Export mapping for reporter field #219                                                                                   | 1          |
      | Exporting of single-field author lacks braces #130                                                                       | 1          |
      | Extra semicolon in biblatexadata causes export failure #133                                                              | 3          |
      | Fields in Extra should override defaults                                                                                 | 1          |
      | German Umlaut separated by brackets #146                                                                                 | 1          |
      | HTML Fragment separator escaped in url #140 #147                                                                         | 1          |
      | Hang on non-file attachment export #112 - URL export broken #114                                                         | 2          |
      | Ignore HTML tags when generating citation key #264                                                                       | 1          |
      | Japanese rendered as Chinese in Citekey #979                                                                             | 1          |
      | Juris-M missing multi-lingual fields #482                                                                                | 2          |
      | Latex commands in extra-field treated differently #1207                                                                  | 1          |
      | Malformed HTML                                                                                                           | 1          |
      | Math parts in title #113                                                                                                 | 1          |
      | Month showing up in year field on export #889                                                                            | 1          |
      | Multiple locations and-or publishers and BibLaTeX export #689                                                            | 1          |
      | Non-ascii in dates is not matched by date parser #376                                                                    | 1          |
      | Normalize date ranges in citekeys #356                                                                                   | 3          |
      | Oriental dates trip up date parser #389                                                                                  | 1          |
      | Protect math sections #1148                                                                                              | 1          |
      | References with multiple notes fail to export #174                                                                       | 1          |
      | Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105                                        | 1          |
      | Spaces not stripped from citation keys #294                                                                              | 1          |
      | Suppress brace protection #1139                                                                                          | 1          |
      | Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253 | 1          |
      | Thin space in author name #859                                                                                           | 1          |
      | Title case of latex greek text on biblatex export #564                                                                   | 2          |
      | Treat dash-connected words as a single word for citekey generation #619                                                  | 1          |
      | Treat ideographs as individual words for key generation #1353                                                            | 1          |
      | auth leaves punctuation in citation key #310                                                                             | 1          |
      | condense in cite key format not working #308                                                                             | 1          |
      | csquotes #302                                                                                                            | 2          |
      | customized fields with curly brackets are not exported correctly anymore #775                                            | 1          |
      | italics in title - capitalization #541                                                                                   | 1          |
      | map csl-json variables #293                                                                                              | 2          |
      | markup small-caps, superscript, italics #301                                                                             | 2          |
      | micro sign (unicode B5) export seems wrong and span in title #1434                                                       | 2          |
      | paragraphs in Zotero notes need par #1422                                                                                | 1          |
      | pre not working in Extra field #559                                                                                      | 1          |
      | referencetype= does not work #278                                                                                        | 1          |
      | tex.IDs= foo_bar are escaped despite the equals sign #1449                                                               | 1          |
      | transliteration for citekey #580                                                                                         | 1          |
      | typo stature-statute (zotero item type) #284                                                                             | 1          |
      | urldate when only DOI is exported #869                                                                                   | 1          |
      | Allow explicit field override                                                                                            | 1          |
      | Abbreviations in key generated for Conference Proceedings #548                                                           | 1          |
      | ADS exports dates like 1993-00-00 #1066                                                                                  | 1          |
      | @legislation; map code,container-title to journaltitle #327                                                              | 1          |
      | underscores in URL fields should not be escaped #104                                                                     | 1          |
      | remove the field if the override is empty #303                                                                           | 1          |
      | don't escape entry key fields for #296                                                                                   | 1          |
      | origyear not taken from csl extra-field for citation key generation #1395                                                | 2          |
      | date and year are switched #406                                                                                          | 4          |
      | bookSection is always converted to @inbook, never @incollection #282                                                     | 1          |
      | biblatex; Language tag xx is exported, xx-XX is not #380                                                                 | 1          |
      | biblatex export of Presentation; Use type and venue fields #644                                                          | 2          |
      | URL-DOI exclusive export broken for item types with no dedicated DOI field #1331                                         | 1          |
      | date ranges #747+#746                                                                                                    | 5          |
      | preserve @strings between import-export #1162                                                                            | 1          |

  @bibtex
  Scenario Outline: Export <references> references for BibTeX to <file>
    Given I import <references> references from "export/<file>.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

    Examples:
      | file                                                                                                               | references |
      | Non-breakable spaces in author fields should be exported as tilde #1430                                            | 1          |
      | University is exported as publisher as soon as tex.referencetype is specified in Extra field #1965                 | 1          |
      | fetch inspire-hep key #1879                                                                                        | 1          |
      | Debugging translator issue for PhD Dissertation type #1950                                                         | 1          |
      | Customise name-separator and list-separator #1927                                                                  | 1          |
      | citation key format nopunctordash filter list #1880                                                                | 1          |
      | Export report+type as preprint                                                                                     | 1          |
      | Use creator in extra field when there is no creator in the usual places? #1873                                     | 1          |
      | Exporting "month = {season}" for BibTeX #1810                                                                      | 1          |
      | bibtex does not export season dates                                                                                | 1          |
      | DOI not escaped using postscript #1803                                                                             | 1          |
      | Using the Extra field in the exported Citation Key #1571                                                           | 1          |
      | shortyear adds 00 when date is missing #1769                                                                       | 1          |
      | Word segmentation for Chinese references #1682                                                                     | 1          |
      | Cannot ignore archivePrefix export field #1744                                                                     | 1          |
      | url field is having its special characters escaped in BBT Bibtex #1716                                             | 1          |
      | Match against @string value for export #1597                                                                       | 1          |
      | BibTeX journal article QR reports missing field number #1589                                                       | 2          |
      | Format disambiguations #1554                                                                                       | 2          |
      | BibTeX Warning for Inbook Entries with Author and Editor Fields #1541                                              | 1          |
      | Unicode ø in author name is exported with trailing space which does not work in bibtex #1538                       | 1          |
      | lone ogonek should have brace                                                                                      | 1          |
      | Regression in export to better biblatex #1491                                                                      | 1          |
      | add date, origdate functions, and format-date filter #1488                                                         | 4          |
      | Some Unicode characters converted to LaTeX #1481                                                                   | 1          |
      | Publisher Address of BibTeX Inproceedings Entries #1471                                                            | 1          |
      | 30-Mar-2020 parsed as literal #1476                                                                                | 1          |
      | BibTeX Entries with Volume and Number Fields #1475                                                                 | 1          |
      | Exporting Book Sections as Inbook #1474                                                                            | 1          |
      | Missing $ in TeX export of < to langle #1469                                                                       | 1          |
      | Better BibTeX does not export collections #901                                                                     | 36         |
      | Better BibTeX.027                                                                                                  | 1          |
      | Minimize bibtex export package dependencies #1402                                                                  | 1          |
      | No booktitle field when exporting references from conference proceedings #1069                                     | 1          |
      | Underscores break capital-preservation #300                                                                        | 1          |
      | preserve BibTeX Variables does not check for null values while escaping #337                                       | 1          |
      | veryshorttitle and compound words #551                                                                             | 4          |
      | error on exporting note with pre tags; duplicate field howpublished #1092                                          | 2          |
      | custom fields should be exported as-is #441                                                                        | 1          |
      | citekey firstpage-lastpage #1147                                                                                   | 2          |
      | capital delta breaks .bib output #141                                                                              | 1          |
      | bibtex export of phdthesis does not case-protect -type- #435                                                       | 1          |
      | Hyphenated last names not escaped properly (or at all) in BibTeX #976                                              | 1          |
      | Empty bibtex clause in extra gobbles whatever follows #99                                                          | 1          |
      | Double superscript in title field on export #1217                                                                  | 1          |
      | BetterBibtex export fails for missing last name #978                                                               | 1          |
      | Better BibTeX.018                                                                                                  | 1          |
      | Better BibTeX.026                                                                                                  | 1          |
      | Book chapter citation using p. instead of pp. #1375                                                                | 1          |
      | Braces around author last name when exporting BibTeX #565                                                          | 5          |
      | Edition Numbers in BibTeX Exports #1446                                                                            | 1          |
      | Error exporting with custom Extra field #1118                                                                      | 1          |
      | Export C as {v C}, not v{C} #152                                                                                   | 1          |
      | Export of item to Better Bibtex fails for auth3_1 #98                                                              | 1          |
      | Export unicode as plain text fails for Vietnamese characters #977                                                  | 1          |
      | Exporting to bibtex with unicode as plain-text latex commands does not convert U+2040 #1265                        | 1          |
      | Mismatched conversion of braces in title on export means field never gets closed #1218                             | 1          |
      | Missing JabRef pattern; authEtAl #554                                                                              | 1          |
      | Missing JabRef pattern; authorsN+initials #553                                                                     | 1          |
      | No brace protection when suppressTitleCase set to true #1188                                                       | 3          |
      | No space between author first and last name because last char of first name is translated to a latex command #1091 | 1          |
      | Numbers confuse capital-preservation #295                                                                          | 1          |
      | Open date range crashes citekey generator #1227                                                                    | 1          |
      | Replicate Zotero key algorithm #439                                                                                | 3          |
      | [authN_M] citation key syntax has off-by-one error #899                                                            | 1          |
      | braces after textemdash followed by unicode #980                                                                   | 1          |
      | creating a key with [authForeIni] and [authN] not working properly #892                                            | 2          |
      | date not always parsed properly into month and year with PubMed #1112                                              | 2          |
      | date ranges #747+#746                                                                                              | 5          |
      | preserve @strings between import-export #1162                                                                      | 1          |
      | titles are title-cased in .bib file #558                                                                           | 2          |

    @use.with_client=zotero
    Examples:
      | BibTeX export is incompatible with Zotero 6 Preprint item type. #2080 | 1 |

  @csl
  Scenario Outline: Export <references> references for CSL JSON to <file>
    When I import <references> references from "export/<file>.json"
    Then an export using "Better CSL JSON" should match "export/*.csl.json"

    Examples:
      | file                                                             | references |
      | Better CSL JSON does not include authority field #2019           | 1          |
      | Multiple creators in Extra not exported in Better CSL JSON #2015 | 1          |
      | Deterministic ordering for CSL #1178 #1400                       | 26         |
      | CSL exporters; ignore [Fields to omit from export] setting #1179 | 26         |
      | Quotes around last names should be removed from citekeys #856    | 1          |
      | BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372 | 1          |

  Scenario: Omit URL export when DOI present. #131
    When I import 3 references with 2 attachments from "export/*.json" into a new collection
    And I set preference .DOIandURL to "both"
    And I set preference .jabrefFormat to 3
    Then an export using "Better BibLaTeX" should match "export/*.groups3.biblatex"
    And I set preference .jabrefFormat to 4
    Then an export using "Better BibLaTeX" should match "export/*.default.biblatex"
    And I set preference .DOIandURL to "doi"
    Then an export using "Better BibLaTeX" should match "export/*.prefer-DOI.biblatex"
    And I set preference .DOIandURL to "url"
    Then an export using "Better BibLaTeX" should match "export/*.prefer-url.biblatex"

  Scenario: Changing item type for only BibLaTeX does not work #1694
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @438 @bbt
  Scenario: BibTeX name escaping has a million inconsistencies #438
    When I import 2 references from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  @1194
  Scenario: suppressBraceProtection does not work for BibTeX export (non-English items) #1194
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.sbp.bibtex"
    When I set preference .exportBraceProtection to true
    Then an export using "Better BibTeX" should match "export/*.bibtex"
    And an export using "Better BibLaTeX" should match "export/*.biblatex"

  @708 @957
  Scenario: Citekey generation failure #708 and sort references on export #957
    When I set preference .citekeyFormat to "[auth.etal][shortyear:prefix,.][0][Title:fold:nopunct:skipwords:select,1,1:abbr:lower:alphanum:prefix,.]"
    And I import 6 references from "export/*.json"
    And I set preference .citekeyFormat to "[auth:lower]_[veryshorttitle:lower]_[year]"
    And I import 6 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @117
  Scenario: Bibtex key regenerating issue when trashing items #117
    When I import 1 reference from "export/*.json"
    And I select the item with a field that contains "Genetics"
    And I remove the selected item
    And I import 1 reference from "export/*.json" into "Second Import.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @412 @bbt
  Scenario: BibTeX; URL missing in bibtex for Book Section #412
    Given I import 1 reference from "export/*.json"
    And I set preference .bibtexURL to "off"
    Then an export using "Better BibTeX" should match "export/*.off.bibtex"
    When I set preference .bibtexURL to "note"
    Then an export using "Better BibTeX" should match "export/*.note.bibtex"
    When I set preference .bibtexURL to "url"
    Then an export using "Better BibTeX" should match "export/*.url.bibtex"

  @cayw
  Scenario: CAYW picker
    When I import 3 references from "export/cayw.json"
    And I pick "temporalities of planning" for CAYW
      | page | 1 |
    And I pick "A bicycle made for two" for CAYW
      | chapter | 1 |
    And I pick "Commonwealth" for CAYW
      | section | 5         |
      | prefix  | see       |
      | suffix  | et passim |
    And I pick "Commonwealth" for CAYW
      | volume | <1> |
      | prefix | see |
    Then the picks for "pandoc" should be "@bentley_academic_2011, p. 1; @pollard_bicycle_2007, ch. 1; see @kartinyeri, sec. 5 et passim; see @kartinyeri, vol. <1>"
    And the picks for "mmd" should be "[#bentley_academic_2011][][#pollard_bicycle_2007][][see][#kartinyeri][see][#kartinyeri]"
    And the picks for "latex" should be "\cite[1]{bentley_academic_2011}\cite[ch. 1]{pollard_bicycle_2007}\cite[see][sec. 5, et passim]{kartinyeri}\cite[see][vol. $<$1$>$]{kartinyeri}"
    # And the picks for "scannable-cite" should be "{ | Abram, 2014 | p. 1 | | zu:0:ITEMKEY }{ | Pollard, & Bray, 2007 | ch. 1 | | zu:0:ITEMKEY }"
    And the picks for "asciidoctor-bibtex" should be "cite:[bentley_academic_2011(1), pollard_bicycle_2007(ch. 1), kartinyeri(sec. 5), kartinyeri(vol. <1>)]"
    And the picks for "biblatex" should be "\autocites[1]{bentley_academic_2011}[ch. 1]{pollard_bicycle_2007}[see][sec. 5, et passim]{kartinyeri}[see][vol. $<$1$>$]{kartinyeri}"

  @307 @bbt
  Scenario: thesis zotero entries always create @phdthesis bibtex entries #307
    When I import 2 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"

  @402 @bbt
  Scenario: bibtex; url export does not survive underscores #402
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"

  @110 @111
  Scenario: two ISSN number are freezing browser #110 + Generating keys and export broken #111
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.pinned.biblatex"
    When I select the item with a field that contains "Genetics"
    And I unpin the citation key
    And I refresh the citation key
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  Scenario: Postfixed keys different between computers #1788
    When I import 2 references from "export/*.json"
    And I select the item with a field that contains "Wittgenstein"
    And I pin the citation key to "heyns2021"
    And I wait 2 seconds
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @arXiv @85 @bbt
  Scenario: Square brackets in Publication field (85), and non-pinned keys must change when the pattern does
    When I import 1 references from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  @86 @bbt @arXiv
  Scenario: Include first name initial(s) in cite key generation pattern (86)
    When I set preference .citekeyFormat to "[auth+initials][year]"
    And I import 1 reference from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  @1155
  Scenario: Postscript error aborts CSL JSON export #1155
    When I set preference .ignorePostscriptErrors to true
    When I import 4 references from "export/*.json"
    Then an export using "Better CSL JSON" should match "export/*.csl.json"

  @860 @cslyml
  Scenario: Season ranges should be exported as pseudo-months (13-16, or 21-24) #860
    When I import 6 references from "export/*.json"
    Then an export using "Better CSL JSON" should match "export/*.csl.json"
    And an export using "Better CSL YAML" should match "export/*.csl.yml"
    And an export using "Better BibLaTeX" should match "export/*.biblatex"

  @922 @cslyml
  Scenario: CSL YAML export of date with original publication date in [brackets] #922
    When I import 1 reference from "export/*.json"
    Then an export using "Better CSL YAML" should match "export/*.csl.yml"

  @365 @pandoc @825
  Scenario: Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825
    When I import 7 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better CSL JSON" should match "export/*.csl.json"

  @587
  Scenario: Setting the item type via the cheater syntax #587
    When I import 5 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"
    And an export using "Better CSL JSON" should match "export/*.csl.json"

  @360 @811 @pandoc
  Scenario: Date export to Better CSL-JSON #360 #811
    When I import 15 references from "export/*.json"
    And an export using "Better CSL JSON" should match "export/*.csl.json"
    And an export using "Better BibLaTeX" should match "export/*.biblatex"

  @432 @447 @pandoc @598 @cslyml @qc
  Scenario: Pandoc-LaTeX-SCHOMD Citation Export
    When I import 4 references with 3 attachments from "export/*.json"
    And I set preference .quickCopyMode to "pandoc"
    Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/*.pandoc"
    When I set preference .quickCopyMode to "latex"
    Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/*.latex"
    And an export using "Better CSL JSON" should match "export/*.csl.json"
    And an export using "Better CSL YAML" should match "export/*.csl.yml"

  # And a schomd bibtex request using '[["Berndt1994"],{"translator":"biblatex"}]' should match "export/*.schomd.json"
  @journal-abbrev @bbt
  Scenario: Journal abbreviations
    Given I set preference .citekeyFormat to "[authors][year][journal]"
    And I set preference .autoAbbrevStyle to "http://www.zotero.org/styles/cell"
    And I import 1 reference with 1 attachment from "export/*.json"
    Then an export using "Better BibTeX" with useJournalAbbreviation on should match "export/*.bibtex"

  @81 @bbt
  Scenario: Journal abbreviations exported in bibtex (81)
    Given I set preference .citekeyFormat to "[authors2][year][journal:nopunct]"
    And I set preference .autoAbbrevStyle to "http://www.zotero.org/styles/cell"
    And I import 1 reference from "export/*.json"
    Then an export using "Better BibTeX" with useJournalAbbreviation on should match "export/*.bibtex"

  @postscript @bbt
  Scenario: Export web page to misc type with notes and howpublished custom fields #329
    Given I import 3 references from "export/*.json"
    And I set preference .postscript to "export/*.js"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  @postscript @bbt
  Scenario: Custom field ordering -- dependent on order entry in Extra rather than static #2082
    Given I import 1 reference from "export/*.json"
    And I set preference .postscript to "export/*.js"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @postscript @bbt
  Scenario: Transforming exported file names (windows path conversion) #1939
    Given I import 1 reference from "export/*.json"
    And I set preference .postscript to "export/*.js"
    And I set preference .workers to 0
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  @postscript @1043
  Scenario: Unbalanced vphantom escapes #1043
    Given I import 1 references from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"
    When I set preference .postscript to "export/Detect and protect LaTeX math formulas.js"
    Then an export using "Better BibTeX" should match "export/*-mathmode.bibtex"

  @460
  Scenario: arXiv identifiers in BibLaTeX export #460
    Given I import 3 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"

  @456
  Scenario: Ignoring upper cases in German titles #456
    Given I import 2 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"

  @266 @286 @bblt
  Scenario: Diacritics stripped from keys regardless of ascii or fold filters #266
    Given I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*-fold.biblatex"
    When I set preference .citekeyFold to false
    And I refresh all citation keys
    Then an export using "Better BibLaTeX" should match "export/*-nofold.biblatex"

  @384 @bbt @565 @566
  Scenario: Do not caps-protect name fields #384 #565 #566
    Given I import 40 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibTeX" should match "export/*.bibtex"
    When I set preference .bibtexParticleNoOp to true
    Then an export using "Better BibTeX" should match "export/*.noopsort.bibtex"
    When I set preference .biblatexExtendedNameFormat to true
    Then an export using "Better BibLaTeX" should match "export/*.biber26.biblatex"

  @383 @bblt
  Scenario: Capitalize all title-fields for language en #383
    Given I import 8 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @411 @bblt
  Scenario: Sorting and optional particle handling #411
    Given I import 2 references from "export/*.json"
    And I set preference .parseParticles to true
    Then an export using "Better BibLaTeX" should match "export/*.on.biblatex"
    When I set preference .parseParticles to false
    Then an export using "Better BibLaTeX" should match "export/*.off.biblatex"

  @ae
  Scenario: auto-export
    Given I import 3 references with 2 attachments from "export/*.json" into a new collection
    And I set preference .autoExport to "immediate"
    And I set preference .jabrefFormat to 3
    Then an auto-export to "~/autoexport.bib" using "Better BibLaTeX" should match "export/*.before.biblatex"
    And an auto-export of "/auto-export" to "~/autoexport.coll.bib" using "Better BibLaTeX" should match "export/*.before.coll.biblatex"
    When I select the item with a field that is "IEEE"
    And I remove the selected item
    And I wait 10 seconds
    Then "~/autoexport.bib" should match "export/*.after.biblatex"
    And "~/autoexport.coll.bib" should match "export/*.after.coll.biblatex"

  Scenario: Choose fields to exclude for each exported file #1827
    Given I import 1 reference from "export/*.json"
    And I set preference .skipFields to "title"
    And I set preference .preferencesOverride to "better-bibtex.json"
    Then an export to "~/override.bib" using "Better BibLaTeX" should match "export/*.biblatex"
    When I create preference override "~/override.json"
    And I set preference override .skipFields to ""
    Then an export to "~/override.bib" using "Better BibLaTeX" should match "export/*.override.biblatex"
    When I remove preference override "~/override.json"
    Then an export to "~/override.bib" using "Better BibLaTeX" should match "export/*.biblatex"

  @313 @bblt
  Scenario: (non-)dropping particle handling #313
    When I import 53 references from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
    And an export using "Better BibLaTeX" with cacheUse on should match "export/*-cached.biblatex"

  @1420
  Scenario: (non-)dropping particle handling #313
    When I import 53 references from "export/*.json"
    And I set preference .workers to 0
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  @1270
  Scenario: automatic tags in export #1270
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  # Institute behaves different in Juris-M
  @use.with_client=zotero
  Scenario: Field Institution not available anymore in key pattern for Zotero #1568
    When I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  # tests the cache
  @use.with_client=zotero @use.with_slow=true @timeout=3000 @whopper @whopper-cached
  Scenario: Really Big whopping library
    When I restart Zotero with "1287" + "export/*.json"
    And I reset the cache
    Then an export using "Better BibTeX" should match "export/*.bibtex"
    Then an export using "Better BibTeX" with cacheUse on should match "export/*-cached.bibtex"
    When I set preference .cache to false
    Then an export using "Better BibTeX" with cacheUse on should match "export/*-uncached.bibtex"

  # tests without cache prefill
  @use.with_client=zotero @use.with_slow=true @timeout=3000 @whopper-uncached
  Scenario: Really Big whopping library
    When I restart Zotero with "1287" + "export/*.json"
    And I reset the cache
    And I set preference .cache to false
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  # tests the cache for CSL
  @use.with_client=zotero @use.with_slow=true @timeout=3000 @whopper
  Scenario: Really Big whopping library
    When I restart Zotero with "1287" + "export/*.json"
    And I reset the cache
    Then an export using "Better CSL JSON" should match "export/*.csl.json"
    And an export using "Better CSL JSON" should match "export/*.csl.json", but take no more than 150 seconds

  # @use.with_client=zotero @use.with_slow=true @timeout=300
  # @1296
  # Scenario: Cache does not seem to fill #1296
  # When I restart Zotero with "1296"
  # And I empty the trash
  # #  Then an export using "Better BibTeX" should match "export/*.bibtex"
  # #  And an export using "Better BibTeX" should match "export/*.bibtex", but take no more than 150 seconds
  # Then an auto-export to "/tmp/autoexport.bib" using "Better BibTeX" should match "export/*.bibtex"
  # And I remove "/tmp/autoexport.bib"
  # When I remove all items from "Cited/2010 - CHI (Magic)"
  # And I wait 5 seconds
  # And I wait at most 100 seconds until all auto-exports are done
  # Then "/tmp/autoexport.bib" should match "export/*.bibtex"

  @1495
  Scenario: use author dash separation rather than camel casing in citekey #1495
    Given I import 1 reference from "export/*.json"
    When I set preference .citekeyFormat to "[authors2+-:lower]_[year]-[shorttitle:condense=-:lower]"
    And I refresh all citation keys
    Then an export using "Better BibTeX" should match "export/*.bibtex"
    When I set preference .citekeyFormat to "[authors2:condense=-:lower]_[year]-[shorttitle:condense=-:lower]"
    And I refresh all citation keys
    Then an export using "Better BibTeX" should match "export/*.bibtex"

  Scenario: Collected notes
    Given I import 36 references from "export/*.json"
    Then an export using "Collected notes" should match "export/*.html"

  Scenario: Export as Collected Notes does not list subcollections #1768
    Given I import 51 references from "export/*.json"
    Then an export using "Collected notes" should match "export/*.html"

  Scenario: Exporting folder, previous postscript does not work anymore #1962
    Given I import 2 references from "export/*.json" into a new collection
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  Scenario: Exporting %-encoded URLs (e.g. containing %20) #1966
    Given I import 1 reference from "export/*.json"
    And I set preference .bibtexURL to "url"
    Then an export using "Better BibTeX" should match "export/*.url.bibtex"
    When I set preference .bibtexURL to "url-ish"
    Then an export using "Better BibTeX" should match "export/*.url-ish.bibtex"
    When I set preference .bibtexURL to "url"
    And I set preference .verbatimFields to "doi,file,ids,eprint,verba,verbb,verbc,groups"
    Then an export using "Better BibTeX" should match "export/*.bibtex"

# Scenario: error exporting Better BibLaTex this.preference.skipFields is undefined #2029
# Given I restart Zotero
# And I remove all items
# When I import 2 references from "export/*.json"
# Then an export using "Better BibLaTeX" should match "export/*.biblatex"
# When I select the item with a field that contains "Collapse"
# Then a quick-copy using "Better BibLaTeX" should match "export/*.biblatex"
