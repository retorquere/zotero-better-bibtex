@import
Feature: Import

@failing @failing-1 @bbtx-i-1 @i-1
Scenario: Better BibTeX Import 1
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.001.bib'
  Then capture the log
  Then the library should match 'import/Better BibTeX.001.json'

@failing @failing-2 @bbtx-i-2
Scenario: Better BibTeX Import 2
  When I import 2 references from 'import/Better BibTeX.002.bib'
  Then the library should match 'import/Better BibTeX.002.json'

@failing @failing-3 @bbtx-i-3
Scenario: Better BibTeX Import 3
  When I import 2 references from 'import/Better BibTeX.003.bib'
  Then the library should match 'import/Better BibTeX.003.json'

@failing @failing-4 @bbtx-i-4
Scenario: Better BibTeX Import 4
  When I import 1 reference from 'import/Better BibTeX.004.bib'
  Then the library should match 'import/Better BibTeX.004.json'

@failing @failing-5 @bbtx-i-5
Scenario: Better BibTeX Import 5
  When I import 1 reference from 'import/Better BibTeX.005.bib'
  Then the library should match 'import/Better BibTeX.005.json'

@failing @failing-6 @bbtx-i-6
Scenario: Better BibTeX Import 6
  When I import 1 reference from 'import/Better BibTeX.006.bib'
  Then the library should match 'import/Better BibTeX.006.json'

@failing @failing-7 @bbtx-i-7
Scenario: Better BibTeX Import 7
  When I import 1 reference from 'import/Better BibTeX.007.bib'
  Then the library should match 'import/Better BibTeX.007.json'

@failing @failing-8 @bbtx-i-8
Scenario: Better BibTeX Import 8
  When I import 1 reference from 'import/Better BibTeX.008.bib'
  Then the library should match 'import/Better BibTeX.008.json'

@failing @failing-9 @bbtx-i-9
Scenario: Better BibTeX Import 9
  When I import 3 references with 1 attachment from 'import/Better BibTeX.009.bib'
  Then the library should match 'import/Better BibTeX.009.json'

@failing @failing-10 @bbtx-i-10
Scenario: Better BibTeX Import 10
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.010.bib'
  Then the library should match 'import/Better BibTeX.010.json'

@failing @failing-11 @bbtx-i-11
Scenario: Better BibTeX Import 11
  When I import 1 reference with 1 attachment from 'import/Better BibTeX.011.bib'
  Then the library should match 'import/Better BibTeX.011.json'

@failing @failing-12 @bbtx-i-12
Scenario: Better BibTeX Import 12
  When I import 1 reference from 'import/Better BibTeX.012.bib'
  Then the library should match 'import/Better BibTeX.012.json'

@failing @failing-13 @bbtx-i-13
Scenario: Better BibTeX Import 13
  When I import 2 references from 'import/Better BibTeX.013.bib'
  Then the library should match 'import/Better BibTeX.013.json'

@failing @failing-14 @bbtx-i-14
Scenario: Better BibTeX Import 14
  When I import 1 reference from 'import/Better BibTeX.014.bib'
  Then the library should match 'import/Better BibTeX.014.json'

@failing @failing-15 @bbtx-i-15
Scenario: Better BibTeX Import 15
  When I import 1 reference with 2 attachments from 'import/Better BibTeX.015.bib'
  Then the library should match 'import/Better BibTeX.015.json'

@failing @failing-16 @bbtx-i-16
Scenario: Better BibTeX Import 16
  When I import 1 reference from 'import/Better BibTeX.016.bib'
  Then the library should match 'import/Better BibTeX.016.json'

@failing @failing-17 @89
Scenario: Author splitter failure (89)
  When I import 1 reference from 'import/Author splitter failure.bib'
  Then the library should match 'import/Author splitter failure.json'

@failing @failing-18 @92
Scenario: Failure to handle unparsed author names (92)
  When I import 1 reference from 'import/Failure to handle unparsed author names (92).bib'
  Then the library should match 'import/Failure to handle unparsed author names (92).json'

@failing @failing-19 @94
Scenario: Problem when importing BibTeX entries with square brackets #94
  When I import 1 reference from 'import/Problem when importing BibTeX entries with square brackets #94.bib'
  Then the library should match 'import/Problem when importing BibTeX entries with square brackets #94.json'

@failing @failing-20 @95 @96
Scenario: Problem when importing BibTeX entries with percent sign #95 or preamble #96
  When I import 1 reference from 'import/Problem when importing BibTeX entries with percent sign #95 or preamble #96.bib'
  Then the library should match 'import/Problem when importing BibTeX entries with percent sign #95 or preamble #96.json'

#@97
#Scenario: Maintain the JabRef group and subgroup structure when importing a BibTeX db #97
#  When I import 915 reference with 42 attachments from 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.bib'
#  Then the library should match 'import/Maintain the JabRef group and subgroup structure when importing a BibTeX db #97.json'
