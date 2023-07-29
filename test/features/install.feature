@install
Feature: Install

  @use.with_beta=true
  Scenario: reinstall the bootstrapped XPI
    When I install xpi/zotero-better-bibtex-*.xpi
    And I wait 5 seconds
    And I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
