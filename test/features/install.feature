@install
Feature: Install

  @use.with_install=true
  Scenario: reinstall the bootstrapped XPI
    When I install xpi/zotero-better-bibtex-*.xpi
    And I import 1 reference from "export/*.json"
    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
