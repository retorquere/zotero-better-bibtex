---
aliases:
  - /installation/configuration/export
tags:
  - automatic export
  - configuration
  - export
  - preferences
title: Export
weight: 11
---


{{% preferences/header %}}

## BibTeX

### Export unicode as plain-text latex commands (recommended)

default: `yes`

BibTeX has really spotty Unicode support, so you generally want this on. It will translate things like accented characters
to their equivalent LaTeX constructs on export.



### Disregard name prefixes when sorting

default: `no`

Name handling is a lot more complex than I had ever thought it to be. A *lot* more complex. BibTeX has really limited ways of dealing with names with particles (van, von, de, etc). If you turn this on, BBT will add code to have `van Gogh` sorted under `Gogh`.



### Export numeric edition as English-written ordinals

default: `no`

Try to convert a numeric edition value to English words during BibTeX exports



### Add URLs to BibTeX export:

default: `no`

Most BibTeX styles do not support DOI/URL fields. Of the styles that do support them, many forget to load the required 'url' package, so make sure to load it yourself. DOI and URL fields are so-called 'verbatim' fields, and without the 'url' package loaded compilation will likely fail.

Options:

* no
* in the 'note' field
* in the 'note' field, but assuming the 'url' package is not loaded
* in the 'url' field
* in the 'url' field, but assuming the 'url' package is not loaded


## BibLaTeX

### Export unicode as plain-text latex commands

default: `no`

BibLaTeX actually has really good Unicode support, so you generally want this off. But for some geezers such as me it is
simply more pleasing to have things like accented characters translated to their equivalent LaTeX constructs on export.



### Use BibLaTeX extended name format (requires biblatex 3.5)

default: `yes`

Use the extended biber 2.7 format for names with particles - only works in BibLaTeX 3.5 or later.
This biblatex has a new (less ambiguous) way to store creator names. It's technically
superior, but the LaTeX world moves slowly, so many people won't have it yet. But if you're an early adopter,
you can enable it here



## Fields

### Export language as

default: `langid`

Export either langid, language or both fields based on the item language (if any).


Options:

* langid
* language
* both


### When an item has both a DOI and a URL, export

default: `both`

Does what it says on the tin, really. If an item has both a DOI and an URL, you can choose to have them both exported, or either one of them. Note that for BibTeX,
you must load the `url` package when you have `doi` or `url` fields. `doi` and `url` fields are so-called `verbatim` fields with different escaping rules, and
BibTeX compilation will likely error out without the package loaded.


Options:

* both
* DOI
* URL


### Fields to omit from export (comma-separated):

default: `<not set>`

If there are some fields you don't want in your bibtex files (such as `note` for example), add a list of them here, separated by comma's.


### Include JabRef-specific metadata:

default: `0`

Export JabRef-specific fields: timestamps, titles for attachments, and groups for each collection an item is part of. Note that having this on will disable caching in exports, which is really undesirable specifically for auto-exports.

Options:

* no
* for JabRef 3
* for JabRef 4
* for JabRef 5


## Quick-Copy

### Quick-Copy/drag-and-drop citations

#### Quick-Copy format

default: `LaTeX citation`

Used for drag-and-drop/quick copy using Better BibTeX citation keys. In the Zotero "Export" pane, choose `Better BibTeX Quick Copy`
as the default export format for quick copy, and choose the desired format for the drag-and-drop citations here.

In the case of Eta templates, the selected items are available as `it.items`. `&lt;%= JSON.stringify(it.items) %&gt;` will show you the available data on the items.


Options:

* LaTeX citation
* Cite Keys
* Pandoc citation
* Org-mode select link
* org-ref citation
* org-ref v3 citation
* RTF Scan marker
* Roam Cite Key
* Atom
* GitBook
* Zotero select link
* Eta template


#### LaTeX command

default: `cite`

Used for drag-and-drop/quick copy citations in `LaTeX` format. Set the desired LaTeX citation command here. If you set this to `citep`,
drag-and-drop citations will yield `\citep{key1,key2,...}`



#### Surround Pandoc citations with brackets

default: `no`

Used for drag-and-drop/quick copy citations in `Pandoc` format. You can use this option to select whether you want
to have these pandoc citations surrounded with brackets or not.



#### Org-mode select link

default: `using Zotero item key`

OrgMode to select items in your library

Options:

* using Zotero item key
* using Better BibTeX citation key


#### Zotero select link

default: `using Zotero item key`

Hyperlink to select items in your library

Options:

* using Zotero item key
* using Better BibTeX citation key


#### Eta template

default: `<not set>`

Used for drag-and-drop/quick copy citations in `Build your own` format. This is going to get pretty technical, sorry.
You can paste a [Eta](https://eta.js.org/) template here. Inside the template, you will find an array `it.items`, each of which is a serialized Zotero item.
To find out what an item looks like inside the template, export some items as BetterBibTeX JSON.



## postscript

## Miscellaneous

### Automatically abbreviate journal title if none is set explicitly

default: `no`

If set, generates journal abbreviations on export using the Zotero journal abbreviator, according to the abbreviation style selected in the list below the checkbox.


### Abbreviation style:

default: `<not set>`

Select the style for auto-abbreviation. Only applicable to Juris-M; in Zotero, the style for automatic
abbreviation is not configurable.



### Include comments about potential problems with the exported entries

default: `no`

Generate quality reports for exported entries. These show up only in BibTeX and BibLaTeX report formats and indicate things like missing required fields and
duplicate citation keys.



### Include automatic tags in export

default: `yes`

Some importers or Zotero extensions (such as the ShortDOI manager for example) create tags on items that are more for item management than that
they are descriptive of the item. When this is off, such tags will not be included in the export.



### When converting to plain-text latex commands:

default: `Minimize the number of switches between math-mode and text-mode`

When a unicode character can be exported as either a math-mode or text-mode command, map to:

* `minimal-packages`: if both a math-mode and a text-mode mapping is available, use the version that does not require extra packages to be loaded.
* `conservative`: if both a math-mode and a text-mode mapping is available, stay in the mode of the previously mapped character if possible. This minimizes the number of generated `$`s in the output.
* `text`: if both a math-mode and a text-mode mapping is available, prefer text.
* `math`: if both a math-mode and a text-mode mapping is available, prefer math.


Options:

* Minimize additional latex packages required
* Minimize the number of switches between math-mode and text-mode
* Prefer text-mode replacements
* Prefer math-mode replacements
* Add braces to accented characters to assist simplistic latex parsers


### Apply title-casing to titles

default: `yes`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress title casing for English items


### Apply case-protection to capitalized words by enclosing them in braces

default: `yes`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress automatic brace-protection for words with uppercase letters.


### Cache

#### Retain export cache across upgrades

default: `no`

By default, BBT clears all caches whenever BBT or Zotero is upgraded. I can't realistically predict whether a change in Zotero or BBT is going to affect the output generated for any given item, so to be sure you always have the latest export-affecting fixes, the caches are discarded when a new version of either is detected. If you have a very large library however, of which you regularly export significant portions, you might want to retain the cached items even if that does come with the risk that you get wrong output on export that has been fixed in the interim.

If you have this on, and you experience any problem that is not the cache getting dropped on upgrade, you *must* clear the cache and reproduce the problem. When you change this setting, as with any setting change, the cache will be dropped.


#### Enable caching for background exports

default: `yes`

Even though BBT exports happen in a separate thread, some
work needs to be done before the background export can
start. Part of this work is preloading the cache. You can
shorten the (blocking) preparation time by turning off
the cache, at the cost of longer export times.



