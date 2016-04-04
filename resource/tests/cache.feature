@test-cluster-3
Feature: Cache tests

Background:
  Given I set preference .citekeyFormat to [auth][year]
  And I set preference .jabrefGroups to false
  And I set preference .defaultDateParserLocale to en-GB

@keymanager
Scenario: Keymanager cache test
  When I import 2 reference with 2 attachments from 'cache/Bibtex key generation not unique #199.json'
  And I select the first item where title = 'Support Request Guidelines - Better BibTeX'
  And I reset the citation keys
  And I select the first item where title = 'retorquere/zotero-better-bibtex'
  And I reset the citation keys
  And I select the first item where title = 'retorquere/zotero-better-bibtex'
  And I set the citation keys
  And I select the first item where title = 'Support Request Guidelines - Better BibTeX'
  And I set the citation keys
  Then the library should match 'cache/Bibtex key generation not unique #199.library.json'
