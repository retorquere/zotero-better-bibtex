# zotero-better-bibtex

When installed, this extension will override the standard BibTex import-export to retain bibtex keys. It also installs a
second converter called "BibTeX cite keys" which will allow exporting entries as \\cite{.....} using these same keys.
If you set this translator as your export default, you can drag and drop bibtex citations. The citekeys are stored in
the "extra" field of the item, using bibtex: [your citekey]. If you edit and re-export, these citekeys will be used.

The extension also does a more thorough mapping between unicode characters and latex commands.

Install by downloading the XPI above; after that, it will auto-update.

Configuration currently does not have an UI; to change the settings, go to about:config to change the following keys.
A change to these requires a restart of Zotero to take effect.

| key                                       | default |                                                                           |
|:----------------------------------------- |:------- |:------------------------------------------------------------------------- |
extensions.zotero-better-bibtex.recursive   | true    | Collection export is recursive into subcollections (true) or not (false)  |
extensions.zotero-better-bibtex.citecommand | cite    | LaTeX command for citekey export. Do not include the leading backslash    |

