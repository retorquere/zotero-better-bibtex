---
title: "Pull export"
weight: 5
aliases:
  - /pull-export
tags:
  - export
---

You can fetch your bibliography on the url http://127.0.0.1:23119/better-bibtex/collection?`[collectionID]`.`[format]`, where collectionID is:

* the ID you get by right-clicking your collection and selecting "Show collection key"
* the path "/[library id]/full/path/to/collection" (the library id is the first number from the key you get in the
  option above; it's always '0' for your personal library)

or any multiple of those, separated by a '+' sign.

The format is either 'bibtex' or 'biblatex', and determines the translator used for export.

You can add options to the export as URL parameters:

* `&exportNotes=[true|false]`
* `&useJournalAbbreviation=[true|false]`

You can fetch your library as part of your build, using something like `curl` from your Makefile, or with a BibLaTeX remote statement like

```
\addbibresource[location=remote]{http://127.0.0.1:23119/better-bibtex/collection?/0/8CV58ZVD.biblatex}
```

**Pull export will *only* work if you are compiling your document on the
same system your Zotero client with BBT runs on**. *Technically*
it can be made to work for pulling from other systems, but it's
even more arcane to set up than [git support]({{< ref "auto#git-support" >}}).
