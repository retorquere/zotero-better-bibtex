Feature: Key migration

Background:
  When I set preference .jabrefGroups to false
  And I set preference .defaultDateParserLocale to en-GB


@keymigration
Scenario: Key match test
  When I import 2 reference from 'export/key migration.json'
  Then a library export using 'Better BibLaTeX' should match 'export/key migration.biblatex'
