Feature: Basics

Scenario: Better BibTeX debug import
  When I import 3 references from 'export/(non-)dropping particle handling #313.json'
  Then the library should have 3 items
