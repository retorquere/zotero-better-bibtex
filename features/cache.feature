@test-cluster-3
Feature: Cache tests

@keymanager
Scenario Outline: Keymanager cache test
  When I import <references> reference from 'cache/<file>.json'
  Then the library should match 'cache/<file>.library.json'

  Examples:
  | file                                  | references  |
  | Bibtex key generation not unique #199 | 4           |
