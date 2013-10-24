# zotero-better-bibtex

When installed, this extension will override the standard BibTex import-export to retain bibtex keys. It also installs
a secon converter called "BibTeX cite keys" which will allow exporting entries as \\citep{.....} using these same keys.
If you set this translator as your export default, you can drag and drop bibtex citations.

The citekeys are stored in the "extra" field of the item, using bibtex: [your citekey]. If you edit and re-export,
these citekeys will be used.

The extension also does a more thorough mapping between unicode characters and latex commands.
Whether it does is configurable (no UI thoug, search for better-bibtex in about:config).
When exporting a collection, the extension defaults to a recursive export, but this too can be configured
in about:config.

Install by downloading the XPI above; after that, it will auto-update
