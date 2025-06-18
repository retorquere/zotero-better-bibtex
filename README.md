# Better BibTeX for Zotero

[![Join the chat at https://gitter.im/retorquere/zotero-better-bibtex](https://badges.gitter.im/retorquere/zotero-better-bibtex.svg)](https://gitter.im/retorquere/zotero-better-bibtex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Greenkeeper badge](https://badges.greenkeeper.io/retorquere/zotero-better-bibtex.svg)](https://greenkeeper.io/)

Better BibTeX (BBT) is an extension for [Zotero](https://www.zotero.org) and [Juris-M](https://juris-m.github.io) that makes it easier to manage bibliographic data, especially for people authoring documents using text-based toolchains (e.g. based on [LaTeX](https://www.latex-project.org) / [Markdown](https://www.markdownguide.org)).

## Zotero 7 support

I have begun the process of deprecating Zotero 6 support. I'm still putting the infrastructure for than in place, but as of now, only Zotero7 and Zotero7 beta get new functionality, and Zotero 6 support (available at https://github.com/retorquere/zotero-better-bibtex/releases/tag/v6.7.267) is in maintenance mode.

## Juris-M support

Juris-M is unfortunately not compatible with BBT at the moment. To my understanding, work is underway to get a Zotero-7-based Juris-M, and then BBT will work in Juris-M.

## Features

### Facilities for generating citation keys

* Automatically generate [citation keys](https://retorque.re/zotero-better-bibtex/citing/) without key clashes! Generate citation keys that take into account existing keys in your library even when they are not part of the items you export. Prevent random breakage!
* Generate citation keys based on contents of your items using [citekey formulas](https://retorque.re/zotero-better-bibtex/citing/#configurable-citekey-generator).
* Set your own, stable citation keys, drag and drop LaTeX citations, add other custom BibLaTeX fields.


### Conversion between formats and encodings
* Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your items that Bib(La)TeX won't understand.

* BBT will convert from/to HTML/LaTeX:

  - `<i>...</i>`&#8660;`\emph{...}`/`\mkbibemph{...}`/`\textit{...}`
  - `<b>...</b>`&#8660;`\textbf{...}`
  - `<sup>...</sup>`&#8660;`\textsuperscript{...}` and `<sub>...</sub>`&#8660;`\textsubscript{...}`. 
  
  More can be added on request.
  
  BBT contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode equivalents on import (e.g., `\"{o}` to `ö`), and their unicode equivalents back to `\"{o}` if you have that option enabled (but you don't have to if you use BibLaTeX, which has fairly good Unicode support).
  
  If you need literal LaTeX in your export: surround it with `<script>`...`</script>` (or `<pre>`...`</pre>`, which do the same) markers.
  
### Facilities for exporting data from Zotero
* Highly [customized exports](https://retorque.re/zotero-better-bibtex/exporting/).
* Fixes date field exports: export dates like 'forthcoming' as 'forthcoming' instead of empty, but normalize valid dates
  to unambiguous international format.
* [Auto export](https://retorque.re/zotero-better-bibtex/exporting/auto/) of collections or entire libraries when they change.
* [Pull export](https://retorque.re/zotero-better-bibtex/exporting/pull/) from the embedded webserver.
* Automatic [journal abbreviation](https://retorque.re/zotero-better-bibtex/citing/).

## Getting started
To get started, read the [installation instructions](https://retorque.re/zotero-better-bibtex/installation/).

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

If you're reporting a bug in BBT, please take a moment to glance through the [support request guidelines](https://retorque.re/zotero-better-bibtex/support/); it will make sure I get your problem fixed as quick as possible.
Clear bug reports commonly have really short time-to-fix, so if you report something, stick around -- it may be done as you wait.

The support request guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines simply express my ideal bug submission.
I of course prefer very clearly documented issue reports over fuzzy ones, but I prefer fuzzy ones over missed ones.

## Sponsoring BBT

While the development needs of BBT are to a large extent covered
by the generosity towards open-source developers of services such
as github, my development system does require the
occasional upgrade; also, I enjoy getting the occasional frivolous
tech-toy that I wouldn't otherwise grant myself. While you should
feel in no way obligated to pay for BBT, [anything you can spare](https://www.paypal.me/retorquere) is very much appreciated.
If you'd rather contribute a little bit each month (and a little
means a lot) so I can save up for a replacement a year or so down
the line, head on over to [Patreon](https://www.patreon.com/retorquere),
but mind that Patreon takes a fairly large cut of what you give.

Many, many thanks, also to the existing contributors -- thanks to you I've hit my first target and have been able to replace my trusty macbook air with a newer macbook pro which has much more breathing room.

![My github stats](https://github-readme-stats.vercel.app/api?username=retorquere&show_icons=true&hide_border=true&theme=dark)

I prefer communicating via github issues, but for private information you can reach me on [matrix](https://matrix.to/#/@retorquere:utwente.io)
