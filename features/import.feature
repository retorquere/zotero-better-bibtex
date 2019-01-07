@import
Feature: Import

Background:
  Given I set preference .citekeyFormat to [auth][year]
  And I set preference .jabrefGroups to 0
  And I set preference .defaultDateParserLocale to en-GB

@i1 @schomd
Scenario: Better BibTeX Import 2
  When I import 2 references from "import/Better BibTeX.002.bib"
  Then an export using "BetterBibTeX JSON" should match "import/Better BibTeX.002.json"
#  And the markdown citation for Torre2008 should be '\(Torre & Verducci, 2008\)'
#  And the markdown bibliography for Torre2008 should be '<a name="@Torre2008"></a>Torre, J., & Verducci, T. \(2008\). _The Yankee Years_.  Doubleday.'
#  And the markdown citation for orre2008 should be ''
#  And the markdown bibliography for orre2008 should be ''

@472
Scenario: Math markup to unicode not always imported correctly #472
  When I import 3 references from "import/Math markup to unicode not always imported correctly #472.bib"
  Then an export using "BetterBibTeX JSON" should match "import/Math markup to unicode not always imported correctly #472.json"
  And I set preference .preserveBibTeXVariables to true
  Then an export using "Better BibTeX" should match "import/Math markup to unicode not always imported correctly #472.roundtrip.bib"

@758 @aux
Scenario: AUX scanner
  When I import 149 references from "import/AUX scanner-pre.json"
  And I import 1 reference from "import/AUX scanner.aux"
  Then an export using "BetterBibTeX JSON" should match "import/AUX scanner-post.json"

@nightly
Scenario Outline: Better BibTeX Import
  When I import <references> reference from "import/<file>.bib"
  Then an export using "BetterBibTeX JSON" should match "import/<file>.json"

  Examples:
  | file                                                                        | references  |
  | Some bibtex entries quietly discarded on import from bib file #873          | 986         |
 # | Async import, large library #720                                            | 9057        |

@test-cluster-1 @959 @1058 @871 @1081 @1115
Scenario Outline: Better BibTeX Import
  When I import <references> reference from "import/<file>.bib"
  Then an export using "BetterBibTeX JSON" should match "import/<file>.json"
  Examples:
  | file                                                                        | references  |
  | Wrong ring-above import #1115                                               | 1           |
  | Spaces lost when expanding string variables during import #1081             | 1           |
  | Issues with round instead of curly braces do not import correctly #871      | 1           |
  | BibLaTeX Patent author handling, type #1060                                 | 2           |
  | Import Jabref fileDirectory, unexpected reference type #1058                | 3           |
  | eprinttype field dropped on import #959                                     | 1           |
  | Better BibTeX.001                                                           | 2           |
  | BibTeX import; preamble with def create problems #732                       | 2           |
  | space after citekey creates confusion #716                                  | 2           |
  | Endnote should parse                                                        | 1           |
  | Author splitter failure                                                     | 1           |
  | Literal names                                                               | 1           |
  | Better BibTeX.010                                                           | 1           |
  | Better BibTeX.008                                                           | 1           |
  | Biblatex Annotation Import Bug #613                                         | 1           |
  | Better BibLaTeX import improvements #549                                    | 9           |
  | support Local-Zo-Url-x field from BibDesk2Zotero_attachments #667           | 1           |
  | Math formatting lost on import #627                                         | 1           |
  | zbb (quietly) chokes on this .bib #664                                      | 1           |
  | Failure to handle unparsed author names (92)                                | 1           |
  | Better BibTeX.003                                                           | 2           |
  | Better BibTeX.004                                                           | 1           |
  | Better BibTeX.005                                                           | 1           |
  | Better BibTeX.006                                                           | 1           |
  | Better BibTeX.007                                                           | 1           |
  | Better BibTeX.009                                                           | 3           |
  | Better BibTeX.011                                                           | 1           |
  | Better BibTeX.012                                                           | 1           |

@13
Scenario Outline: Better BibTeX Import
  When I import <references> reference from "import/<file>.bib"
  Then an export using "BetterBibTeX JSON" should match "import/<file>.json"
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
#  Then an export using "BetterBibTeX JSON" should match "import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json"

@717
Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #717
  When I import 3 references from "import/Jabref groups import does not work #717.2.10.bib" into a new collection
  Then an export using "BetterBibTeX JSON" should match "import/Jabref groups import does not work #717.2.10.json"
  When I import 4 references from "import/Jabref groups import does not work #717.3.8.bib" into a new collection
  Then an export using "BetterBibTeX JSON" should match "import/Jabref groups import does not work #717.3.8.json"
