---
aliases:
  - /installation/configuration/advanced
tags:
  - configuration
  - preferences
title: Import
weight: 13
---


{{% preferences/header %}}

## Sentence-case titles on import:

default: `yes, but try to exclude already-sentence-cased titles`

Bib(La)TeX entries must be stored in Title Case; Zotero items are expected to be entered as sentence-case.

With this option on, BBT will try to sentence-case during import. This sentence-casing uses heuristics, no natural language processing is performed, and the results are not perfect.

You can turn this off, but you may then also want to disable `Apply title-casing to titles` (which has its own problems, see the help entry for that option on this page).
With 'yes, but try to exclude already-sentence-cased titles', BBT will attempt to detect titles that are already sentence cased and leave them as-is on import.

Options:

* yes, but try to exclude already-sentence-cased titles
* yes
* no (import titles as-is)


## Insert case-protection for braces:

default: `minimal`

On import, BBT will add case-protection (&lt;span class="nocase"&gt;...&lt;span&gt;) to titles that have words in {Braces}.

There's plenty of bib(la)tex files out there that do this a little overzealously, and you may not like the resulting HTML code in your items, even though this is what the braces mean in bib(la)tex, and Zotero supports it.

If you turn this off, the markup is omitted during import. When you select 'yes', all braces that bib(la)tex would interpret as case protection (which is not all of them) are converted to `span` elements. In `minimal` mode, the number of `span` elements is minimized.

Options:

* minimal
* yes
* no


## When scanning an AUX file, attempt to import entries from the attached bib file when their citation keys are not in Zotero

default: `no`

By default, when scanning for cited items in the aux file, BBT will just generate a note listing all citation keys it cannot find in Zotero.
When this option is turned on, BBT will attempt to import such missing items from the bib file that the AUX file being scanned points to.



