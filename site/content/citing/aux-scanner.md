---
title: AUX Scanner
weight: 7
tags:
  - citation keys
---

You can populate a collection, or tag items in your
library, from an existing paper by scanning the `aux` file generated
by bibtex, or a pandoc-markdown file, for referenced used. Scanning can be triggered from the `Tools` menu (for
tagging the cited items) or by right-clicking a collection (for
adding them to a collection). The scanner will read your AUX files
and will put entries you cited in the associated LaTeX document
into the current collection.

By default, BBT will add a note for entries cited in the LaTeX
document but which do not exist in your Zotero library, but citation
keys must be present in your library before the scan is started --
BBT will by default *not* create new items for citekeys it
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

For pandoc-markdown scanning, BBT needs to actually run pandoc, and for that pandoc must be in your `$PATH`. On MacOS, if you installed pandoc using homebrew, it will likely not be in the `PATH` that Zotero can see. This can be fixed using

```
sudo launchctl config user path $PATH
```

which will set set the PATH-for-GUI-apps once to your current shell=`PATH`; if you update your PATH later and you want that reflected in Zotero, you'd have to run this again.

Note that you should not take advice from strangers on the internet asking you to run `sudo <anything>`... and I only found this by applying google-fu, not any deep understanding of MacOS (which I do use). It Worked For Me, but you might want to consult a MacOS-guru pal.
