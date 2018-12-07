<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->
# Better BibTeX for Zotero [![Circle CI](https://circleci.com/gh/retorquere/zotero-better-bibtex.svg?style=shield)](https://circleci.com/gh/retorquere/zotero-better-bibtex)

[![Join the chat at https://gitter.im/retorquere/zotero-better-bibtex](https://badges.gitter.im/retorquere/zotero-better-bibtex.svg)](https://gitter.im/retorquere/zotero-better-bibtex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This extension aims to make Zotero (and soon Juris-M) effective for us text-based authoring holdouts;
currently, that translates to the LaTeX/Markdown crowd. To get started, read the
[Installation](https://retorquere.github.io/zotero-better-bibtex/installation) instructions. At its core,
it behaves like any Zotero import/export module; anywhere you can export or import bibliography items in Zotero,
you'll find *Better X* listed among the choices.  If nothing else, you could keep your existing workflow as-is,
and just enjoy the improved LaTeX &harr; unicode translation on import and export and more accurate field mapping. 

Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your references that Bib(La)TeX won't understand.

BBT will convert from/to HTML/LaTeX; Currently supports &lt;i&gt;&#8660;\emph &amp; \textit, &lt;b&gt;&#8660;\textbf,
&lt;sub&gt;&#8660;\_{...}, &lt;sup&gt;&#8660;^{...} and &lt;sc&gt;&#8660;\\textsc{...}; more can be added on request.
BBT contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode
equivalents on import, and their unicode equivalents back to `\"{o}` if you have that option enabled (but you don't
have to if you use BibLaTeX, which has fairly good Unicode support). With BBT you'll have:

* Stable [Citation Keys](https://retorquere.github.io/zotero-better-bibtex/citation-keys), without key clashes! Generates citation keys that take into account other existing keys in your library
  that are not part of the items you export. Prevent random breakage!
* Converts from/to HTML/LaTeX: Currently supports `<i>...</i>`/`\emph{...}`/`\textit{...}`, `<b>...</b>`/`\textbf{...}`, `<sup>...</sup>`/`\_{...}` and `<sub>...</sub>`/`^{...}`. 
  The plugin contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode equivalents on import (e.g., `\"{o}` to `ö`). If you need
  literal LaTeX in your export: surround it with `<pre>`...`</pre>` tags.
* Set your own, fixed [Citation Keys](https://retorquere.github.io/zotero-better-bibtex/citation-keys), generate citation keys from [JabRef patterns](https://help.jabref.org/en/BibtexKeyPatterns), drag and drop LaTeX citations, add other custom BibLaTeX fields.
* Highly [Customized Exports](https://retorquere.github.io/zotero-better-bibtex/customized-exports).
* Fixes date field exports: export dates like 'forthcoming' as 'forthcoming' instead of empty, but normalize valid dates
  to unambiguous international format.
* [Push/Pull Export](https://retorquere.github.io/zotero-better-bibtex/push-and-pull) from the embedded webserver.
* Automatic [journal abbreviation](https://retorquere.github.io/zotero-better-bibtex/citation-keys).


Better BibTeX works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://ctan.mirrorcatalogs.com/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

# Got problems? We got fixes!

If you have any questions on the use of the plugin, please do not hesitate to [file a GitHub issue](https://github.com/retorquere/zotero-better-bibtex/issues/new)
to ask for help. If you're reporting a bug in the plugin, please take a moment to glance through the 
[Support Request Guidelines](https://retorquere.github.io/zotero-better-bibtex/support);
it will make sure I get your problem fixed as quick as possible. Clear bug reports commonly have really short
time-to-fix, so if you report something, stick around -- it may be done as you wait.
The support request guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret;
these guidelines simply express my ideal bug submission.
I of course prefer very clearly documented issue reports over fuzzy ones,
but I prefer fuzzy ones over missed ones.
