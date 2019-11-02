---
title: Exporting items
menuTitle: Exporting
weight: 2
tags:
  - export
  - scripting
aliases:
  - /customized-exports
  - /Customized-Exports
  - /export
---

Better BibTex adds a couple of export formats to Zotero's export dialog and several ways to improve export for plaintext-based authoring.
The Better BibTeX [configuration]({{< ref "installation/preferences" >}}) pane can be found under the regular Zotero preferences pane, tab 'Better BibTeX' where you can tweak the exports, such as

* [Omitting fields from exports]({{< ref "installation/preferences/export#fields-to-omit-from-export-comma-separated" >}}) to slim down your bib files.
* Configuring how [citation keys are generated]({{< ref "citing" >}}).
* And really a [ton more]({{< ref "installation/preferences" >}}).

Additionally you can automate exporting (parts of) your library either using [auto-export]({{< ref "auto" >}}) or [pull export]({{< ref "pull" >}}).

## Pinning (fixating) the citation key

By default, BBT will generate citation keys from your items using the [formatting pattern]({{< ref "citing" >}}) you specified. If you want the key to be stable even when you change the item, 
you can fixate its citation key to a value of your choosing by adding the text `Citation Key: [your citekey]` on a line of its own in the `extra` field of the item.

## Add your own BibLaTeX fields

### LaTeX fields

You can add your own fields to the export which are not derived from regular Zotero item fields by adding them in the `extra` field:

either by using lines such as 

```
tex.origdate= 1856
tex.origtitle= All This & More
```

or

```
tex.origdate: 1856
tex.origtitle: All This & More
```

The difference between lines with an `=` or an `:` is that the fields marked with `=` are considered to be valid ("raw") latex and will be passed on into the generated files as-is. The lines marked with `:` are assumed to be plain-text and LaTeX special characters (such as the `&` above) will be escaped.

### CSL fields

The final way to add fields is by using CSL fields in the format `{:original-date: 1856}` or `Original Date: 1856` on a line of its own. These fields will not only be
exported to Bib(La)TeX, but will also be [picked up](https://forums.zotero.org/discussion/3673/original-date-of-publication/) by the Zotero Bibliography manager, even
though not all Zotero styles yet support this.

Note that the default biblatex styles do not seem to support origdate; you can find possible solutions for this at Stack
Exchange
[here](http://tex.stackexchange.com/questions/142999/the-proper-way-to-cite-the-earliest-publication-date-in-brackets-followed-by)
and
[here](http://tex.stackexchange.com/questions/55859/getting-origyear-to-work-in-biblatex).

### Changing the exported reference type

If you add a field called `referencetype` using either one of these methods, that value will be used as the reference type
instead of the one usually inferred from the Zotero reference type. You can use this to create, for example,
`@customa{citekeyhere, ....}` type references.

