---
title: Configuration
---

The configuration of Better BibTeX is a little baroque compared to the standard Zotero Bib(La)TeX exporters (which only
have hidden preferences). The defaults should just work, but here's an attempt to describe what they do.

**Making any change here will drop your entire export cache.** This is usually not a problem unless you have a really large
library, but you can read about what is involved [here](performance.html).

# Citation

### Citation command
<!-- extensions.zotero.translators.better-bibtex.citeCommand -->

Used for drag-and-drop citations. In the Zotero "Export" pane, choose, "LaTeX Citation" as the default export format for
quick copy, then set the desired LaTeX citation command here. If you set this to `citep`, drag-and-drop citations will
yield `\citep{key1,key2,...}`

### Citation key format
<!-- extensions.zotero.translators.better-bibtex.citekeyFormat -->

Set the pattern used to generate citation keys. The format of the keys is documented [here](citation-keys.html).

### Force citation key to ASCII
<!-- extensions.zotero.translators.better-bibtex.citekeyFold -->

If you have deviated from the default citation key format pattern by [specifycing your own](citation-keys.html), you may
wind up with non-ASCII characters in your citation keys. You can prevent that using the `fold` function at the
appropriate place in your pattern, but checking this checkbox will just apply `fold` to all your keys.

### Add URLs to BibTeX export
<!-- extensions.zotero.translators.better-bibtex.bibtexURLs -->

BibLaTeX supports urls in your references natively; BibTeX does not. For this reason, URLs are omitted from BibTeX
exports by default. Using this setting you can have them added to your exports either in a note field (not as clean, but
compatible with BibTeX out of the box), or in an `url` field (requires extra packages to be loaded, or bibtex will error
out).

### Auto-pin citation keys
<!-- extensions.zotero.translators.better-bibtex.pinCitekeys -->

By default, Better BibTeX assigns dynamic keys to your references; if your reference changes, your citation key will
also likely change (depending on which fields you changed). If you don't want this, you can "pin" the citation key; if
you have `bibtex: <something>` in the `extra` field of your reference, `<something>` will be used as the citation key
regardless of what your reference says.

You can have Better BibTeX do this pinning for you automatically. This behavior is off by default, but you can have it
automatically pin the key after the first change to the reference (this generally means at reference creation), or at
export (and auto-exports count as exports). This is mainly useful to do if you share your library, to make sure you and
your co-authors have the same keys, or if you work from multiple workstations. Please note that "on change" does not
mean that the reference will be re-pinned on change. Once pinned, no more changes are made to your keys by Better BibTeX
itself.

**Note**: This option requires webdav/zotero sync to be off, or automatic. If you don't sync your references/attachments,
it's considered off. If you have syncing set up but not on automatic, this option will be greyed out. Each pinned key
change (or clearing of a pinned key) means a change to the reference, and that means the item will be synced if you have
that set up. Bulk key changes causing bulk reference changes (which can easily happen if you have on-export and you
export your full library) could overwhelm the Zotero sync service if presented all at once; automatic syncing
ameliorates that problem. Not doing this would risk sync being permanently impossible, as the Zotero server will
kick you out if a sync takes too long.

### Key conflict policy ("On conflict, non-pinned key should be...")
<!-- extensions.zotero.translators.better-bibtex.keyConflictPolicy -->

This determines what happens if you pin a key to a value that is already in use in a different reference but not pinned
there. The options are:

* Change the non-pinned key by adding a postfix character. This means the citation key changes which could be
  problematic for existing papers.
* Keep the non-pinned key as-is. This means your library now has duplicate keys.

Pick your poison.

### Show citekey in reference list
<!-- extensions.zotero.translators.better-bibtex.showCitekeys -->

If you enable this, the `extra` column in the Zotero reference list (if you have selected it to be shown) will display
the citation key instead of the extra field.

### Move name-particles (de, von, ...) to the family name
<!-- extensions.zotero.translators.better-bibtex.parseParticles -->

Name handling is a lot more complex than I had ever thought it to be. A *lot* more complex. This setting determines how
two-part names (that is, names specified in separate `last name` and `first name` fields) are handled. When enabled,
`Gogh`, `Rembrandt van` will be exported (roughly) to `author = {van Gogh, Rembrandt}`. This is not always desirable, so
you can disable this, in which case you will get (roughly) `author = {Gogh, Rembrandt van}`

### Warn when changing citation keys in bulk
<!-- extensions.zotero.translators.better-bibtex.warnBulkModify -->

For those who are curious about what the "Clear/Generate BibTeX key" right-click options do, this will warn you if you
are doing this on more than 10 (default) at the same time, to prevent your curiosity from changing all your citation
keys at once.

# Import/Export

### Fields to omit from export
<!-- extensions.zotero.translators.better-bibtex.skipFields -->

If there are some fields you don't want in your bibtex files (such as `note` for example), add a list of them here,
separated by comma's.

### Export BibTeX as ASCII
<!-- extensions.zotero.translators.better-bibtex.asciiBibTeX -->

BibTeX has really spotty Unicode support, so you generally want this on. It will translate things like accented
characters to their equivalent LaTeX constructs on export.

### Export BibLaTeX as ASCII
<!-- extensions.zotero.translators.better-bibtex.asciiBibLaTeX -->

BibLaTeX actually has really good Unicode support, so you generally want this off. But for some geezers such as me it is
simply more pleasing to have things like accented characters translated to their equivalent LaTeX constructs on export.

### When a reference has both a DOI and an URL, ...
<!-- extensions.zotero.translators.better-bibtex.DOIandURL -->

Does what it says on the tin, really. If a reference has both a DOI and an URL, you can choose to have them both
exported, or either one of them.

### Preserve BibTeX variables
<!-- extensions.zotero.translators.better-bibtex.preserveBibTeXVariables -->

When enabled, single-word strings will be assumed to be externally-defined @string vars, and thus not surrounded by
braces. If you don't know what this means, leave it off.

### Export attachments without metadata
<!-- extensions.zotero.translators.better-bibtex.attachmentsNoMetadata -->

By default, Better BibTeX will export attachments including a title and their mimetype, in a format supported by JabRef.
Many but not all BibTeX managers support this format, but if yours (like emacs ebib) doesn't, enable this to export only
the filename.

### Export collections recursively
<!-- extensions.zotero.recursiveCollections -->

With nested collections, Zotero can be made to show references in 'deeper' collections in their parent collection, or
only show references in collections that actually include them. Better BibTeX exports collections as you see them, so
this setting controls both what Zotero shows and what is exported for nested collections.

### Enable export by HTTP
<!-- extensions.zotero.httpServer.enabled -->

Enables the Zotero-embedded web server. If you have Zotero standalone, it is always on, and this preference will not be
shown. This option enabled [cite as you write](cayw.html) and [pull export](pull-export.html).

### Retain LaTeX markup on BibTeX import
<!-- extensions.zotero.translators.better-bibtex.rawImports -->

Enables [hardcore](hardcore.html) mode. You like Zotero in some ways, but really just want it to be a BibTeX manager. If
you enable this, any BibTeX files you import will retain all the latex commands they have, and marks the entry to be
exported without any translation.

# Journal abbreviations

### Automatically abbreviate journal titles
<!-- extensions.zotero.translators.better-bibtex.autoAbbrev -->

If set, generates journal abbreviations on export using the Zotero journal abbreviator, according to the abbreviation
style selected in the list below the checkbox.

### Abbreviation style
<!-- extensions.zotero.translators.better-bibtex.autoAbbrevStyle -->

Select the style for auto-abbreviation.

# Automatic Export

### Automatic Export
<!-- extensions.zotero.translators.better-bibtex.autoExport -->

Determines when [automatic exports](pull-export.html) are kicked off:

* **Disabled**: disable automatic exports (but still marks them when changes occur)
* **On Change**: export whenever a reference in the export changes/is added/is removed.
* **When Idle**: export marked collections when your computer is idle. You mostly want this if your computer is
  performance-constrained (aka slow)

# Debug

### Extended debug logging
<!-- extensions.zotero.translators.better-bibtex.debug -->

This will generate more verbose logs. This really does affect performance, so only enable this if you're trying to
diagnose a problem in Better BibTeX

### Show reference ID
<!-- extensions.zotero.translators.better-bibtex.showItemIDs -->

If you enable this, the `call number` column in the Zotero reference list (if you have selected it to be shown) will display
the internal reference ID instead of the call number field. Only useful for debugging.

### Re-scan pinned citekeys
<!-- extensions.zotero.translators.better-bibtex.scanCitekeys -->

There have been occasions where Better BibTeX seemed to ignore keys you have specified manually by having `bibtex: <whatever>`
in the `extra` field of your reference. I haven't seen this in ages, but enabling this and then restarting
Zotero will force a re-scan to find them. This sows down startup tremendously if you have a big library. The checkbox
will automatically clear after restart.

# Hidden

These preferences can be changed in `about:config` only. Some of these are here because the feature is still in
progress, but there's generally very little reason to change these.

### autoExportIdleWait
<!-- extensions.zotero.translators.better-bibtex.autoExportIdleWait -->

Number of seconds Better BibTeX should wait after your computer goes idle before auto exports are kicked off when
auto-export is set to "When Idle". Defaults to 10 seconds.

### cacheFlushInterval
<!-- extensions.zotero.translators.better-bibtex.cacheFlushInterval -->

How often the Better BibTeX database should be saved to disk. Defaults to once every 5 seconds. Note that your database
is always saved when your computer goes idle, or when you exit Zotero.

### cacheReset
<!-- extensions.zotero.translators.better-bibtex.cacheReset -->

Reset the cache after the next N restarts. Defaults to 0. I use this for debugging. Don't use this.

### confirmCacheResetSize
<!-- extensions.zotero.translators.better-bibtex.confirmCacheResetSize -->

On upgrading to a new version, Better BibTeX drops your cache to make sure you get the latest export implementation.
For large libraries, this may be undesirable because Better BibTeX updates frequently, and export on an empty cache is
really slow. If you have more than N entries in your cache, you will be asked if you want to keep the cache (and forego
the benefits of the upgrade until the relevant entries change to change their cache). Defaults to 1000,

### caching
<!-- extensions.zotero.translators.better-bibtex.caching -->

You really want this on. Better BibTeX has a very involved process of generating BibTeX output, and the caching
mechanism makes sure it doesn't happen any more frequently than necessary.

### csquotes
<!-- extensions.zotero.translators.better-bibtex.csquotes -->

Enables [csquotes](unicode.html) support.

### langID
<!-- extensions.zotero.translators.better-bibtex.langID -->

Switches between `babel` and `polyglossia`, except I haven't gotten around to polyglossia yet.

### skipWords
<!-- extensions.zotero.translators.better-bibtex.skipWords -->

list of words to skip in title when generating citation keys

### tests
<!-- extensions.zotero.translators.better-bibtex.tests -->

Unit tests to run 

### postscript
<!-- extensions.zotero.translators.better-bibtex.postscript -->

Snippet of javascript to run [after each BibTeX generation](export.html).

### jabrefGroups
<!-- extensions.zotero.translators.better-bibtex.jabrefGroups -->

Export JabRef groups for collections.

### defaultDateParserLocale
<!-- extensions.zotero.translators.better-bibtex.defaultDateParserLocale -->

The Better BibTeX date parser uses locale hints when provided with ambiguous dates such as 1/2/2008 (which is either 1st
of February, or 2nd of Januari). Better BibTeX will first look at the language specified in your reference and fall back
to your system locale otherwise, but if you add a language code here, this will be used as a fallback. I use `en-GB`
here myself as I generally prefer the en-US locale for my systems, but not the wacky idea of date formatting that comes
with it.

### titleCase
<!-- extensions.zotero.translators.better-bibtex.titleCase -->

Automatically titlecase English titles on export

### titleCaseLowerCase
<!-- extensions.zotero.translators.better-bibtex.titleCaseLowerCase -->

List of words to keep lowercase when applying title casing

### titleCaseUpperCase
<!-- extensions.zotero.translators.better-bibtex.titleCaseUpperCase -->

List of words to keep uppercase when applying title casing

