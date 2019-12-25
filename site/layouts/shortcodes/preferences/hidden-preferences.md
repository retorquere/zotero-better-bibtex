{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### ascii

If you have unicode turned on you can still selectively replace some characters to plain-text commands; any characters entered here will always
be replaced by their LaTeX-command counterparts.

#### autoExportDelay

If you have auto-exports set up, BBT will wait this many seconds before actually kicking off the exports to buffer multiple changes in quick succession
setting off an unreasonable number of auto-exports. Minimum is 1 second. Changes to this preference take effect after restarting Zotero.

#### autoExportIdleWait

Number of seconds to wait after your system goes idle before kicking off auto-exports.

#### autoExportPrimeExportCacheBatch

If cache priming is kicked off (see `autoExportPrimeExportCacheThreshold`), the cache will be primed in batches of `autoExportPrimeExportCacheBatch`.
The lower this number is, the longer the priming will take (there's a fixed per-prime overhead), but (since the priming uses exports under the hood)
the larger it is, the longer the priming actions will lock the UI.

#### autoExportPrimeExportCacheDelay

Cache priming (see `autoExportPrimeExportCacheThreshold`), happens in a tight loop, which will still make Zotero sluggish while the priming runs.
By default, BBT will wait a tenths of a second between prime batches; longer waits mean a more responsive Zotero during the priming,
but the priming will take longer to complete.

#### autoExportPrimeExportCacheThreshold

If an auto-export is triggered and there are more than `autoExportPrimeExportCacheThreshold` un-cached entries,
prime the cache before starting the auto-export. This makes the export take longer in total, but since exports
in Zotero lock up the UI, priming helps making the actual export run as fast as possible. Really only
useful for large exports, but what counts as large is system-dependent, so you can play with this value. The
default of `0` disables priming. This is a temporary measure until https://groups.google.com/d/msg/zotero-dev/lHYEtdgPHCE/nDUyxpFmAgAJ
is implemented in Zotero.

#### autoPin

When on, BBT will automatically pin the first citekey it generates for an item.

#### biblatexExtendedDateFormat

Support for EDTF dates in biblatex

#### cacheFlushInterval

How often the Better BibTeX database should be saved to disk. Defaults to once every 5 seconds. Note that
your database is always saved when your computer goes idle, or when you exit Zotero.

#### citeprocNoteCitekey

Replaces the "note" field with the bibtex key during citation rendering in Word/Libreoffice. Main use-case is to help migrating word documents to pandoc.
This setting only takes effect during startup, so if you change it, you will have to restart Zotero to have this take effect (or to disable it.
Please disable it when done). You will want to use a custom CSL style
(such as [this](https://raw.githubusercontent.com/retorquere/zotero-better-bibtex/master/better-bibtex-citekeys.csl)) to make this work.

#### client

#### csquotes

if you set `csquotes` to a string of character pairs, each pair will be assumed to be the open and close parts of a pair and
will be replaced with a `\\enquote{...}` construct.

#### debugLogDir

#### git

Can be `off`, `config` or `always`

#### ignorePostscriptErrors

#### itemObserverDelay

I've had reports where Zotero notifies extensions that references have changed, but if BBT then actually
retrieves those same references, Zotero complains they "haven't been saved yet". Super. This preference sets
the number of microseconds BBT should wait after being notified before acting on the changed references.

#### kuroshiro

When on, BBT will load kuroshiro for romajization in citekeys. This uses a lot of memory, easily 100MB. If you don't have Japanese titles/names, keep this off.

#### mapMath

Any characters entered here will prefer a math-mode LaTeX-command counterpart over a math-mode,
if a math-mode command is available. Only useful when `mapUnicode` is `conservative`.

#### mapText

Any characters entered here will prefer a text-mode LaTeX-command counterpart over a math-mode, if a text-mode command is available.
Only useful when `mapUnicode` is `conservative`. Characters specified in `mapMath` take presedence over characters specified in `mapText`.

#### mapUnicode

When a unicode character can be exported as either a math-mode or text-mode command, map to:

* `conservative`: if both a math-mode and a text-mode mapping is available, stay in the mode of the previously mapped
   character if possible. This minimizes the number of generated `$`s in the output.
* `text`: if both a math-mode and a text-mode mapping is available, prefer text.
* `math`: if both a math-mode and a text-mode mapping is available, prefer math.

#### newTranslatorsAskRestart

New translators installed in Zotero are not immediately usuable for drag-and-drop. If you want to use BBT for drag-and-drop
(e.g. to drag and drop citekeys or citations), you will be asked whether you want to restart after installation,
or whether you want to reinstall when it is more convenient to you. You will be asked this whenever the BBT translators update,
but you can disable this by checking "Do not ask again" in that dialog.

#### parseParticles

Name particle handling. Only turn on when requested and we're talking about it on github.

#### platform

#### rawLaTag

When an item has this tag, all its fields will be assumed to hold raw LaTeX and will undergo no further transformation.
If you set this to `*`, all items will be assumed to have raw LaTeX.

#### relativeFilePaths

When exporting a Bib(La)TeX file, if the attachments are stored anywhere under the directory the bibliography is exported to, use relative paths
to those attachments. Caching is disabled when this option is on, so it affects performance.

#### removeStock

#### scrubDatabase

#### skipWords

list of words to skip in title when generating citation keys

#### testing

#### verbatimFields

list of fields to treat as verbatim during import. If you're importing e.g. Mendeley-generated BibTeX, try removing `file` from this list before import.

#### exportBraceProtection

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, set this preference to `true` to suppress [automatic brace-protection for words with uppercase letters]({{ ref . "support/faq#why-the-double-braces" }}).

#### exportTitleCase

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, set this preference to `true` to suppress [title casing for English references]({{ ref . "support/faq#bbt-is-changing-the-capitalization-of-my-titles-why" }}).


