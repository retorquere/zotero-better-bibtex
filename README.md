# zotero-better-bibtex

When installed, this extension will override the standard BibTex import-export to retain bibtex keys.

The citekeys are stored in the "extra" field of the item, using bibtex: <your citekey>. If you edit and re-export,
these citekes will be used.

The extension also does a more thorough mapping between unicode characters and latex commands.
Whether it does is configurable (no UI thoug, search for better-bibtex in about:config).
When exporting a collection, the extension defaults to a recursive export, but this too can be configured
in about:config.

## Plans

Auto-export of collections.
