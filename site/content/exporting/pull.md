---
title: "Pull export"
weight: 5
aliases:
  - /pull-export
tags:
  - export
---

You can fetch your bibliography on the url http://127.0.0.1:23119/better-bibtex/collection?`[collectionID]`.`[format]` [^1]. You can get this URL for a group, library or collection by right-clicking it and selecting `Download Better BibTeX export...`

You can add options to the export as URL parameters:

* `&exportNotes=[true|false]`
* `&useJournalAbbreviation=[true|false]`

You can fetch your library as part of your build, using something like `curl` from your Makefile, or with a BibLaTeX remote statement like

```tex
\addbibresource[location=remote]{http://127.0.0.1:23119/better-bibtex/collection?/0/8CV58ZVD.biblatex}
```

`format` can be:

* `bib` of `biblatex` for BibLaTeX
* `bibtex` for BibTeX
* `json` or `csljson` for CSL-JSON
* `yaml`, `yml` or `cslyaml` for CSL-JSON in YAML format
* `jzon` for BetterBibTeX JSON debug format
* the value of `translatorID` taken from the header of any existing Zotero translator to get an export in that translator format

**`addbibresource` from pull export will *only* work if you are compiling your document on the
same system your Zotero client with BBT runs on**. *Technically*
it can be made to work for pulling from other systems, but it's
even more arcane to set up than [git support]({{% ref "auto#git-support" %}}).

Note that as of Zotero 5.0.71, access to this URL will no longer work from the browser for security reasons; `curl` and other programmatic access will work.

[^1]: Replace portnumber `23119` with `24119` for Juris-M.
