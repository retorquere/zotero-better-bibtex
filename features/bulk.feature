@firefox-bulk @bulkexport
Feature: Bulk Export & Cache

@noreset
Scenario: Major bulk export cache testing
   Then a timed library export using 'Better BibLaTeX' should match 'export/Really Big whopping library.bib'

Scenario: Minor bulk export cache testing
  When I import 1241 references with 581 attachments from 'export/Big whopping library.json'
   Then a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
