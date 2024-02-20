---
archetype: home
title: Better BibTeX for Zotero
weight: 5
aliases:
  - /Home
---
<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->

Better BibTeX (BBT) is a plugin for [Zotero](https://www.zotero.org) and [Juris-M](https://juris-m.github.io) that makes it easier to manage bibliographic data, especially for people authoring documents using text-based toolchains (e.g. based on [LaTeX](https://www.latex-project.org) / [Markdown](https://www.markdownguide.org)).

## Features

### Facilities for generating citation keys

* Automatically generate [citation keys]({{% ref "/citing/_index.md" %}}) without key clashes! Generate citation keys that take into account existing keys in your library even when they are not part of the items you export. Prevent random breakage!
* Generate citation keys based on contents of your items using [citekey formulas]({{% ref "/citing/_index.md#configurable-citekey-generator" %}}).
* Set your own, stable citation keys, drag and drop LaTeX citations, add other custom BibLaTeX fields.


### Conversion between formats and encodings
* Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your items that Bib(La)TeX won't understand.

* BBT will convert from/to HTML/LaTeX:

  - `<i>...</i>`&#8660;`\emph{...}`/`\textit{...}`
  - `<b>...</b>`&#8660;`\textbf{...}`
  - `<sup>...</sup>`&#8660;`\textsuperscript{...}` and `<sub>...</sub>`&#8660;`\textsubscript{...}`. 
  
  More can be added on request.
  
  BBT contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode equivalents on import (e.g., `\"{o}` to `ö`), and their unicode equivalents back to `\"{o}` if you have that option enabled (but you don't have to if you use BibLaTeX, which has fairly good Unicode support).
  
  If you need literal LaTeX in your export: surround it with `<script>`...`</script>` (or `<pre>`...`</pre>`, which do the same) markers.
  
### Facilities for exporting data from Zotero
* Highly [customized exports]({{% ref "/exporting" %}}).
* Fixes date field exports: export dates like 'forthcoming' as 'forthcoming' instead of empty, but normalize valid dates
  to unambiguous international format.
* [Auto export]({{% ref "/exporting/auto" %}}) of collections or entire libraries when they change.
* [Pull export]({{% ref "/exporting/pull" %}}) from the embedded webserver.
* Automatic [journal abbreviation]({{% ref "/citing/_index.md" %}}).

## Getting started
To get started, read the [installation instructions]({{% ref "/installation" %}}).

## How does it work ?
At its core, BBT behaves like any Zotero import/export module; anywhere you can export or import bibliography items in Zotero,
you'll find *Better X* listed among the choices.  

If nothing else, you could keep your existing workflow as-is, and just enjoy the improved LaTeX &harr; unicode translation on import and export and more accurate field mapping.

Better BibTeX works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://mirrors.ctan.org/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

## Got problems? We got fixes!

If you have any questions on BBT's use, do not hesitate to [file a GitHub issue](https://github.com/retorquere/zotero-better-bibtex/issues/new/choose) and ask for help. 

If you're reporting a bug in BBT, please take a moment to glance through the [support request guidelines]({{% ref "/support" %}}); it will make sure I get your problem fixed as quick as possible.
Clear bug reports commonly have really short time-to-fix, so if you report something, stick around -- it may be done as you wait.

The support request guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines simply express my ideal bug submission.
I of course prefer very clearly documented issue reports over fuzzy ones, but I prefer fuzzy ones over missed ones.

