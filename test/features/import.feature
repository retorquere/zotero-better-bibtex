@import
Feature: Import

  Background:
    Given I set preference .citekeyFormat to "auth + year"
    And I set preference .jabrefFormat to 0

  @schomd
  Scenario: Better BibTeX Import 2
    When I import 2 references from "import/*.bib"
    Then the library should match "import/*.json"

  Scenario: URL not recognised in a simple online bib file entry on import #2842
    When I apply the preferences from "import/*.json"
    And I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  Scenario: Allow location and address field in imported bibtex entries to be stored in Extra field #3287
    When I apply the preferences from "import/*.json"
    And I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  # And the markdown citation for Torre2008 should be '\(Torre & Verducci, 2008\)'
  # And the markdown bibliography for Torre2008 should be '<a name="@Torre2008"></a>Torre, J., & Verducci, T. \(2008\). _The Yankee Years_.  Doubleday.'
  # And the markdown citation for orre2008 should be ''
  # And the markdown bibliography for orre2008 should be ''
  Scenario: LaTeX commands in Zotero should be exported untouched #1380
    When I set preference .rawImports to true
    And I import 1 references from "import/*.bib"
    Then the library should match "import/*.json"
    And an export using "Better BibLaTeX" should match "import/*.roundtrip.bib"

  Scenario: CSL-YAML import
    When I import 11 references from "import/*.yml"
    Then the library should match "import/*.json"

  Scenario: detect-urls
    When I set preference .verbatimFields to "url,doi,file,pdf,ids,eprint,/^verb[a-z]$/,groups,/^citeulike-linkout-[0-9]+$/,/^bdsk-url-[0-9]+$/, /^url_/"
    And I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  @1358
  Scenario: Import support for the online type in BBT #1358
    When I import 1 references from "import/*.bib"
    Then the library should match "import/*.json"
    And an export using "Better BibLaTeX" should match "import/*.roundtrip.bib"

  @472
  Scenario: Math markup to unicode not always imported correctly #472
    When I set preference .importJabRefStrings to false
    And I set preference .importJabRefAbbreviations to false
    When I import 3 references from "import/*.bib"
    Then the library should match "import/*.json"
    And I set preference .exportBibTeXStrings to "detect"
    Then an export using "Better BibTeX" should match "import/*.roundtrip.bib"

  @1246
  Scenario: importing a title-cased bib #1246
    When I import 2 references from "import/*.bib"
    Then the library should match "import/*.json"
    And an export using "Better BibTeX" should match "import/*.roundtrip.bib"

  @758 @aux @2164
  Scenario: AUX scanner
    When I import 149 references from "import/*-pre.json"
    And I import 1 reference from "import/*.1.aux"
    And I import 1 reference from "import/*.2.aux"
    Then the library should match "import/*-post.json"

  Scenario: Copy date-addeddate-modified menu option not working #2378
    When I import 2 references from "import/*.bib"
    And I select 2 items with a field that contains "formal"
    And I copy date-added/date-modified for the selected items from the extra field
    And I wait 2 seconds
    Then the library should match "import/*.json"

  Scenario: Copy date-addeddate-modified from extra field regenerates citation key #2142
    When I import 1 reference from "import/*.bib"
    And I select the item with a field that contains "Bargaining"
    And I copy date-added/date-modified for the selected items from the extra field
    Then the library should match "import/*.json"

  @use.with_slow=true @timeout=3000
  Scenario: Import error with character '+' in BibTeX field name #2660
    When I import 283 references from "import/*.bib"
    Then the library should match "import/*.json"

  Scenario Outline: Import <references> references from <file>
    When I import <references> references from "import/<file>.bib"
    Then the library should match "import/*.json"

    Examples:
      | file                                                                                                                    | references |
      | Multiple attachments in calibre bibtex file not imported in Zotero #3338                                                | undefined  |
      | Book imported as book section when duplicate book title field is present #3328                                          | 1          |
      | Double newlines means parbreak #2789                                                                                    | 1          |
      | Report number field is incorrectly translated into the issue field when importing a techreport from a .bib file #2752   | 1          |
      | Report number field is incorrectly translated into the issue field when importing a dataset from a .bib file #2752      | 1          |
      | Report number field is incorrectly translated into the issue field when importing a jurisdiction from a .bib file #2752 | 1          |
      | Report number field is incorrectly translated into the issue field when importing a legislation from a .bib file #2752  | 1          |
      | Report number field is incorrectly translated into the issue field when importing a patent from a .bib file #2752       | 1          |
      | Report number field is incorrectly translated into the issue field when importing a report from a .bib file #2752       | 1          |
      | Report number field is incorrectly translated into the issue field when importing a standard from a .bib file #2752     | 1          |
      | Report number field is incorrectly translated into the issue field when importing a techreport from a .bib file #2752   | 1          |
      | Imported name suffix in family part #2744                                                                               | 1          |
      | DOIs excluded from export in 6.7.86 #2555                                                                               | 1          |
      | issuenumberarticle-number #2551                                                                                         | 1          |
      | Allow spaces between href arguments for import #2504                                                                    | 4          |
      | Film references do not export properly for APA formating #2494                                                          | 4          |
      | article with entrysubtype                                                                                               | 1          |
      | Qiqqa                                                                                                                   | 2          |
      | Import from Clipboard stopped working #2377                                                                             | 1          |
      | Child items that use the crossref field do not have their parent fields imported #2373                                  | 3          |
      | accessDate must be ISO date #2376                                                                                       | 2          |
      | Dealing with base64-encoded paths from BibDesk #2374                                                                    | 3          |
      | Lowercase A in BBT Sentence Case #2078                                                                                  | 1          |
      | Map the call-number field from Bib(La)TeX to call number #2021                                                          | 1          |
      | Detect journal abbreviation in the publication field #1951                                                              | 1          |
      | Improve import of films #1837                                                                                           | 4          |
      | tex.origdate ignored in citekey generation #1696                                                                        | 1          |
      | collaborators to contributors                                                                                           | 1          |
      | BBT does not import groups from JabRef 5.1 #1641                                                                        | 20         |
      | Importing changes Journal to The Journal #1601                                                                          | 1          |
      | Import of langle and rangle TeX commands #1468                                                                          | 1          |
      | Overline during Import #1467                                                                                            | 8          |
      | Better BibLaTeX import improvements #549                                                                                | 9          |
      | Better BibTeX.003                                                                                                       | 2          |
      | Better BibTeX.004                                                                                                       | 1          |
      | Better BibTeX.005                                                                                                       | 1          |
      | Better BibTeX.006                                                                                                       | 1          |
      | Better BibTeX.009                                                                                                       | 3          |
      | Better BibTeX.011                                                                                                       | 1          |
      | Better BibTeX.012                                                                                                       | 1          |
      | Better BibTeX.014                                                                                                       | 1          |
      | Biblatex Annotation Import Bug #613                                                                                     | 1          |
      | Endnote should parse                                                                                                    | 1          |
      | Import location to event-place for conference papers                                                                    | 1          |
      | Issues with round instead of curly braces do not import correctly #871                                                  | 1          |
      | Math formatting lost on import #627                                                                                     | 1          |
      | Spaces lost when expanding string variables during import #1081                                                         | 1          |
      | Wrong ring-above import #1115                                                                                           | 1          |
      | eprinttype field dropped on import #959                                                                                 | 1          |
      | support Local-Zo-Url-x field from BibDesk2Zotero_attachments #667                                                       | 1          |
      | Author splitter failure                                                                                                 | 1          |
      | Better BibTeX.001                                                                                                       | 2          |
      | Better BibTeX.008                                                                                                       | 1          |
      | Better BibTeX.010                                                                                                       | 1          |
      | Better BibTeX.015                                                                                                       | 1          |
      | BibLaTeX Patent author handling, type #1060                                                                             | 2          |
      | BibTeX import; preamble with def create problems #732                                                                   | 1          |
      | Failure to handle unparsed author names (92)                                                                            | 1          |
      | Import Jabref fileDirectory, unexpected reference type #1058                                                            | 2          |
      | Import fails to perform @String substitutions #154                                                                      | 1          |
      | Literal names                                                                                                           | 1          |
      | Problem when importing BibTeX entries with percent sign #95 or preamble #96                                             | 1          |
      | Problem when importing BibTeX entries with square brackets #94                                                          | 1          |
      | Title of German entry converted to lowercase during import #1350                                                        | 4          |
      | space after citekey creates confusion #716                                                                              | 2          |
      | zbb (quietly) chokes on this .bib #664                                                                                  | 1          |
      | import software related biblatex entries #1544                                                                          | 1          |
      | BBT + Zotfile creating duplicate files in the wrong location #2300                                                      | 7          |
      | Imported tags from Calibre (bibtex.file) are a single tag in Zotero #2743                                               | 1          |

  @use.with_slow=true @timeout=3000
  Scenario: Some bibtex entries quietly discarded on import from bib file #873
    Given I set preference .importDetectURLs to false
    When I import 989 references from "import/*.bib"
    Then the library should match "import/*.json"

  # | Async import, large library #720                                            | 9057        |
  # covered by 717
  # @97
  # Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #97
  # When I import 911 references with 42 attachments from "import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.bib"
  # Then the library should match "import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json"
  @1446
  Scenario: Edition Numbers in BibTeX Exports #1446
    When I import 1 reference from "export/*.bibtex"
    Then the library should match "export/*.roundtrip.json"

  Scenario: Import to Extra instead of Note #2191
    Given I set preference .importNoteToExtra to "note"
    When I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  Scenario: Options to use default import process? #1562
    Given I set preference .importExtra to false
    And I set preference .importCitationKey to false
    When I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  @717
  Scenario: Jabref groups import does not work #717
    When I import 3 references from "import/*.2.10.bib" into a new collection
    Then the library should match "import/*.2.10.json"
    When I import 4 references from "import/*.3.8.bib" into a new collection
    Then the library should match "import/*.3.8.json"

  Scenario: Jabref import - groups lost #1730
    When I import 4 references from "import/*-3.bib" into a new collection
    And I import 4 references from "import/*-5.bib" into a new collection
    Then the library should match "import/*.json"

  @use.with_slow=true @timeout=2400 @1436
  Scenario: Unabbreviate on import #1436-1
    When I import 506 references from "import/*.bib" into a new collection
    Then the library should match "import/*.json"

  # @1436
  # Scenario: Unabbreviate on import #1436-2
  # When I import 1053 references from "import/*.bib" into a new collection
  # Then the library should match "import/*.json"
  # @use.with_slow=true @timeout=6000
  # @1436
  # Scenario: Unabbreviate on import #1436-3
  # When I import 7166 references from "import/*.bib" into a new collection
  # Then the library should match "import/*.json"
  Scenario: unknown command handler #1733
    Given I set preference .importUnknownTexCommand to "tex"
    When I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"

  # https://forums.zotero.org/discussion/comment/371812/#Comment_371812
  @use.with_slow=true @timeout=3000
  Scenario: web_page and other mendeley idiocy
    When I import 512 references from "import/*.bib" into a new collection
    Then the library should match "import/*.json"

  Scenario: Journal detection active while importJabrefAbbreviations is off #2916
    Given I set preference .rawImports to true
    And I set preference .importJabRefAbbreviations to false
    When I import 1 reference from "import/*.bib"
    Then the library should match "import/*.json"