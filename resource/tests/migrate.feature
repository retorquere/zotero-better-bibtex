Feature: Key migration

@keymigration
Scenario: Key match test
  When I import 2 reference attachments from 'export/key migration.json'
  Then a library export using 'Better BibLaTeX' should match 'export/key migration.bib'
