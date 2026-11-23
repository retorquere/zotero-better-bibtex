@install
Feature: Install

#  @use.with_legacy=false
#  Scenario: reinstall the bootstrapped XPI
#    When I import 1 reference from "export/*.json"
#    And I disable extension better-bibtex@iris-advies.com
#    And I enable extension better-bibtex@iris-advies.com
#    Then an export using "Better BibLaTeX" should match "export/*.biblatex"
#    When I install extension xpi/zotero-better-bibtex-*.xpi
#    Then an export using "Better BibLaTeX" should match "export/*.biblatex"

  Scenario: Dead object breaks zotero #3590
    When I import 1 reference from "export/*.json"
    And I select the item with a field that contains "combinatorial"
    And I disable extension better-bibtex@iris-advies.com
    Then the disabled monkey-patches work
    When I enable extension better-bibtex@iris-advies.com
    Then the disabled monkey-patches work
