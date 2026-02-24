
---
title: Changelog
weight: 500
---
<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/CHANGELOG.md. EDITS WILL BE OVERWRITTEN -->
## v8.0.26

* fix: read-only groups would error out key migration
* fix: enable re-migration after start

## v8.0.22

* Re-migration option for citation keys
* Skip non-editable items
* Show number of conflicts before migration
* Migration UI wording improvements

## v8.0.20

* dynamic citation keys are back, option in migration
* new the `pinned` function for citation key patterns, which retrieves a pinned citation key from the `extra` field.
* autoPinDelay defaults to on (2 seconds)
* migration uses direct DB read rather than attach/detach, windows too clingy and rename failed

## v8.0.18

Migration improvements:
* prevent accidental locking of BBT database during migration
* Performance: adds a skipNotifier flag when saving migrated items, avoiding triggering of auto-exports

## v8.0.17

* Updated terminology changing "pin" to "fill" for clarity
* Reliable renaming of the legacy database after a successful migration.
* Auto-export storage fixed (would appear to have been deleted after a restart)

## v8.0.16

* Citekey migration skipps the update of the 'Date Modified' field.
* Dependencies, including the zotero-plugin-toolkit and zotero-types, have been updated.

## v8.0.15

* A notification flash has been added to inform users when citation key migration has started.

## v8.0.14

* Internal logic for loading items during migration has been improved.
* Key confict handling removed

## v8.0.13

* Compatibility for Zotero 7.0.32

## v8.0.12

* The minimum required Zotero version was bumped to 7.0.32.
* Plugin testing was expanded to include Zotero 7 specifically.

## v8.0.11

* Dependency versions for libraries like ajv and zotero-plugin were clamped to ensure stability.

## v8.0.10

* Enforcement of the minimum Zotero version 7.0.32 requirement was finalized.

## v8.0.9

* UI phrasing was updated in the migration tool to offer a clearer postponement option ("Do not migrate; ask me again at next start").

## v8.0.8

* A direct link to migration discussions was added to the migration tool to assist users with the transition.

## v8.0.7

* Compatibility status was updated: Zotero 8 and 9 beta are fully supported, while Zotero 7.0.32 is now considered legacy and will not receive ongoing support.
* The migration dialog now includes an explanation that Better BibTeX citation keys are unavailable until the migration to the native field is complete.

## v8.0.6

* The migration dialog text was further refined for better user understanding.

## v8.0.5

* Additional help text was added to the migration UI for users who are unclear about their choices.

## v8.0.4

* The migration tool now reports the total count of native Zotero citation keys already present.
* Migration options were clarified to distinguish between moving all keys versus only pinned keys.

## v8.0.2

* The plugin manifest was updated to reflect the new supported Zotero version ranges.

## v8.0.1

* Handling for legacy imports and configuration modules was improved for better reliability.

## v8.0.0 (Major Release)

**With the advent of Zotero 8, items have a Zotero-native citation key field. This has replaced the BBT citation key field.**

**This has caused a few somewhat disruptive changes:**

* The citation key no longer sits at the top of the item pane. It now sits somewhere in the middle and you may have to scroll to see it. This placement is not under my control
* Zotero will have moved all pinned keys out of the `extra` field into the native field
* The concept of pinning keys is gone; keys are *always* pinned now. Zotero doesn't have a place I can store whether a key is pinned or not.
* The Zotero-native citation keys are stored in another place than the BBT citation keys. If you have no Zotero-native citation keys yet, BBT will silently migrate them to there. If you do have Zotero-native citation keys, and a migration would overwrite them, you will be offered a windows with the choice on how to migrate your citation keys from the BBT storage to the Zotero storage.
* I have enabled auto-pin (what really is auto-fill now) even you had it turned off. You can still turn it back off if you don't want this.

Upside to all of this is that keys will sync.

### Changes

* Zotero 8 Integration: Items now use a native Zotero citation key field, which replaces the legacy BBT citation key field.
* Key Pinning Changes: The concept of pinning is technically gone; because Zotero lacks a specific "pinned" toggle, keys are now always pinned.
* Feature Renaming: The "auto-pin" feature has been effectively renamed to "auto-fill" to align with native Zotero behavior.
* Bug Fixes: Resolved an issue where the originalDate field was not working with citation keys (#3392) and fixed the retrieval of shortjournal abbreviations (#3382).
* Database Migration: The internal database for tracking keys and exports has been migrated to LokiJS.
* Internationalization: Integrated new and updated translations for French, German, Italian, Chinese Simplified, and Brazilian Portuguese.
* Cleanup: The unused Alchemy.js graph editor was removed from the documentation.


