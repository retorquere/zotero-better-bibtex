@export
Feature: Export

Background:
  Given I set preference .autoExportPrimeExportCacheThreshold to 10

#@1221
#Scenario: Set IDS field when merging references with different citation keys #1221
#  When I import 2 references from "export/*.json"
#  And I select the first item where title = "Differentially closed fields"
#  And I select the first item where title = "Errata to: First order theory of permutation groups"
#  And I merge the selected items
#  Then an export using "Better BibLaTeX" should match "export/*.biblatex"

