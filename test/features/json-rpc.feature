@json-rpc
Feature: JSON-RPC API

  Background:
    Given I set the temp directory to "test/tmp"

  @item_regenerate_key
  Scenario: item.regenerate_key is reachable and returns null for an unresolvable citekey
    When I call JSON-RPC method "item.regenerate_key" with params [["does-not-exist-12345"]]
    Then the JSON-RPC response should have no error
    And the JSON-RPC result for "does-not-exist-12345" should be null

  @item_regenerate_key
  Scenario: item.regenerate_key echoes the input citekey when the recomputed key is unchanged
    When I import 1 reference from "json-rpc/regenerate-key.json"
    And I call JSON-RPC method "item.regenerate_key" with params [["Smith2024"]]
    Then the JSON-RPC response should have no error
    And the JSON-RPC result for "Smith2024" should be "Smith2024"
