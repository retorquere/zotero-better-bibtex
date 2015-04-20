@test-cluster-3 @bulkexport
Feature: Bulk Export & Cache

Scenario: Minor bulk export cache testing
  When I import 1241 references with 581 attachments from 'export/Big whopping library.json'
   Then a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
   And a timed library export using 'Better BibLaTeX' should match 'export/Big whopping library.bib'
