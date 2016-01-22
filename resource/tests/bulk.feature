@test-cluster-3
Feature: Bulk Export & Cache

Background:
  Given I set preference .citekeyFormat to [auth][year]
  And I set preference .jabrefGroups to false
  And I set preference .defaultDateParserLocale to en-US
  And I set preference .titleCase to true

@bulk
Scenario: Minor bulk export cache testing
  When I import 1241 references with 284 attachments from 'export/Bulk performance test.json'
   Then the following library export should match 'export/Bulk performance test.biblatex':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then show the cache activity
   Then the following library export should match 'export/Bulk performance test.biblatex':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then show the cache activity
   Then export the library to '/tmp/Bulk performance test.stock.biblatex':
    | translator  | id:b6e39b57-8942-4d11-8259-342c46ce395f |
    | benchmark   | true            |

@bwl @noci
Scenario: Major bulk export cache testing
  When I import 15129 references from 'export/Really Big whopping library.ris'
   Then the following library export should match 'export/Really Big whopping library.biblatex':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then show the cache activity
   Then the following library export should match 'export/Really Big whopping library.biblatex':
    | translator  | Better BibLaTeX |
    | benchmark   | true            |
   Then show the cache activity
