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

## Insert case-protection for braces:

default: `minimal`

On import, BBT will add case-protection (&lt;span class=&quot;nocase&quot;&gt;...&lt;span&gt;) to titles that have words in {Braces}.

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



