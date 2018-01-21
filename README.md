# Better Bib(La)TeX for Zotero [![Circle CI](https://circleci.com/gh/retorquere/zotero-better-bibtex.svg?style=shield)](https://circleci.com/gh/retorquere/zotero-better-bibtex)

[![Join the chat at https://gitter.im/retorquere/zotero-better-bibtex](https://badges.gitter.im/retorquere/zotero-better-bibtex.svg)](https://gitter.im/retorquere/zotero-better-bibtex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This extension aims to make Zotero (and soon Juris-M) effective for us text-based authoring holdouts;
currently, that translates to the LaTeX/Markdown crowd. To get started, read the
[Installation](https://github.com/retorquere/zotero-better-bibtex/wiki/Installation) instructions. At its core,
it behaves like any Zotero import/export module; anywhere you can export or import bibliography items in Zotero,
you'll find *Better Bib(La)TeX* listed as one of the choices.  If nothing else, you could keep your existing workflow as-is,
and just enjoy the improved LaTeX &harr; unicode translation on import and export and more accurate field mapping. 
Over and above this improvement, it adds the following features to Zotero:

* Stable [Citation Keys](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys), without key clashes! Generates citation keys that take into account other existing keys in your library
  that are not part of the items you export. Prevent random breakage!
* Converts from/to HTML/LaTeX: Currently supports `<i>...</i>`/`\emph{...}`/`\textit{...}`, `<b>...</b>`/`\textbf{...}`, `<sup>...</sup>`/`\_{...}` and `<sub>...</sub>`/`^{...}`. 
  The plugin contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode equivalents on import (e.g., `\"{o}` to `ö`). If you need
  literal LaTeX in your export: surround it with `<pre>`...`</pre>` tags.
* Set your own, fixed [Citation Keys](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys), generate citation keys from [JabRef patterns](http://jabref.sourceforge.net/help/LabelPatterns.php), drag and drop LaTeX citations, add other custom BibLaTeX fields.
* Highly [Customized Exports](https://github.com/retorquere/zotero-better-bibtex/wiki/Customized-Exports).
* Fixes date field exports: export dates like 'forthcoming' as 'forthcoming' instead of empty, but normalize valid dates
  to unambiguous international format.
* [Push/Pull Export](https://github.com/retorquere/zotero-better-bibtex/wiki/Push-and-Pull-Export) from the embedded webserver.
* Automatic [journal abbreviation](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys).


Better Bib(La)TeX works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://ctan.mirrorcatalogs.com/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

# Got problems? We got fixes!

If you have any questions on the use of the plugin, please do not hesitate to [file a GitHub issue](https://github.com/retorquere/zotero-better-bibtex/issues/new)
to ask for help. If you're reporting a bug in the plugin, please take a moment to glance through the 
[Support Request Guidelines](https://github.com/retorquere/zotero-better-bibtex/wiki/Support);
it will make sure I get your problem fixed as quick as possible. Clear bug reports commonly have really short
time-to-fix, so if you report something, stick around -- it may be done as you wait.
The support request guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret;
these guidelines simply express my ideal bug submission.
I of course prefer very clearly documented issue reports over fuzzy ones,
but I prefer fuzzy ones over missed ones.

# A new dev system

I hate asking for money for BBT, but the time has come: my MacBook Air is not really hacking it anymore, and in order to do decent cross-platform support, a MacBook is what I need. [Anything you can spare](https://www.paypal.me/retorquere)  towards that goal is very much appreciated. Currently at 2.5% of target.
