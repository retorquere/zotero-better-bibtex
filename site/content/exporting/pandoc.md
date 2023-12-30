---
title: Markdown/Pandoc
weight: 5
aliases:
  - /citing/pandoc
---

In addition to LaTeX, BBT plays very well with pandoc:

* you can [drag and drop]({{% ref "/installation/preferences/#quick-copydrag-and-drop-citations" %}}) citations from Zotero into your markdown documents.
* you can [cite as you write]({{% ref "/citing/cayw" %}}) in your favorite editor with varying levels of comfort, mostly depending on how easy (VSCode, Sublime) or hard (looking at you Scrivener) it is to extend your editor.
* you can even convert your markdown document into a LibreOffice/Word document with actual live Zotero items as if you had entered them into Zotero all along (see below)

## Use CSL, not bibtex with pandoc

Many tutorials on the use of pandoc to generate documents with
citations seem to use bibtex as a bibliography format. I would
encourage the use of CSL instead. Internally, both Zotero and pandoc-citeproc use
CSL citation engines; the two options you have are:

{{% gravizo " " %}}
  digraph G {
    aize ="4,4";
    node [shape=box];

    zotero -> pandoc_citeproc [label="CSL"];
    zotero -> pandoc_citeproc_convert [label="bibtex"];
    pandoc_citeproc_convert -> pandoc_citeproc [label="CSL"];

    pandoc_citeproc_convert [label="pandoc-citeproc in convert mode"];
    pandoc_citeproc [label="pandoc-citeproc"];
  }
{{% /gravizo %}}

Not only is the extra step through "pandoc-citeproc in convert mode" unnecesary, the translation between bibtex and CSL is complex and often lossy:

* Because Zotero primarily targets the built-in CSL processor, it
  assumes titles are stored in sentence case (as CSL styles
  assume sentence case); bibtex expects title case titles, so Zotero
  converts titles to title case on export to bibtex. "pandoc-citeproc in
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


## From Markdown to Zotero live citations

You can convert a Pandoc-compatible markdown source to a LibreOffice or Word document with live citation fields connecting to Zotero.

* make sure you have pandoc version 2.16.2 or later.
* download the [Pandoc filter](../zotero.lua)
* optional: add some metadata to your markdown file in a YAML header:

```yaml
---
# all the regular stuff you have here
zotero:
  library: <group name> # omitted to use your personal library
  scannable-cite: false # only relevant when you're compiling to scannable-cite .odt
  client: <zotero or jurism> # defaults to zotero
  author-in-text: false # when true, enabled fake author-name-only cites by replacing it with the text of the last names of the authors
  csl-style: apa # pre-fill the style
  sorted: true # sort clustered citations by author.
...
```

or you can specify them on the pandoc command line:

```bash
pandoc -s --lua-filter=zotero.lua --metadata=zotero_scannable_cite:true --metadata=zotero_client:jurism ...
```

And hey presto, a live LibreOffice/Word file, or an ODT file with
scannable cites. When you first open the document with live citations, open the Zotero
document preferences and click `OK` *before* you refresh, or you'll get a confirmation
popup for each citation. Also, the Word document is sometimes deemed
corrupt when opening it, but running the pandoc command again without
any changes fixes it ¯\\\_(ツ)\_/¯
LibreOffice doesn't recognise Zotero citations in DOCX,
see [issue #2070](https://github.com/retorquere/zotero-better-bibtex/issues/2070),
and you must use ODT.

You can also specify `transferable: true` to create a [transferable document](https://www.zotero.org/support/kb/moving_documents_between_word_processors). You don't really need this for ODT or DOCX (just use Pandoc to create those directly using this filter), but it will allow transferring your document to GDocs.

Zotero needs to be running, with BBT installed, while you compile your document.

With regards to sorting citations within a cluster, this is how Zotero does it by default, where pandoc keeps citations in the order you entered them. You can override this by setting `sorted` to `false`, for example to retain a prefix at the front, but it may generated citations that are not style-compliant.
