{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
### Citation keys

#### Citation key format

default: `​[auth:lower][shorttitle3_3][year]`

Set the pattern used to generate citation keys. The format of the keys is documented [here]({{ ref . "citing" }}).

#### Force citation key to plain text

default: `yes`

If you have deviated from the default citation key format pattern by [specifying your own]({{ ref . "citing" }}), you may
wind up with non-ASCII characters in your citation keys. You can prevent that using the `fold` function at the
appropriate place in your pattern, but checking this checkbox will just apply `fold` to all your keys.

### Keeping citation keys unique

#### Keep keys unique

default: `within each library`

Auto-generated (non-pinned) keys automatically get a postfix when they would generate a duplicate. By default, the check for duplicates is restricted
to the library/group the item lives in. When set to global, the check will include all libraries/groups, so auto-generated keys would be globally
unique. Changing this setting *does not* affect existign keys - for this you would need to select the items and refresh the keys.

Options:

* across all libraries
* within each library

#### On conflict with a pinned key, non-pinned keys will be

default: `kept (causes key duplicates)`

This determines what happens if you pin a key to a value that is already in use in a different reference but not pinned there.
Neither are ideal, you just get to pick your poison. If you let BBT change the non-pinned key by adding a postfix character,
the citation key changes which could be problematic for existing papers. If you keep the non-pinned key as-is, your library now has duplicate keys.

Options:

* postfixed (causes key changes)
* kept (causes key duplicates)

### Quick copy/drag-and-drop citations

#### QuickCopy format

default: `LaTeX`

Used for drag-and-drop/quick copy using Better BibTeX citekeys. In the Zotero "Export" pane, choose `Better BibTeX Quick Copy`
as the default export format for quick copy, and choose the desired format for the drag-and-drop citations here.

Options:

* LaTeX
* Cite Keys
* Pandoc
* Org-mode citekey select link
* Org-mode Zotero select link
* org-ref
* RTF Scan
* Roam Cite Key
* Atom (https://atom.io/packages/zotero-citations)
* GitBook
* Citekey select link
* Zotero select link

#### LaTeX command

default: `cite`

Used for drag-and-drop/quick copy citations in `LaTeX` format. Set the desired LaTeX citation command here. If you set this to `citep`,
drag-and-drop citations will yield `\citep{key1,key2,...}`

#### Surround Pandoc citations with brackets

default: `no`

Used for drag-and-drop/quick copy citations in `Pandoc` format. You can use this option to select whether you want
to have these pandoc citations surrounded with brackets or not.

### BibTeX AUX scanner

#### When scanning an AUX file, attempt to import references from the attached bib file when their citation keys are not in Zotero

default: `no`

By default, when scanning for cited items in the aux file, BBT will just generate a note listing all citation keys it cannot find in Zotero.
When this option is turned on, BBT will attempt to import such missing items from the bib file that the AUX file being scanned points to.


