---
title: From Markdown to live citations
weight: 5
---

You can convert a Pandoc-compatible markdown source to a LibreOffice or Word document with live citation fields connecting to Zotero. Download the [Pandoc filter](../zotero.lua)

Add some metadata to your markdown file in a YAML header:

```
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

And hey presto, a live LibreOffice/Word file, or an ODT file with scannable cites. When you first open the document, open the Zotero document preferences *before* you refresh, or you'll get a confirmation popup for each citation. Also, the Word document is sometimes deemed corrupt when opening it, but a recompile without changes fixes it ¯\\\_(ツ)\_/¯

Zotero needs to be running, with BBT installed, while you compile your document. You can get the library URL by right-clicking your library or collection that has the items you want to cite, and select 'Download Better BibTeX Export", and set the format to `CSL JSON`.
