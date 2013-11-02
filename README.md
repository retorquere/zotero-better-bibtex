# Zotero: Better Bib(La)Tex

When installed, this extension will override the standard Bib(La)Tex import-export to add the following:

* drag-and-drop citations (set the "BibTex cite keys" as the default export format)
* set your own citation keys
* cleaner (de)LaTeXifier
* JabRef groups import
* configurable citekey generator

Your self-chosen citation keys are stored in the "extra" field of the item, using bibtex: [your citekey]. If you edit
and re-export, these citekeys will be used.

This plugin also implements a new citekey generator for those entries that don't have one set explicitly; you can
configure this by setting the configuration format using the key specified ni the table below; the formatter follows the
[JabRef key formatting syntax](http://jabref.sourceforge.net/help/LabelPatterns.php).

Install by downloading the XPI above; after that, it will auto-update.

Configuration currently does not have an UI; to change the settings, go to about:config to change the following keys.
A change to these requires a restart of Zotero to take effect.

| key                                         | default         |                                                                           |
|:------------------------------------------- |:--------------- |:------------------------------------------------------------------------- |
extensions.zotero-better-bibtex.recursive     | true            | Collection export is recursive into subcollections (true) or not (false)  |
extensions.zotero-better-bibtex.citeCommand   | cite            | LaTeX command for citekey export. Do not include the leading backslash    |
extensions.zotero-better-bibtex.citeKeyFormat | \[auth]\[year]  | citeky generation template                                                |

## Plans

JabRef groups export

## Notes

BibLaTeX features from https://github.com/andersjohansson/zotero-biblatex-translator
