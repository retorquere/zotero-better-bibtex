---
title: Bundled translators
description : "Zotero import/export translators bundled with BBT"
weight: 20
tags:
  - export
  - import
---
Better BibTeX bundles 5 translators you might care about:

## Export

These translators are supported by the auto-export functionality built into Better BibTeX:

* **Better BibLaTeX** exports references in BibLaTeX format (but better, natch)
* **Better BibTeX** exports references in BibTeX format
* **Better CSL JSON** exports references in pandoc-compatible CSL-JSON format, with added citation keys and parsing of metadata
* **Better CSL YAML** exports the same as the **Better CSL JSON** exporter, but in YAML format
* **Collected Notes** exports just notes -- standalone notes and notes attached to references, not the extra field -- to HTML. This way, Zotero can serve as a (very) simple research notebook.

## Import

* **Better BibTeX** exports and imports references in Bib(La)TeX format

## Included, but you should usually ignore it.

I would hide these if I could. They're used for Zotero's drag-and-drop citation facility, and for Better BibTeX debugging.

* **BetterBibTeX JSON** exports and imports references in BetterBibTeX debug format. The error reporter uses this format
* **Better BibTeX Quick Copy** exports citations to be copy-pasted into your LaTeX/Markdown document in the form `\cite{< key >}`/`[@key]`

