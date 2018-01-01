Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your references that Bib(La)TeX won't understand.

BBT will convert from/to HTML/LaTeX; Currently supports &lt;i&gt;&#8660;\emph &amp; \textit, &lt;b&gt;&#8660;\textbf,
&lt;sub&gt;&#8660;\_{...}, &lt;sup&gt;&#8660;^{...} and &lt;sc&gt;&#8660;\\textsc{...}; more can be added on request.
BBT contains a comprehensive list of LaTeX constructs, so stuff like `\"{o}` or `\"o` will be converted to their unicode
equivalents on import, and their unicode equivalents back to `\"{o}` if you have that option enabled (but you don't
have to if you use BibLaTeX, which has fairly good Unicode support).

## Gotchas

* In titles of English references, you can control capitalization by surrounding parts of the text in `<span
  class="nocase">...</span>`. Text between these will not have their capitalization changed in any way. See more on this
  below in the section `Mapping fields`.
* In names, you can force first names like `Philippe` to be exported to `{\relax Ph}ilippe` (which causes it to get
  initial `Ph.` rather than `P.` in styles that do initials) by adding a [end of guarded area](http://www.fileformat.info/info/unicode/char/0097/index.htm) character between `Ph` and `ilippe`.

## Hidden features

* **`csquotes` support**; if you [open `about:config`](Configuration#hidden-preferences) and set
  `extensions.zotero.translators.better-bibtex.csquotes` to a string of character pairs, each pair will be assumed to be
  the open and close parts of a pair and will be replaced with a `\\enquote{...}` construct.

## Mapping Fields

There isn't a straightforward one-to-one mapping for all Zotero to Bib(La)TeX fields. For most I can make reasonable
choices, but there are some things where Better BibTeX takes a little more liberties with your references in order to
get sensible output.

Title fields in particular are a total mess. Zotero [recommends having your titles in sentence
case](https://zotero-manual.github.io/zotero-manual/adding-items#sentence-and-title-case) because that's what the
embedded citation processor expects, but of course, BibLaTeX expects your titles to be in Title Case... *but only if
they're in English*. Nice. In order to translate the Zotero recommendation into Bib(La)TeX best practice, BBT will
title-case the titles of English references. English references, as far as BBT is concerned, are those references that
have their language explicitly set to an English language (`american` counts as English for example), and those
references that have no explicit language set. To do this, BBT uses the same title-caser that Zotero uses to produce
title-cased styles such as Chicago.

The titles so modified will then pass through your Bib(La)TeX processor, which will in turn try to lowercase or
initial-caps some words and not others -- for English references. But then sometimes, you want words that have capitals
to keep. BBT assumes that if a word has at least one capital letter (subject to some rather complex exceptions)
you meant it to be there, and you want BibTeX to leave it alone no matter what. To do that, it
wraps those (strings of) words in those double braces. This is to let BibTeX know that `ISDN` may not be changed to
`isdn` or `Isdn`, regardless of the bibliography style in play.

The simplest approach would be to wrap title fields in extra braces as a whole, and some sites will erroneously
recommend doing so (looking at you here MIT librarians). But there are styles do need to recapitalize parts of the
title (for example to selectively downcase the titlecasing), and having the whole field so wrapped interferes with that. So Better BibTeX wraps individual words -- or strings
of those words -- that have capitals in them with double braces.

For English titles BBT will Title Case and brace-protect your titles on output. Except, those Title Cased words which BBT changed itself will *not* be wrapped in double-braces,
as it *is* OK for the styles to change casing for those, depending on the style at play. So `I like ISDN heaps better
than dialup` would output to `I Like {{ISDN}} Heaps Better than Dialup`. Apparently non-English titles are supposed to
be in sentence case, so BBT doesn't touch those.

You can steer this process somewhat by enclosing the parts you don't want case manipulation on in `<span
class="nocase">...</span>`. Anything between those won't be touched by Zotero or BBT. This is formally supported by
Zotero and will work in the Word/LibreOffice plugins as well as in the BibTeX export. This will be required for words
you wish to always keep lowercase, for example.  Also, if
you don't generally use Zotero for generating bibliographies but just for BibTeX reference management, you can turn on the hidden
preference
[extensions.zotero.translators.better-bibtex.suppressTitleCase](https://github.com/retorquere/zotero-better-bibtex/wiki/Configuration#extensionszoterotranslatorsbetter-bibtexsuppresstitlecase)
to keep BBT from applying title-casing, but take note that if you do this, the
bibliographies you get from Zotero and the bibliograhies you get through Bib(La)TeX will differ, and you can't complain
about this. Brace protection cannot be turned off.

## Why the double braces?

But why then the double-braces (`{{...}}`) rather than the commonly recommended single braces (`{...}`)?

This is not because of some arcane aesthetic preference, but because the Bib(La)TeX case protection rules are incredibly
convoluted ([#541](https://github.com/retorquere/zotero-better-bibtex/issues/541),
[#383](https://github.com/retorquere/zotero-better-bibtex/issues/383)). For example, here are some "interesting" cases
that BBT has learned to deal with. Did you know that

* `{\emph{Homo sapiens}}` *un*-case-protects `Homo sapiens`? It sure was a surprise to me.  So
  `\emph{Homo sapiens}` is case-protected (will not be recapitalized by Bib(La)TeX), but `{\emph{Homo sapiens}}` *is not* case-protected so it *will* be recapitalized. So to get
  predictable behavior, this is written out as `{{\emph{Homo sapiens}}}`.
* casing behavior over the *whole* reference field depends on [whether there's a slash-command at the first position](https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240156274) of the title? 
* [apparently](https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240999396), to make sure that `Reading HLA Hart's: <i>The Concept of Law</i>` renders as expected means I have to output the astoundingly ugly `{Reading {{HLA Hart}}'s: {{{\emph{The Concept}}}}{\emph{ of }}{{{\emph{Law}}}}}`?

The double-bracing is the only unambiguous rule I could construct that consistently gets the rendered reference right (so far).

Bib(La)TeX provides a never-ending stream of edge cases, which BBT tries to decide algorithmically. I try to keep the resulting file as pretty as I can (I'm sensitive to the aesthetics myself), but the target is best described as "given reasonable input, generate well-rendering output", and reasonable-to-well-rendering in the BBT case will have to include "follows Zotero recommendations for storing references" and "prefer intent-preserving LaTeX over pretty-looking LaTeX".

Bib(La)TeX be crazy.

## You are a hardcore LaTeX user

If you'd really just rather hand-code your LaTeX constructs, BBT makes that possible:

* You can add literal LaTeX anywhere in your reference by surrounding it with `<pre>....</pre>` tags. BBT will
  convert to/from unicode and (un)escape where required but will pass whatever is enclosed in the pre tags unchanged.
* An entry tagged with `#LaTeX` (case-sensitive!) will have all fields exported as if they're wrapped in
  `<pre>...</pre>`, so you can include LaTeX markup in your references. <!-- If you enable "Raw BibTeX import" in the preferences, BibTeX imports will not be
  escaped on import, and will automatically be tagged for raw export. -->
