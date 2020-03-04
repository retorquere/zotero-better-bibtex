@import @test-cluster-1
Feature: Import

Background:
  Given I set preference .citekeyFormat to [auth][year]
  And I set preference .jabrefFormat to 0

@i1 @schomd
Scenario: Better BibTeX Import 2
  When I import 2 references from "import/*.bib"
  Then the library should match "import/*.json"
#  And the markdown citation for Torre2008 should be '\(Torre & Verducci, 2008\)'
#  And the markdown bibliography for Torre2008 should be '<a name="@Torre2008"></a>Torre, J., & Verducci, T. \(2008\). _The Yankee Years_.  Doubleday.'
#  And the markdown citation for orre2008 should be ''
#  And the markdown bibliography for orre2008 should be ''

@1380
Scenario: LaTeX commands in Zotero should be exported untouched #1380
  When I set preference .rawImports to true
  And I import 1 references from "import/*.bib"
  Then the library should match "import/*.json"
  And an export using "Better BibLaTeX" should match "import/*.roundtrip.bib"

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
  And I set preference .exportBibTeXStrings to detect
  Then an export using "Better BibTeX" should match "import/*.roundtrip.bib"

@1246
Scenario: importing a title-cased bib #1246
  When I import 2 references from "import/*.bib"
  Then the library should match "import/*.json"
  And an export using "Better BibTeX" should match "import/*.roundtrip.bib"

@758 @aux
Scenario: AUX scanner
  When I import 149 references from "import/*-pre.json"
  And I import 1 reference from "import/*.aux"
  Then the library should match "import/*-post.json"

@873 @slow @timeout=3000
Scenario Outline: Better BibTeX Import
  When I import <references> references from "import/<file>.bib"
  Then the library should match "import/*.json"

  Examples:
  | file                                                                        | references  |
  | Some bibtex entries quietly discarded on import from bib file #873          | 989         |
 # | Async import, large library #720                                            | 9057        |

@test-cluster-1 @959 @1058 @871 @1081 @1115 @1350 @667
Scenario Outline: Better BibTeX Import
  When I import <references> references from "import/<file>.bib"
  Then the library should match "import/*.json"
  Examples:
  | file                                                                        | references  |
  | support Local-Zo-Url-x field from BibDesk2Zotero_attachments #667           | 1           |
  | Author splitter failure                                                     | 1           |
  | Title of German entry converted to lowercase during import #1350            | 4           |
  | Import Jabref fileDirectory, unexpected reference type #1058                | 3           |
  | Import location to event-place for conference papers                        | 1           |
  | Wrong ring-above import #1115                                               | 1           |
  | Spaces lost when expanding string variables during import #1081             | 1           |
  | Issues with round instead of curly braces do not import correctly #871      | 1           |
  | BibLaTeX Patent author handling, type #1060                                 | 2           |
  | eprinttype field dropped on import #959                                     | 1           |
  | Better BibTeX.001                                                           | 2           |
  | BibTeX import; preamble with def create problems #732                       | 1           |
  | space after citekey creates confusion #716                                  | 2           |
  | Endnote should parse                                                        | 1           |
  | Literal names                                                               | 1           |
  | Better BibTeX.010                                                           | 1           |
  | Better BibTeX.008                                                           | 1           |
  | Biblatex Annotation Import Bug #613                                         | 1           |
  | Better BibLaTeX import improvements #549                                    | 9           |
  | Math formatting lost on import #627                                         | 1           |
  | zbb (quietly) chokes on this .bib #664                                      | 1           |
  | Failure to handle unparsed author names (92)                                | 1           |
  | Better BibTeX.003                                                           | 2           |
  | Better BibTeX.004                                                           | 1           |
  | Better BibTeX.005                                                           | 1           |
  | Better BibTeX.006                                                           | 1           |
  | Better BibTeX.009                                                           | 3           |
  | Better BibTeX.011                                                           | 1           |
  | Better BibTeX.012                                                           | 1           |

@13
Scenario Outline: Better BibTeX Import
  When I import <references> reference from "import/<file>.bib"
  Then the library should match "import/*.json"
  Examples:
  | file                                                                        | references  |
  # | Better BibTeX.014                                                           | 1           | # not supported by biblatex-csl-converter
  | Better BibTeX.015                                                           | 1           |
  | Problem when importing BibTeX entries with square brackets #94              | 1           |
  | Problem when importing BibTeX entries with percent sign #95 or preamble #96 | 1           |
  | Import fails to perform @String substitutions #154                          | 1           |

# covered by 717
#@97
#Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #97
#  When I import 911 references with 42 attachments from "import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.bib"
#  Then the library should match "import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json"

@717
Scenario: Jabref groups import does not work #717
  When I import 3 references from "import/*.2.10.bib" into a new collection
  Then the library should match "import/*.2.10.json"
  When I import 4 references from "import/*.3.8.bib" into a new collection
  Then the library should match "import/*.3.8.json"

@1436 @timeout=120
Scenario: Unabbreviate on import #1436-1
  When I import 506 references from "import/*.bib" into a new collection
  Then the library should match "import/*.json"
@1436 @timeout=240
Scenario: Unabbreviate on import #1436-2
  When I import 1053 references from "import/*.bib" into a new collection
  Then the library should match "import/*.json"
@1436 @slow @timeout=6000
Scenario: Unabbreviate on import #1436-3
  When I import 7166 references from "import/*.bib" into a new collection
  Then the library should match "import/*.json"
