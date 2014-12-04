@import
Feature: Import

@bbtx-i-1 @i-1
Scenario: Better BibTeX Import 1
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.001.bib'
  Then the library should match 'import/Better BibTeX.001.json'

@bbtx-i-2
Scenario: Better BibTeX Import 2
  When I import 2 references from 'import/Better BibTeX.002.bib'
  Then the library should match 'import/Better BibTeX.002.json'

@bbtx-i-3
Scenario: Better BibTeX Import 3
  When I import 2 references from 'import/Better BibTeX.003.bib'
  Then the library should match 'import/Better BibTeX.003.json'

@bbtx-i-4
Scenario: Better BibTeX Import 4
  When I import 1 reference from 'import/Better BibTeX.004.bib'
  Then the library should match 'import/Better BibTeX.004.json'

@bbtx-i-5
Scenario: Better BibTeX Import 5
  When I import 1 reference from 'import/Better BibTeX.005.bib'
  Then the library should match 'import/Better BibTeX.005.json'

@bbtx-i-6
Scenario: Better BibTeX Import 6
  When I import 1 reference from 'import/Better BibTeX.006.bib'
  Then the library should match 'import/Better BibTeX.006.json'

@bbtx-i-7
Scenario: Better BibTeX Import 7
  When I import 1 reference from 'import/Better BibTeX.007.bib'
  Then the library should match 'import/Better BibTeX.007.json'

@100
Scenario: option to mantain the braces and special commands in titles or all fields #100
  When I set preference translators.better-bibtex.raw-imports to true
   And I set export option Export Collections to false
  When I import 1 reference from 'import/Better BibTeX.007.bib'
  Then the library should match 'import/Better BibTeX.007.raw.json'
   And a library export using 'Better BibTeX' should match 'import/Better BibTeX.007.bib'

@bbtx-i-8
Scenario: Better BibTeX Import 8
  When I import 1 reference from 'import/Better BibTeX.008.bib'
  Then the library should match 'import/Better BibTeX.008.json'

@bbtx-i-9
Scenario: Better BibTeX Import 9
  When I import 3 references with 1 attachment from 'import/Better BibTeX.009.bib'
  Then the library should match 'import/Better BibTeX.009.json'

@bbtx-i-10
Scenario: Better BibTeX Import 10
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.010.bib'
  Then the library should match 'import/Better BibTeX.010.json'

@bbtx-i-11
Scenario: Better BibTeX Import 11
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.011.bib'
  Then the library should match 'import/Better BibTeX.011.json'

@bbtx-i-12
Scenario: Better BibTeX Import 12
  When I import 1 reference from 'import/Better BibTeX.012.bib'
  Then the library should match 'import/Better BibTeX.012.json'

@bbtx-i-13
Scenario: Better BibTeX Import 13
  When I import 2 references from 'import/Better BibTeX.013.bib'
  Then the library should match 'import/Better BibTeX.013.json'

@bbtx-i-14
Scenario: Better BibTeX Import 14
  When I import 1 reference from 'import/Better BibTeX.014.bib'
  Then the library should match 'import/Better BibTeX.014.json'

@bbtx-i-15
Scenario: Better BibTeX Import 15
  When I import 1 reference with 2 attachments from 'import/Better BibTeX.015.bib'
  Then the library should match 'import/Better BibTeX.015.json'

@bbtx-i-16
Scenario: Literal names in braces
  When I import 1 reference from 'import/Literal names.bib'
  Then the library should match 'import/Literal names.json'

@89
Scenario: Author splitter failure (89)
  When I import 1 reference from 'import/Author splitter failure.bib'
  Then the library should match 'import/Author splitter failure.json'

@92
Scenario: Failure to handle unparsed author names (92)
  When I import 1 reference from 'import/Failure to handle unparsed author names (92).bib'
  Then the library should match 'import/Failure to handle unparsed author names (92).json'

@94
Scenario: Problem when importing BibTeX entries with square brackets #94
  When I import 1 reference from 'import/Problem when importing BibTeX entries with square brackets #94.bib'
  Then the library should match 'import/Problem when importing BibTeX entries with square brackets #94.json'

@95 @96
Scenario: Problem when importing BibTeX entries with percent sign #95 or preamble #96
  When I import 1 reference from 'import/Problem when importing BibTeX entries with percent sign #95 or preamble #96.bib'
  Then the library should match 'import/Problem when importing BibTeX entries with percent sign #95 or preamble #96.json'

#@97
#Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #97
#  When I import 915 reference with 42 attachments from 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.bib'
#  Then the library should match 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json'
