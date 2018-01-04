Better BibTeX bundles 6 translators you might care about:

## Export

These translators are supported by the auto-export functionality built into Better BibTeX:

* **Better BibLaTeX** exports references in BibLaTeX format (but better, natch)
* **Better BibTeX** exports references in BibTeX format
* **Better CSL JSON** exports references in pandoc-compatible CSL-JSON format, with added citation keys and parsing of metadata
* **Better CSL YAML** exports the same as the **Better CSL JSON** exporter, but in YAML format
* **Collected Notes** exports just notes -- standalone notes and notes attached to references, not the extra field -- to HTML. This way, Zotero can serve as a (very) simple research notebook.

## Import

* **Better BibTeX** exports and imports references in Bib(La)TeX format

## AUX Scanner

* **AUX Scanning** can be triggered from the gear menu (it used to be an an import-only translator). The scanner can
  read AUX files to put references you cited in a LaTeX document into the current collection, and a note for references cited but not in your Zotero library

## Included, but you should usually ignore it.

I would hide these if I could. They're used for Zotero's drag-and-drop citation facility, and for Better BibTeX debugging.

* **BetterBibTeX JSON** exports and imports references in BetterBibTeX debug format. The error reporter uses this format
* **Better BibTeX Quick Copy** exports citations to be copy-pasted into your LaTeX/Markdown document in the form `\cite{< key >}`/`[@key]`
