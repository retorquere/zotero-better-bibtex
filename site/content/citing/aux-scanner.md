---
title: AUX Scanner
weight: 7
tags:
  - citation keys
---

You can populate a reference collection, or tag items in your
library, from an existing paper by scanning the `aux` file generated
by bibtex. AUX Scanning can be triggered from the `Tools` menu (for
tagging the cited items) or by right-clicking a collection (for
adding them to a collection). The scanner will read your AUX files
and will put references you cited in the associated LaTeX document
into the current collection.

By default, BBT will add a note for references cited in the LaTeX
document but which do not exist in your Zotero library, but citation
keys must be present in your library before the scan is started --
BBT will by default *not* create new references for citekeys it
doesn't already know about. You can enable 'AUX Import' in the
preferences, and when that is on, if the scan finds citekeys not
already in your Zotero library, it will attempt to read those (but
*only* those) items from the bibtex file named in the `aux` file.

For BBT users who don't use LaTeX directly, you can create a
custom `aux` file to use with the AUX scanner by hand. It is a
text file formatted like this:

```
\citation{CITEKEY1}
\citation{CITEKEY2}
```

Where `CITEKEY1`, `CITEKEY2` etc are the [citation keys]({{< ref "../" >}})
that you want to include in the collection.
