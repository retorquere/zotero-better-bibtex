---
aliases:
  - /installation/configuration/hidden-preferences
tags:
  - configuration
  - preferences
title: Hidden preferences
weight: 15
---


{{% preferences/header %}}


You can edit most Better BibTeX preferences through the Preferences window in Zotero. However, Better BibTeX supports additional hidden preferences. These settings are intended for more advanced use.

## Zotero

To view the full list of Better BibTeX's preferences, including many hidden preferences, go to the Advanced pane of the Zotero preferences and click “Config Editor”. Enter “better-bibtex” into the Filter field at the top of the list that comes up. Preferences that can be safely changed by users are described below.

The Better BibTeX hidden preferences are preceded by “extensions.zotero.translators.better-bibtex.”

## ascii

default: `<not set>`

If you have unicode turned on you can still selectively replace some characters to plain-text commands; any characters entered here will always
be replaced by their LaTeX-command counterparts.

## autoAbbrevStyle

default: `<not set>`

Select the style for auto-abbreviation. Only applicable to Juris-M; in Zotero, the style for automatic
abbreviation is not configurable.

## autoExportIdleWait

default: `10`

Number of seconds to wait after your system goes idle before kicking off auto-exports.
## biblatexExtendedDateFormat

default: `yes`

Support for EDTF dates in biblatex
## charmap

default: `<not set>`

a JSON mapping from single character to raw LaTeX, to augment the default mapping; these will be applied when you export as ASCII. **DO NOT** edit this preferencedirectly,
but create a CSV (not semicolons) file named `charmap.csv` in the zotero data directory under the `better-bibtex` folder with columns `unicode` (the source character),
`text` (representation in LaTeX text mode, if any) and `math` (representation in LaTeX math mode, if any, without dollar signs).
## csquotes

default: `<not set>`

if you set `csquotes` to a string of character pairs, each pair will be assumed to be the open and close parts of a pair and
will be replaced with a `\\enquote{...}` construct.

## git

default: `config`

Can be `off`, `config` or `always`
## import

default: `yes`

Use BBTs importer instead of Zotero's importer
## importCitationKey

default: `yes`

On import, assign the existing citation key to the item being imported
## importDetectURLs

default: `yes`

On import, detect URLs in non-standard bib(la)tex fields and import them as attachments
## importExtra

default: `yes`

On import, place all bib(la)tex field Zotero doesn't have an existing field for in the Zotero `extra` field of the item
## importJabRefAbbreviations

default: `yes`

Expand journal abbreviations to the full journal name on import.

## importJabRefStrings

default: `yes`

During import, replace titles matching a list of common @string definitions with the value of that @string

## importNoteToExtra

default: `<not set>`

On import, import note-like fields in this comma-separated list to the `extra` field, unless the note has rich text.
## importSentenceCaseQuoted

default: `yes`

During import, also sentence-case quoted parts of titles

## importUnknownTexCommand

default: `ignore`

What to do when encountering a TeX command the parser does not know about. Please only use values:

* `ignore`: ignore the command entirely
* `tex`: import and mark as TeX code, so on re-export it will be output as-is
* `text`: import without marking it as TeX code, so on re-export it will be treated as regular text

## itemObserverDelay

default: `5`

I've had reports where Zotero notifies extensions that items have changed, but if BBT then actually
retrieves those same items, Zotero complains they "haven't been saved yet". Super. This preference sets
the number of microseconds BBT should wait after being notified before acting on the changed items.

## mapMath

default: `<not set>`

Any characters entered here will prefer a math-mode LaTeX-command counterpart over a text-mode mapping, if a math-mode command is available.

## mapText

default: `<not set>`

Any characters entered here will prefer a text-mode LaTeX-command counterpart over a math-mode, if a text-mode command is available.

## packages

default: `<not set>`

Some LaTeX commands only work when certain packages are loaded. By default, BBT will export Bib(La)TeX that requires no extra packages, but
you can provide a comma-separated list here of packages to load to get higher fidelity export (for some admittedly niche characters).
Details of these packages and what they add can be found [here]({{ ref . "exporting/unicode.md" }}).

## parseParticles

default: `yes`

Name particle handling. Only turn on when requested and we're talking about it on github.
## patchDates

default: `dateadded=dateAdded, date-added=dateAdded, datemodified=dateModified, date-modified=dateModified`

Import translators cannot set the date-added and date-modified of the items that are imported, they always get the current time as their date-added. BBT will leave fields it can't map as
`tex.[field]` in the `extra` field of the item. If you enter a list of comma-separated field mappings here, like `date-added = dateAdded, timestamp=dateModified`, BBT will offer a menu option
to remove them from the `extra` field and set the corresponding date of the item to their values, assuming they can be parsed as simple dates (no circa and stuff).

## postscript

default: `<not set>`

Snippet of javascript to run [after each entry generation]({{ ref . "exporting/scripting.md" }}).
## postscriptOverride

default: `<not set>`

You can use a custom postscript per export directory:

1. Edit the hidden preference `postscriptOverride`, and set it to a filename like `postscript.js`
2. In the directory where you intend to export to, create a file called `postscript.js` (or whatever you set the preference to) and add the postscript you want there
3. Export to that directory.

A postscript override will disable caching for that export.

## preferencesOverride

default: `<not set>`

You can use custom preferences per export directory:

1. Edit the hidden preference `preferencesOverride`, and set it to a filename like `preferences.json`
2. In the directory where you intend to export to, create a file called `preferences.json` (or whatever you set the preference to), or called `[bibfile you are exporting to].json` and add the desired preference overrides in the format `{"override": { "preferences": {"skipFields": "note"} } }`. You can get your current preferences by exporting to `BetterBibTeX JSON` and removing everything except config.`preferences`, and renaming `config` to `override`.
3. Export to that directory.

A preferences override will disable caching for that export.

## rawImports

default: `no`

When you set this on, BBT will import bib files leaving any LaTeX commands as-is, and add the #LaTeX tag for raw re-exports.
## rawLaTag

default: `#LaTeX`

When an item has this tag, all its fields will be assumed to hold raw LaTeX and will undergo no further transformation.
If you set this to `*`, all items will be assumed to have raw LaTeX.

## relativeFilePaths

default: `no`

When exporting a Bib(La)TeX file, if the attachments are stored anywhere under the directory the bibliography is exported to, use relative paths
to those attachments. Caching is disabled when this option is on, so it affects performance.

## separatorList

default: `and`

Separator between list elements in list-type fields. You will need to add `--listsep='|'` to your biber calls.
## separatorNames

default: `and`

Separator between author names. You will need to add `--namesep='|'` to your biber calls.

## skipWords

default: `a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum`

list of words to skip in title when generating citation keys
## startupProgress

default: `popup`

Zotero takes a few seconds to start up, which is sometimes mistakenly attributed to BBT. BBT will tell you what phase the startup process is in (of Zotero and BBT) to
prevent support requests for something that I cannot change. Please only use values:

* `popup`: show a popup during startup
* `progressbar`: show a progressbar in the top of the frame
## strings

default: `<not set>`

If you have externally maintained `@string` vars paste them here and they will be resolved for subsequent imports. These should be entered as `@string` declarations, such as `@string{IEEE_J_PWRE = "{IEEE} Transactions on Power Electronics"}`, not just the var name.
## stringsOverride

default: `<not set>`

You can use a custom @string list per export directory:

1. Edit the hidden preference `stringstOverride`, and set it to a filename like `strings.bib`
2. In the directory where you intend to export to, create a file called `strings.bib` (or whatever you set the preference to) and add the @string declarations you want there
3. Export to that directory.

A strings override will disable caching for that export.

## verbatimFields

default: `url,doi,file,pdf,ids,eprint,/^verb[a-z]$/,groups,/^citeulike-linkout-[0-9]+$/, /^bdsk-url-[0-9]+$/, keywords`

list of fields to treat as verbatim during import. If you're importing e.g. Mendeley-generated BibTeX, which is out of spec in various ways, try removing `file` from this list before import.
## warnTitleCased

default: `no`

Both Zotero and BBT expect titles to be in sentence-case, but a lot of sites offer import data that is Title Cased. When exporting these titles to bib(la)tex you're going
to get a lot of extra unwanted braces, because all these Title Cased words will look like proper nouns to BBTs own title-casing mechanism. When this setting is on, you will be warned
when you import/save items in Zotero with titles that look like they're Title Cased, so that you can inspect/correct them.

