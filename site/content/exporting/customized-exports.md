---
title: Customized exports
weight: 3
tags:
  - export
  - scripting
aliases:
  - /customized-exports
---

Better BibTex adds a couple of export formats to Zotero's export dialog. The Better BibTeX configuration pane can be found under the regular Zotero preferences pane, tab 'Better BibTeX'.
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
* **[Configurable citekey generator]({{< ref "citing" >}})**
* **[Push-and-Pull-Export]({{< ref "exporting" >}})**: You can fetch your library as part of your build, using something like `curl`, or with a BiblaTeX remote statement like `\addbibresource[location=remote]{http://localhost:23119/better-bibtex/collection?/0/8CV58ZVD.biblatex}`.
* Add other custom BibLaTeX fields

BBT http export uses the general Zotero HTTP facility; please note that disabling this will disable ALL HTTP
facilities in Zotero -- including the non-Firefox plugins provided by Zotero.

## Add your own BibLaTeX fields

There are three alternative methods: 

### Square brackets []

You can add any field you like by using something like

```
bibtex[origdate=1856;origtitle=An Old Title]
```

in the `extra` field of your reference. This format is very rigid, it has no quoting syntax, so you can't have `=`, `[`,
`]` or `;` in your key names or values. 

### JSON5

If you need more flexibility, you can use the [JSON5](http://json5.org/) format
instead:

```
bibtex{
  origdate: 1856,
  origtitle: "Can contain = and ';' just fine"
}
```

The marker for these fields can be either `bibtex`, `biblatex` or `biblatexdata`, but when importing BibTeX files with
fields not supported by Zotero, the `bibtex` marker will be used. These fields are assumed to be valid LaTeX, and will
be exported exactly as entered. 

If you want to have them LaTeX encoded, add an asterisk (`*`) after the marker, so
something like

```
bibtex*{
  origdate: 1856,
  origtitle: "Things like _ and $ will be escaped"
}
```

### CSL fields

The final way to add fields is by using CSL fields in the format `{:original-date: 1856}`. These fields will not only be
exported to Bib(La)TeX, but will also be [picked up](https://forums.zotero.org/discussion/3673/original-date-of-publication/) by the Zotero Bibliography manager, even
though not all Zotero styles yet support this.

### Common notes

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

## You wanted customized...

You got customized. If you go into the Advanced preferences of BBT, find an edit field labeled `Postscript`, empty by default. In this, you can paste a JavaScript snippet which will be executed for each reference
generated in the Bib(La)TeX exporter. In this code, you have access to the reference just before it will be written out
and cached. Examples and the documentation-in-progress for the script environment can be found
[here]({{< ref "scripting" >}}); feel free to add your own examples.
