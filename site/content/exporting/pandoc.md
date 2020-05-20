---
title: From Markdown to live citations
weight: 5
aliases:
  - /citing/pandoc
---

In addition to LaTeX, BBT plays very well with pandoc:

* you can [drag and drop](/installation/preferences/citation-keys/#quick-copydrag-and-drop-citations) citations from Zotero into your markdown documents.
* you can [cite as you write](/citing/cayw) in your favorite editor with varying levels of comfort, mostly depending on how easy (VSCode, Sublime) or hard (looking at you Scrivener) it is to extend your editor.
* you can even convert your markdown document into a LibreOffice/Word document with actual live Zotero references as if you had entered them into Zotero all along (see below)

## Use CSL, not bibtex with pandoc

Many tutorials on the use of pandoc to generate documents with
citations seem to use bibtex as a bibliography format. I would
encourage the use of CSL instead. Internally, both Zotero and pandoc-citeproc use
CSL citation engines; the two options you have are:

{{< gravizo " " >}}
  digraph G {
    aize ="4,4";
    node [shape=box];

    zotero -> pandoc_citeproc [label="CSL"];
    zotero -> pandoc_citeproc_convert [label="bibtex"];
    pandoc_citeproc_convert -> pandoc_citeproc [label="CSL"];

    pandoc_citeproc_convert [label="pandoc-citeproc in convert mode"];
    pandoc_citeproc [label="pandoc-citeproc"];
  }
{{< /gravizo >}}

Not only is the extra step through "pandoc-citeproc in convert mode" unnecesary, the translation between bibtex and CSL is complex and often lossy:

* Because Zotero primarily targets the built-in CSL processor, it
  assumes titles are stored in sentence case (as CSL styles
  assume sentence case); bibtex expects title case titles, so Zotero
  converts titles to title case on export. "pandoc-citeproc in
  convert mode" will then take that title-cased bibtex and convert
  it back to sentence case. Neither Zotero nor pandoc-citeproc use
  natural language processing; the conversion between casing styles
  is largely done using heuristics. This conversion is imperfect,
  and you don't gain any benefit from it.
* The item model of Zotero/CSL on the one hand and bibtex on the
  other has important differences, and in the conversion, choices
  must be made on what to put where, and what to drop. Zotero and
  pandoc-citeproc do not necessarily have the same business rules,
  and this unspoken difference can be another cause of loss.

All of these problems go away if you just skip the detour via bibtex and export (Better) CSL from Zotero and use that in your pandoc process.


## From Markdown to live citations

You can convert a Pandoc-compatible markdown source to a LibreOffice or Word document with live citation fields connecting to Zotero.

* download the [Pandoc filter](../zotero.lua)
* add some metadata to your markdown file in a YAML header:

```
---
# all the regular stuff you have here
zotero:
  bibliography: http://127.0.0.1:23119/better-bibtex/library?/1/library.json
  scannable-cite: false # only relevant when your compiling to scannable-cite .odt
...
```

or you can specify them on the pandoc command line:

```
pandoc -s --lua-filter=zotero.lua --metadata=zotero_scannable_cite:true --metadata=zotero_bibliography:http://127.0.0.1:23119/better-bibtex/library?/1/library.json ...
```

And hey presto, a live LibreOffice/Word file, or an ODT file with
scannable cites. When you first open the document, open the Zotero
document preferences *before* you refresh, or you'll get a confirmation
popup for each citation. Also, the Word document is sometimes deemed
corrupt when opening it, but running the pandoc command again without
any changes fixes it ¯\\\_(ツ)\_/¯

Zotero needs to be running, with BBT installed, while you compile
your document. You can get the library URL by right-clicking your
library or collection that has the items you want to cite, and
select 'Download Better BibTeX Export", and set the format to `CSL
JSON`.
