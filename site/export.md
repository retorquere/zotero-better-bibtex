---
title: Customized Exports
---

The Better BibTeX configuration pane can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.
Through the configuration pane of BBT you can customize the BibTeX file that will be exported:

* **Automated background exports**. Tick 'keep updated' during export, and that's that.
* **Unicode conversion**: the default is to retain unicode characters on export for BibLaTeX, and to convert to LaTeX
  commands (where possible) for BibTeX. You can specify whether you want to retain this default, or whether you want BBT
  to always export translating to LaTeX commands, or never to do this translation.
* **Recursive collection export**: when exporting a collection, recursive export will include all child collections.
  Note that this also sets Zotero to display collection contents recursively.
* **Omit fields from export**: Should you so wish, you can prevent fields of your choosing from being exported. In the
  configuration screen, add a comma-separated list of BibTeX fields you do not want to see in your export. The fields
  are case-sensitive, separated by a comma *only*, no spaces.
* **[Configurable citekey generator](citation-keys.html)**
* **[Pull export](pull-export.html)**: You can fetch your library as part of your build, using curl (for example by using the included
  zoterobib.yaml arara rule), or with a BiblaTeX remote statement like
  \addbibresource[location=remote]{http://localhost:23119/better-bibtex/collection?/0/8CV58ZVD.biblatex}.  For Zotero
  standalone this is enabled by default; for Zotero embedded, this enables the embedded webserver.
* Add other custom BibLaTeX fields
* Scan your AUX files to get a list of references specifically for your article (and incidentally list missing
  references) by importing it.

BBT http export uses the general Zotero HTTP facility; please note that disabling this will disable ALL http
facilities in zotero -- including the non-Firefox plugins provided by Zotero.

# Add your own BibLaTeX fields

You can add any field you like by using something like `bibtex[origdate=1856;origtitle=An Old Title]` in the `extra`
field of your reference. This format is very rigid, it has no quoting syntax, so you can't have `=`, `[`, `]` or `;` in
your key names or values. If you need more flexibility, you can use the [JSON5](http://json5.org/) format instead:

> bibtex{
>   origdate: 1856,
>   origtitle: "Can contain = and ';' just fine"
> }

The marker for these fields can be either `bibtex`, `biblatex` or `biblatexdata`, but when importing BibTeX files with
fields not supported by Zotero, the `bibtex` marker will be used.

The final way to add fields is by using `{:original-date: 1856}`. These fields will not only be exported to Bib(La)TeX,
but will also be [picked up](https://forums.zotero.org/discussion/3673/original-date-of-publication/) by the Zotero
Bibliography manager, even though not all Zotero styles yet support this.

If you add a field called `referencetype` using either of these methods, that value will be used as the reference type
instead of the one usually inferred from the Zotero reference type. You can use this to create, for example,
`@customa{citekeyhere, ....}` type references.

You can fix the citation key for a reference to a value of your choosing by adding the text `bibtex: [your citekey]`
anywhere in the "extra" field of the reference.

Note that the default biblatex styles do not seem to support origdate; you can find possible solutions for this at Stack
Exchange
[here](http://tex.stackexchange.com/questions/142999/the-proper-way-to-cite-the-earliest-publication-date-in-brackets-followed-by)
and
[here](http://tex.stackexchange.com/questions/55859/getting-origyear-to-work-in-biblatex).

# You wanted customized...

You got customized. It doesn't yet have a GUI, but as this really is a bit on the technical side, I feel warranted to go
without for now.

If you go into `about:config` you will find a preference `extensions.zotero.translators.better-bibtex.postscript`, which
is empty by default. In this, preference, you can paste a javascript string which will be executed for each reference
generated in the Bib(La)TeX exporter. In this code, you have access to the reference just before it will be written out
and cached. The documentation-in-progress for the script environment can be found
[here](https://github.com/ZotPlus/zotero-better-bibtex/wiki/Scripting); there are also [examples on the wiki](https://github.com/ZotPlus/zotero-better-bibtex/wiki/Scripting-examples); feel free to add your own.
