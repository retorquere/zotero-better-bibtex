@test-cluster-3 @bulkexport
Feature: Bulk Export & Cache

Scenario: Minor bulk export cache testing
  When I import 1241 references with 581 attachments from 'export/Big whopping library.json'
   Then the following library export should match 'export/Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then the following library export should match 'export/Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
