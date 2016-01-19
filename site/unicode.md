---
title: Unicode and Markup
---

Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your references that Bib(La)TeX won't understand; BBT will

* converts from/to HTML/LaTeX; Currently supports &lt;i&gt;&#8660;\emph &amp; \textit, &lt;b&gt;&#8660;\textbf,
  &lt;sup&gt;&#8660;\_{...},
  &lt;sub&gt;&#8660;^{...} and &lt;sc&gt;&#8660;\\textsc{...}; more can
  be added on request.
* The plugin contains a comprehensive list of LaTeX constructs, so stuff like \\"{o} or \\"o will be converted to their unicode equivalents on import.
* `csquotes` support by hidden preference; if you open `about:config` and set
  `extensions.zotero.translators.better-bibtex.csquotes` to a string of character pairs, each pair will be assumed to be
  the open and close parts of a pair and will be replaced with a `\\enquote{...}` construct.
* In English titles, you can control capitalization by surrounding parts of the text in `<span
  class="nocase">...</span>`. Text between these will not have their capitalization changed in any way.
* In names, you can force first names like `Philippe` to be exported to `{\relax Ph}ilippe` by adding a [end of guarded
  area](http://www.fileformat.info/info/unicode/char/0097/index.htm) character between `Ph` and `ilippe`

