@test-cluster-3
Feature: Bulk Export & Cache

Background:
  Given I set preference .citekeyFormat to [auth][year]

@bulk
Scenario: Minor bulk export cache testing
  When I import 1241 references with 284 attachments from 'export/Big whopping library.json'
   Then the following library export should match 'export/Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then the following library export should match 'export/Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   When I set preference .caching to false
   Then the following library export should match 'export/Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |

@bwl @noci
Scenario: Major bulk export cache testing
  When I import 15129 references from 'export/Really Big whopping library.ris'
   Then the following library export should match 'export/Really Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then the following library export should match 'export/Really Big whopping library.bib':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
