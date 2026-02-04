@merge
Feature: Merge

  Background:
    Given I set preference .extraMergeCSL to true
    And I set preference .extraMergeCitekeys to true
    And I set preference .extraMergeTeX to true
    And I set preference .autoPinDelay to 1
    And I set preference .autoPinOverwrite to true

  @1221 @retries=10
  Scenario: Set IDS field when merging references with different citation keys #1221
    When I import 2 references from "merge/*.json"
    And I select the item with a field that contains "Differentially closed fields"
    And I select the item with a field that contains "Errata to: First order theory of permutation groups"
    And I merge the selected items
    Then an export using "Better BibLaTeX" should match "merge/*.biblatex"

  @1373 @retries=10
  Scenario: Merging error with arXiv ID #1373
    When I import 2 references from "merge/*.json"
    And I select the item with a field that contains "It was twenty years ago today ..."
    And I select the item with a field that contains "It was twenty-one years ago today ..."
    And I merge the selected items
    Then the library should match "merge/*-merged.json"

  @1384 @retries=10
  Scenario: Duplicate Citation Key Alias #1384
    When I import 2 references from "merge/*.json"
    And I select the item with a field that is "Troja2017a"
    And I select the item with a field that is "Troja2017"
    And I merge the selected items
    Then the library should match "merge/*-merged.json"
    When I refresh all citation keys
    Then the library should match "merge/*-refreshed.json"

  @retries=5
  Scenario: ids field should be created in raw mode #1729
    When I import 2 references from "merge/*.json"
    And I select the item with a field that is "bardosOnsagerConjectureBounded2019"
    And I select the item with a field that is "Titi_Gwiazda_conservation_entropy"
    And I merge the selected items
    Then the library should match "merge/*-merged.json"

  @retries=5
  Scenario: Identical Pinned keys lost when merging duplicated records #1721
    When I import 2 references from "merge/*.json"
    And I select 2 items with a field that is "Coimbra:2013qq"
    And I merge the selected items
    Then the library should match "merge/*-merged.json"
