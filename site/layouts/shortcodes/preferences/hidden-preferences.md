{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### ascii

If you have unicode turned on you can still selectively replace some characters to plain-text commands; any characters entered here will always
be replaced by their LaTeX-command counterparts.

#### autoExportDelay

If you have auto-exports set up, BBT will wait this many seconds before actually kicking off the exports to buffer multiple changes in quick succession
setting off an unreasonable number of auto-exports. Minimum is 1 second. Changes to this preference take effect after restarting Zotero.

#### autoExportIdleWait

Number of seconds to wait after your system goes idle before kicking off auto-exports.

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

#### rawImports

When you set this on, BBT will import bib files leaving any LaTeX commands as-is, and add the #LaTeX tag for raw re-exports.

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

#### workers

BBT can now perform its exports in a separate thread, and should no longer block Zotero's UI pretty much regardless of how large your library is.
While it's been tested and seems to work well, I still consider it to be experimental at this stage. You can turn it off and get the old (blocking) behavior back. Zotero needs
to be restarted for changes to this preference to take effect.


