@test-cluster-2 @import
Feature: Import

Scenario: Better BibTeX Import 2
  When I import 2 references from 'import/Better BibTeX.002.bib'
  Then the library without collections should match 'import/Better BibTeX.002.json'
  And the markdown citation for Torre2008 should be '["\\(Torre & Verducci, 2008\\)"]'

@i2
Scenario: option to mantain the braces and special commands in titles or all fields #100
  When I set preference .rawImports to true
  And I import 1 reference from 'import/Better BibTeX.007.bib'
  Then the library without collections should match 'import/Better BibTeX.007.raw.json'
  And a library export using 'Better BibTeX' should match 'import/Better BibTeX.007.roundtrip.bib'

@i3
Scenario Outline: Better BibTeX Import
  When I import <references> reference from 'import/<file>.bib'
  Then the library without collections should match 'import/<file>.json'

  Examples:
  | file                                                                        | references  |
  | Better BibTeX.001                                                           | 2           |
  | Better BibTeX.003                                                           | 2           |
  | Better BibTeX.004                                                           | 1           |
  | Better BibTeX.005                                                           | 1           |
  | Better BibTeX.006                                                           | 1           |
  | Better BibTeX.007                                                           | 1           |
  | Better BibTeX.008                                                           | 1           |
  | Better BibTeX.009                                                           | 5           |
  | Better BibTeX.010                                                           | 2           |
  | Better BibTeX.011                                                           | 2           |
  | Better BibTeX.012                                                           | 1           |
  | Better BibTeX.013                                                           | 2           |
  | Better BibTeX.014                                                           | 1           |
  | Better BibTeX.015                                                           | 3           |
  | Literal names                                                               | 1           |
  | Author splitter failure                                                     | 1           |
  | Failure to handle unparsed author names (92)                                | 1           |
  | Problem when importing BibTeX entries with square brackets #94              | 1           |
  | Problem when importing BibTeX entries with percent sign #95 or preamble #96 | 1           |
  | Import fails to perform @String substitutions #154                          | 1           |

#@97
#Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #97
#  When I import 915 reference with 42 attachments from 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.bib'
#  Then the library should match 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json'
