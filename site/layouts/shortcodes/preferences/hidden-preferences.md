{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### ascii

default: `<not set>`

If you have unicode turned on you can still selectively replace some characters to plain-text commands; any characters entered here will always be replaced by their LaTeX-command counterparts.

#### autoExportDelay

default: `1`

If you have auto-exports set up, BBT will wait this many seconds before actually kicking off the exports to buffer multiple changes in quick succession setting off an unreasonable number of auto-exports. Minimum is 1 second. Changes to this preference take effect after restarting Zotero.

#### autoExportIdleWait

default: `10`

Number of seconds to wait after your system goes idle before kicking off auto-exports.

#### autoExportPrimeExportCacheBatch

default: `4`

If cache priming is kicked off (see `autoExportPrimeExportCacheThreshold`), the cache will be primed in batches of `autoExportPrimeExportCacheBatch`. The lower this number is, the longer the priming will take (there's a fixed per-prime overhead), but (since the priming uses exports under the hood) the larger it is, the longer the priming actions will lock the UI.

#### autoExportPrimeExportCacheDelay

default: `100`

Cache priming (see `autoExportPrimeExportCacheThreshold`), happens in a tight loop, which will still make Zotero sluggish while the priming runs. By default, BBT will wait a tenths of a second between prime batches;- longer waits mean a more responsive Zotero during the priming, but the priming will take longer to complete.

#### autoExportPrimeExportCacheThreshold

default: `0`

If an auto-export is triggered and there are more than `autoExportPrimeExportCacheThreshold` un-cached entries, prime the cache before starting the auto-export. This makes the export take longer in total, but since exports in Zotero lock up the UI, priming helps making the actual export run as fast as possible. Really only useful for large exports, but what counts as large is system-dependent, so you can play with this value. The default of `0` disables priming. This is a temporary measure until https://groups.google.com/d/msg/zotero-dev/lHYEtdgPHCE/nDUyxpFmAgAJ is implemented in Zotero.

#### autoPin

default: `no`

When on, BBT will automatically pin the first citekey it generates for an item.

#### biblatexExtendedDateFormat

default: `yes`

Support for EDTF dates in biblatex

#### cacheFlushInterval

default: `5`

How often the Better BibTeX database should be saved to disk. Defaults to once every 5 seconds. Note that
your database is always saved when your computer goes idle, or when you exit Zotero.

#### citeprocNoteCitekey

default: `no`

Replaces the "note" field with the bibtex key during citation rendering in Word/Libreoffice. Main use-case is to help migrating word documents to pandoc.
This setting only takes effect during startup, so if you change it, you will have to restart Zotero to have this take effect (or to disable it. Please disable it when done). You will want to use a custom CSL style (such as [this](https://raw.githubusercontent.com/retorquere/zotero-better-bibtex/master/better-bibtex-citekeys.csl)) to make this work.

#### csquotes

default: `<not set>`

if you set `csquotes` to a string of character pairs, each pair will be assumed to be the open and close parts of a pair and will be replaced with a `\\enquote{...}` construct.

#### git

default: `config`

Can be 'off', 'config' or 'always'

#### itemObserverDelay

default: `100`

I've had reports where Zotero notifies extensions that references have changed, but if BBT then actually
retrieves those same references, Zotero complains they "haven't been saved yet". Super. This preference sets
the number of microseconds BBT should wait after being notified before acting on the changed references.

#### kuroshiro

default: `no`

When on, BBT will load kuroshiro for romajization in citekeys. This uses a lot of memory, easily 100MB. If you don't have Japanese titles/names, keep this off.

#### lockedInit

default: `no`

BBT locks the UI during startup because I have been told in
no uncertain terms I am not to touch the Zotero database
before I get an all-clear from Zotero. This all-clear takes a fair amount of time. As BBT needs database
access for generating keys, and *everything* in BBT depends on the keys being present, it is absolutely safest
to make sure BBT initialization has completed before freeing the UI. I want to stress that during most of the
lock-time, BBT is simply waiting for Zotero to complete its own initialization; try to do an export of any
kind (not just BBT) or to import new references directly after Zotero has started and you'll notice that it
may take a while before Zotero reacts. The lockout just puts a face on this hidden init, and prevents nasty
race conditions between the BBT and Zotero initialization leading to unpredictable breakage occasionally.

By default you only get a flaoting popup to tell you how far along this process Zotero is; if you really want to see how long BBT has to wait before it can do anything, you can
enable the lockout during startup, but it seems fairly safe now if you're patient enough to wait until the floating window goes away. There is absolutely nothing I can do about the long
time it takes before BBT moves from "Waiting for Zotero". After that, initialization is very quick.

#### mapMath

default: `<not set>`

Any characters entered here will prefer a math-mode LaTeX-command counterpart over a math-mode, if a math-mode command is available. Only useful when `mapUnicode` is `conservative`.

#### mapText

default: `<not set>`

Any characters entered here will prefer a text-mode LaTeX-command counterpart over a math-mode, if a text-mode command is available. Only useful when `mapUnicode` is `conservative`. Characters specified in `mapMath` take presedence over characters specified in `mapText`.

#### mapUnicode

default: `conservative`

When a unicode character can be exported as either a math-mode or text-mode command, map to:

* `conservative`: if both a math-mode and a text-mode mapping is available, stay in the mode of the previously mapped character if possible. This minimizes the number of generated `$`s in the output.
* `text`: if both a math-mode and a text-mode mapping is available, prefer text.
* `math`: if both a math-mode and a text-mode mapping is available, prefer math.

#### parseParticles

default: `yes`

Name particle handling. Only turn on when requested and we're talking about it on github.

#### rawLaTag

default: `#LaTeX`

When an item has this tag, all its fields will be assumed to hold raw LaTeX and will undergo no further transformation. If you set this to `*`, all items will be assumed to have raw LaTeX.

#### relativeFilePaths

default: `no`

When exporting a Bib(La)TeX file, if the attachments are stored anywhere under the directory the bibliography is exported to, use relative paths to those attachments. Caching is disabled when this option is on, so it affects performance.

#### scrubDatabase

default: `no`

Finds potential problems in the database and fixes those. This runs **extremely** slow at startup, don't enable this unless explicitly asked to.

#### skipWords

default: `a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum`

list of words to skip in title when generating citation keys

#### suppressBraceProtection

default: `no`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, set this preference to "true" to suppress [automatic brace-protection for words with uppercase letters]({{ ref . "support/faq#why-the-double-braces" }}).

#### suppressTitleCase

default: `no`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, set this preference to "true" to suppress [title casing for English references]({{ ref . "support/faq#bbt-is-changing-the-capitalization-of-my-titles-why" }}).


