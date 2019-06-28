---
aliases:
- /installation/configuration/export
tags:
- automatic export
- configuration
- export
- preferences
title: Export
weight: 13
---

{{/* DO NOT EDIT. This page is created automatically from Preferences.xul */}}
#### Export unicode as plain-text latex commands (recommended)

default: `yes`

BibTeX has really spotty Unicode support, so you generally want this on. It will translate things like accented characters to their equivalent LaTeX constructs on export.

#### Disregard name prefixes when sorting

default: `no`

Name handling is a lot more complex than I had ever thought it to be. A *lot* more complex. BibTeX has
really limited ways of dealing with names with particles (van, von, de, etc). If you turn this on, BBT
will add code to have `van Gogh` sorted under `Gogh`.

#### Add URLs to BibTeX export

default: `no`

BibLaTeX supports urls in your references natively; BibTeX does not. For this reason, URLs are
omitted from BibTeX exports by default. Using this setting you can have them added to your exports either in a `note`
field (not as clean, but compatible with BibTeX out of the box), or in a `url` field (requires extra packages to be loaded,
or bibtex will error out).

Options:

* no
* in a note field
* in a URL field (requires custom style for url field support)

#### Export unicode as plain-text latex commands

default: `no`

BibLaTeX actually has really good Unicode support, so you generally want this off. But for some geezers such as me it is
simply more pleasing to have things like accented characters translated to their equivalent LaTeX constructs on export.

#### Use BibLaTeX extended name format (requires biblatex 3.5)

default: `no`

Use the extended biber 2.7 format for names with particles - only works in BibLaTeX 3.5 or later.
This biblatex has a new (less ambiguous) way to store creator names. It's technically
superior, but the LaTeX world moves slowly, so many people won't have it yet. But if you're an early adopter,
you can enable it here

#### When a reference has both a DOI and a URL, export

default: `both`

Does what it says on the tin, really. If a reference has both a DOI and an URL, you can choose to have them both exported, or either one of them.

Options:

* both
* DOI
* URL

#### Fields to omit from export (comma-separated)

default: `<not set>`

If there are some fields you don't want in your bibtex files (such as `note` for example), add a list of them here, separated by comma's.

#### Include JabRef-specific metadata

default: `no`

Export JabRef-specific information fields; timetamps and groups for collections. Note that format "4" will disable caching in exports, which is really undesirable specifically for auto-exports.

Options:

* no
* for JabRef 3
* for JabRef 4

#### Include comments about potential problems with the references

default: `no`

Generate quality reports for exported references.

#### Automatically abbreviate journal title if none is set explicitly

default: `no`

If set, generates journal abbreviations on export using the Zotero journal abbreviator, according to the abbreviation style selected in the list below the checkbox.

#### Abbreviation style

default: `<not set>`

Select the style for auto-abbreviation. Only applicable to Juris-M; in Zotero, the style for automatic
abbreviation is not configurable.

#### Automatic export

default: `On Change`

Determines when [automatic exports]({{< ref "exporting" >}}) are kicked off. Having it disabled still marks
auto-exports as needing updates, so when you re-enable it, those exports will start. On-change means exports
happen whenever a reference in the export changes/is added/is removed. On idle does more or less what
`Disabled` (that is, no exports but mark as needing changes), but will kick off exports when your computer is
idle. You mostly want this if your computer is performance-constrained (aka slow).

Options:

* Disabled
* On Change
* When Idle