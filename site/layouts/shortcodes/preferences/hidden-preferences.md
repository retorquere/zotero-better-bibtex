{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
### ascii

default: `<not set>`

If you have unicode turned on you can still selectively replace some characters to plain-text commands; any characters entered here will always
be replaced by their LaTeX-command counterparts.

### autoExportDelay

default: `1`

If you have auto-exports set up, BBT will wait this many seconds before actually kicking off the exports to buffer multiple changes in quick succession
setting off an unreasonable number of auto-exports. Minimum is 1 second. Changes to this preference take effect after restarting Zotero.

### autoExportIdleWait

default: `10`

Number of seconds to wait after your system goes idle before kicking off auto-exports.

### autoPinDelay

default: `0`

When > 0, BBT will automatically pin the first citekey it generates for an item this many seconds.

### biblatexExtendedDateFormat

default: `yes`

Support for EDTF dates in biblatex

### cacheFlushInterval

default: `5`

How often the Better BibTeX database should be saved to disk. Defaults to once every 5 seconds. Note that
your database is always saved when your computer goes idle, or when you exit Zotero.

### citeprocNoteCitekey

default: `no`

Replaces the "note" field with the bibtex key during citation rendering in Word/Libreoffice. Main use-case is to help migrating word documents to pandoc.
This setting only takes effect during startup, so if you change it, you will have to restart Zotero to have this take effect (or to disable it.
Please disable it when done). You will want to use a custom CSL style
(such as [this](https://raw.githubusercontent.com/retorquere/zotero-better-bibtex/master/better-bibtex-citekeys.csl)) to make this work.

### csquotes

default: `<not set>`

if you set `csquotes` to a string of character pairs, each pair will be assumed to be the open and close parts of a pair and
will be replaced with a `\\enquote{...}` construct.

### git

default: `config`

Can be `off`, `config` or `always`

### import

default: `yes`

Use BBTs importer instead of Zotero's importer

### importCitationKey

default: `yes`

On import, assign the existing citation key to the item being imported

### importExtra

default: `yes`

On import, place all bib(la)tex field Zotero doesn't have an existing field for in the Zotero `extra` field of the item

### itemObserverDelay

default: `5`

I've had reports where Zotero notifies extensions that references have changed, but if BBT then actually
retrieves those same references, Zotero complains they "haven't been saved yet". Super. This preference sets
the number of microseconds BBT should wait after being notified before acting on the changed references.

### kuroshiro

default: `no`

When on, BBT will load kuroshiro for romajization in citekeys. This uses a lot of memory, easily 100MB. If you don't have Japanese titles/names, keep this off.

### mapMath

default: `<not set>`

Any characters entered here will prefer a math-mode LaTeX-command counterpart over a math-mode,
if a math-mode command is available. Only useful when `mapUnicode` is `conservative`.

### mapText

default: `<not set>`

Any characters entered here will prefer a text-mode LaTeX-command counterpart over a math-mode, if a text-mode command is available.
Only useful when `mapUnicode` is `conservative`. Characters specified in `mapMath` take presedence over characters specified in `mapText`.

### newTranslatorsAskRestart

default: `yes`

New translators installed in Zotero are not immediately usuable for drag-and-drop. If you want to use BBT for drag-and-drop
(e.g. to drag and drop citekeys or citations), you will be asked whether you want to restart after installation,
or whether you want to reinstall when it is more convenient to you. You will be asked this whenever the BBT translators update,
but you can disable this by checking "Do not ask again" in that dialog.

### parseParticles

default: `yes`

Name particle handling. Only turn on when requested and we're talking about it on github.

### postscriptOverride

default: `<not set>`

You can use a custom postscript per export directory:

1. Edit the hidden preference `postscriptOverride`, and set it to a filename like `postscript.js`
2. In the directory where you intend to export to, create a file called `postscript.js` (or whatever you set the preference to) and add the postscript you want there
3. Export to that directory.

A postscript override will disable caching for that export.

### rawImports

default: `no`

When you set this on, BBT will import bib files leaving any LaTeX commands as-is, and add the #LaTeX tag for raw re-exports.

### rawLaTag

default: `#LaTeX`

When an item has this tag, all its fields will be assumed to hold raw LaTeX and will undergo no further transformation.
If you set this to `*`, all items will be assumed to have raw LaTeX.

### relativeFilePaths

default: `no`

When exporting a Bib(La)TeX file, if the attachments are stored anywhere under the directory the bibliography is exported to, use relative paths
to those attachments. Caching is disabled when this option is on, so it affects performance.

### skipWords

default: `a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum`

list of words to skip in title when generating citation keys

### tagCorrectedTitleCase

default: `#sentence-cased`

When an item is added that looks to have a Title-Cased title, and correct-on-add is on, the item will be tagged with this tag so you can more easily find them to review the results. Please do review the changed made; the sentence-casing algorithm is fairly naive.

### verbatimFields

default: `url,doi,file,eprint,verba,verbb,verbc`

list of fields to treat as verbatim during import. If you're importing e.g. Mendeley-generated BibTeX, try removing `file` from this list before import.


