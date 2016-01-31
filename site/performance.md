---
title: Performance
---

The Better BibTeX exporters are a lot slower than the standard Zotero Bib(La)TeX exporters. If you have a small library,
you will not likely notice this, but if you have several thousand references, and you are in the habit of exporting
substantial parts of your library, or you use [Markdown citation scanning](https://atom.io/packages/zotero-citations),
this gets annoying really fast.

To deal with this problem, Better BibTeX implements an extensive caching system. With a filled cache, Better BibTeX is
substantially faster than the default Zotero exporters.  Specifically for [automatic background
exports](pull-export.html) or [Markdown citation scanning](https://atom.io/packages/zotero-citations), a filled cache is
a good thing to have.

For technical reasons, if you export the file attachments as part of your export, the cache is skipped altogether, so
this will always be slow. This is also why you cannot set up auto-exports with file exports.

### TL;DR

There's a more technical explanation below, but the TL;DR version is that you want to have a filled cache. If you want
to get it over with, export your entire library (once, no need to tick 'Keep Updated') using the 'Better BibTeX' format
and go grab coffee (or lunch, depending on the size of your library). After that, things should be *much* better.

Here are some numbers from a recent test with a library consisting of 1241 references with 284 attachments (the attachments are only linked to, not exported):

| Exporter                    |                      |
| --------------------        | -------------------- |
| Zotero                      | 14.1s                |
| Better BibTeX, empty cache  | 53.0s                |
| Better BibTeX, filled cache |  3.7s                |

# Caching


### Initial state

Initially, your cache will be empty. The first export of any reference using Better BibTeX will therefore be a little
over 14 times as slow as subsequent exports. After that, it gets pretty zippy, as the process of exporting a reference
will also cache that reference *for the current export settings*. This means if you export once with, and once without
notes (one of the options in the export popup), you will hit an empty cache twice. If you set up an automatic export,
the export you do that registers it for auto-update will already be the first export, so if your references weren't
cached already, they will be before subsequent auto-exports.

### Cache refresh

The cache entry for a reference is retained as long as you do not make any changes to that reference. Any change you
make will drop all cache entries for that reference (so all variants you had for different export options). The cache
for that reference will be refreshed as soon as you export it again, either manually or
[automatically](pull-export.html).

### Cache drop

*Any* change you make to the Better BibTeX [preferences](configuration.html) will drop the whole cache. The behavior of
the Better BibTeX exporters are highly configurable, and it is impossible for me to figure out which entries would be
affected specifically. Keep this in mind for large libraries; if you want to make changes to your configuration, make them all at once.

The same applies to upgrades. As the export behavior quite frequently changes between versions, Better BibTeX will drop
the cache during first startup of the newer version. This can be a nuisance if you have a large library, so if you have
a substantial cache (where 'substantial' is [configurable](configuration.html#hidden) by changing
`confirmCacheResetSize`), you will be asked whether you want to drop or retain your cache at this point.

Please *do keep in mind* that some new settings will not be reflected in your exports until the cache entry is
refreshed. This is a trade-off you will have to make. If you want to refresh a single entry, just change anything (and
back if you wish after), or go into the Better BibTeX debug settings and click "Reset Cache" to refresh them all.

If you have chosen to retain your cache and you are experiencing problems, please first clear your cache and try to
reproduce your problem before lodging an issue.
