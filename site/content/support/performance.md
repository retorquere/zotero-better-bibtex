---
title: Performance
weight: 6
tags:
  - export
  - cache
---

The Better BibTeX exporters are a lot slower than the standard Zotero Bib(La)TeX exporters. If you have a small library,
you will not likely notice this, but if you have several thousand items, and you are in the habit of exporting
substantial parts of your library, this gets annoying really fast.

To deal with this problem, Better BibTeX implements an extensive caching system. With a filled cache, Better BibTeX is
substantially faster than the default Zotero exporters.  Specifically for [automatic background exports]({{% ref "exporting" %}}), a filled cache is
a good thing to have.

For technical reasons, if you export the file attachments as part of your export, the cache is skipped altogether, so
this will always be slow. This is also why you cannot set up auto-exports with file exports.

### TL;DR

There's a more technical explanation below, but the TL;DR version is that you want to have a filled cache. If you want
to get it over with, export your entire library (once, no need to tick 'Keep Updated') using the 'Better BibTeX' format
and go grab coffee (or lunch, depending on the size of your library). After that, things should be *much* better.

Here are some numbers from a test with a library consisting of 86 items, exported 50 times in a row to middle out variances:

(attachments are not exported for this test, but they still required serialization and handling):

| Exporter                    |                      |
| --------------------        | -------------------- |
| Zotero BibTeX               | 3s                |
| Better BibTeX, empty cache  | 9s                |
| Better BibTeX, filled cache | 4s                |
| Zotero BibLaTeX               | 4s                |
| Better BibLaTeX, empty cache  | 9s                |
| Better BibLaTeX, filled cache | 3s                |

**note**: if you have 'Export files' enabled during export, or set the JabRef export format to `4`, the cache will not be active. If you do large (auto)exports, avoid these.

## Caching


### Initial state

Initially, your cache will be empty. The first export of any item using Better BibTeX will therefore be a little
over twice as slow as subsequent exports. After that, it gets pretty zippy, as the process of exporting a item
will also cache the output entry for that item *for the current export settings*. This means if you export once with, and once without
notes (one of the options in the export popup), you will hit an empty cache twice. If you set up an automatic export,
the export you do that registers it for auto-update will already be the first export, so if your items weren't
cached already, they will be before subsequent auto-exports.

### Cache refresh

The cache entry for a item is retained as long as you do not make any changes to that item. Any change you
make will drop all cache entries for that item (so all variants you had for different export options). The cache
for that item will be refreshed as soon as you export it again, either manually or
[automatically]({{% ref "exporting" %}}).

### Cache drop

*Any* change you make to the Better BibTeX [preferences]({{% ref "preferences" %}}) will drop the whole cache. The behavior of
the Better BibTeX exporters are highly configurable, and it is impossible for me to figure out which entries would be
affected specifically. Keep this in mind for large libraries; if you want to make changes to your configuration, make them all at once.

The same applies to upgrades. As the export behavior quite frequently changes between versions, Better BibTeX will drop
the cache during first startup of the newer version. This can be a nuisance if you have a large library, but it's the only way to keep support feasible.

