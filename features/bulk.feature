@bulkexport
Feature: Export

Background:
  Given I set preference translators.better-bibtex.testMode.timestamp to '2015-02-24 12:14:36 +0100'

Scenario: Bulk export cache testing
  When I import 1241 references with 581 attachments from 'export/Big whopping library.json'
   And I set preference translators.better-bibtex.caching to true
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
