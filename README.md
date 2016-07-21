# Better Bib(La)TeX for Zotero/Juris-M [![Circle CI](https://circleci.com/gh/retorquere/zotero-better-bibtex.svg?style=shield)](https://circleci.com/gh/retorquere/zotero-better-bibtex)

[![Join the chat at https://gitter.im/retorquere/zotero-better-bibtex](https://badges.gitter.im/retorquere/zotero-better-bibtex.svg)](https://gitter.im/retorquere/zotero-better-bibtex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This extension aims to make Zotero/Juris-M effective for us text-based authoring holdouts; currently, that translates to the
LaTeX/Markdown crowd. To get started, read the
[Installation](https://github.com/retorquere/zotero-better-bibtex/wiki/Installation) instructions.  At its core, it
behaves like any Zotero import/export module; anywhere you can export or import bibliography items in Zotero, you'll
find Better Bib(La)TeX listed as one of the choices. If nothing else, you could keep your existing workflow as-is, and
just enjoy the emproved LaTeX &lt;-&gt; unicode translation on im-and export.  Over and above this improvement, it adds
the following features to Zotero:

* Stable [Citation Keys](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys), without key clashes! Generates citation keys that take into account other existing keys in your library
  that are not part of the items you export. Prevent random breakage!
* Converts from/to HTML/LaTeX: Currently supports i/\emph/\textit, b/\textbf, sup/\_{...} and sub/^{...}; more can
  be added on request. Finally add italics and super/supscript to your titles! The plugin contains a comprehensive list
  of LaTeX constructs, so stuff like \"{o} or \"o will be converted to their unicode equivalents on import. If you need
  literal LaTeX in your export: surround it with &lt;pre&gt;....&lt;/pre&gt; tags.
* Set your own, fixed [Citation Keys](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys), generate citation keys from [JabRef patterns](http://jabref.sourceforge.net/help/LabelPatterns.php), drag and drop LaTeX citations, add other custom BibLaTeX fields
* Highly [Customized Exports](https://github.com/retorquere/zotero-better-bibtex/wiki/Customized-Exports)
* Fixes date field exports: export dates like 'forthcoming' as 'forthcoming' instead of empty.
* [Push/Pull Export](https://github.com/retorquere/zotero-better-bibtex/wiki/Push-and-Pull-Export) from the embedded webserver
* Automatic [journal abbreviation](https://github.com/retorquere/zotero-better-bibtex/wiki/Citation-Keys)

BBT works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://ctan.mirrorcatalogs.com/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

# Got problems? We got fixes!

If you have any questions on the use of the plugin, please do not hesitate to [file a GitHub issue](https://github.com/retorquere/zotero-better-bibtex/issues/new) to ask for help. If
you're reporting a bug in the plugin, please take a moment to glance through the [Support Request Guidelines](https://github.com/retorquere/zotero-better-bibtex/wiki/Support); it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes. The
guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines
simply express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I
prefer fuzzy ones over missed ones.
