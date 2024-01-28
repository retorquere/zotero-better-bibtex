---
title: Frequently Asked Questions
weight: 5
menuTitle: FAQ
aliases:
  - /Unnecessarily-complicated-BibTeX-output
  - /Unicode-and-Markup
  - /unicode
  - /From-Unicode-to-LaTeX-and-Back-Again
  - /Unnecessarily-complicated-BibTeX-output
  - /all-them-braces
tags:
  - export
---

## Add-on could not be installed because it appears to be corrupt.

You have downloaded the Better BibTeX plugin by clicking on the
download link using Firefox. As Zotero and Firefox use the same
plugin technology, Firefox think the BetterBibTeX plugin is intended
for itself, tries to install it, and then finds out it won't work.
You need to download the plugin without installinging it into Firefox
by right-clicking the download link, choose save-as, and then install
it into Zotero using [installation instructions]({{% ref "/installation" %}}) to get started with BBT.

## BBT is changing the capitalization of my titles -- why?

There isn't a straightforward one-to-one mapping for all Zotero to Bib(La)TeX
fields. For most I can make reasonable choices, but there are some things where
Better BibTeX takes a little more liberties with your items in order to get
sensible output.

Title fields in particular are a total mess. Zotero [recommends having your
titles in sentence
case](https://zotero-manual.github.io/adding-items/#sentence-and-title-case)
because that's what the embedded citation processor expects, but of course,
BibLaTeX expects your titles to be in Title Case... *but only if they're in
English*. Nice. In order to translate the Zotero recommendation into Bib(La)TeX
best practice, BBT will title-case the titles of English items. English
items, as far as BBT is concerned, are those items that have their
language explicitly set to an English language (`american` counts as English for
example), and those items that have no explicit language set. To do this,
BBT uses the same title-caser that Zotero uses to produce title-cased styles
such as Chicago.

The titles so modified will then pass through your Bib(La)TeX processor, which
will in turn try to lowercase or initial-caps some words and not others -- for
English items. But then sometimes, you want words that have capitals to
keep. BBT assumes that if a word has at least one capital letter (subject to
some rather complex exceptions) you meant it to be there, and you want BibTeX to
leave it alone no matter what. To do that, it wraps those (strings of) words in
those double braces. This is to let BibTeX know that `ISDN` may not be changed
to `isdn` or `Isdn`, regardless of the bibliography style in play.

The simplest approach would be to wrap title fields in extra braces as a whole,
and some sites will erroneously recommend doing so, but as per Mencken, for
every complex problem there is an answer that is clear, simple, and wrong; the
rules for bib(la)tex capitalization are complex, and this is one of those
answers that gets it entirely wrong, even if it will seem to work. There are
styles do need to recapitalize parts of the title (for example to selectively
downcase the titlecasing), and having the whole field so wrapped interferes with
that. So Better BibTeX wraps individual words -- or strings of those words --
that have capitals in them with double braces.

For English titles BBT will Title Case and brace-protect your titles on output.
Except, those Title Cased words which BBT changed itself will *not* be wrapped
in double-braces, as it *is* OK for the styles to change casing for those,
depending on the style at play. So `I like ISDN heaps better than dialup` would
output to `I Like {{ISDN}} Heaps Better than Dialup`. Apparently non-English
titles are supposed to be in sentence case, so BBT doesn't touch those.

You can steer this process somewhat by enclosing the parts you don't want case
manipulation on in `<span class="nocase">...</span>`. Anything between those
won't be touched by Zotero or BBT. This is formally supported by Zotero and will
work in the Word/LibreOffice plugins as well as in the BibTeX export. This will
be required for words you wish to always keep lowercase, for example. Also, if
you don't generally use Zotero for generating bibliographies but just for BibTeX
reference management, you can turn on the hidden preference
[suppressTitleCase]({{% ref
"installation/preferences/hidden-preferences#suppresstitlecase" %}}) to keep BBT
from applying title-casing, but take note that if you do this, the
bibliographies you get from Zotero and the bibliograhies you get through
Bib(La)TeX will differ, and you can't complain about this.

## Why the double braces?

But why then the double-braces (`{{...}}`) rather than the commonly recommended
single braces (`{...}`)?

This is not because of some arcane aesthetic preference, but because the
Bib(La)TeX case protection rules are incredibly convoluted
([#541](https://github.com/retorquere/zotero-better-bibtex/issues/541),
[#383](https://github.com/retorquere/zotero-better-bibtex/issues/383)). For
example, here are some "interesting" cases that BBT has learned to deal with.
Did you know that

*   `{\emph{Homo sapiens}}` *un*-case-protects `Homo sapiens`? It sure was a
    surprise to me. So `\emph{Homo sapiens}` is case-protected (will not be
    recapitalized by Bib(La)TeX), but `{\emph{Homo sapiens}}` *is not*
    case-protected so it *will* be recapitalized. So to get predictable
    behavior, this is written out as `{{\emph{Homo sapiens}}}`.
*   casing behavior over the *whole* entry field depends on [whether there's
    a slash-command at the first
    position](https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240156274)
    of the title?
*   [apparently](https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240999396),
    to make sure that `Reading HLA Hart's: <i>The Concept of Law</i>` renders as
    expected means I have to output the astoundingly ugly `{Reading {{HLA
    Hart}}'s: {{{\emph{The Concept}}}}{\emph{ of }}{{{\emph{Law}}}}}`?

To make matters even more complex, so many people have in the past wrongly
recommended to "just wrap everything in one extra set of braces" that biblatex
now ignores exactly that pattern (see
[here](https://tex.stackexchange.com/a/327387/27603) and
[here](https://tex.stackexchange.com/a/233976/27603)).

The double-bracing is the only unambiguous rule I could construct that
consistently gets the rendered entries right (so far).

Bib(La)TeX provides a never-ending stream of edge cases, which BBT tries to
decide algorithmically. I try to keep the resulting file as pretty as I can (I'm
sensitive to the aesthetics myself), but the target is best described as "given
reasonable input, generate well-rendering output", and
reasonable-to-well-rendering in the BBT case will have to include "follows
Zotero recommendations for storing items" and "prefer intent-preserving
LaTeX over pretty-looking LaTeX".

Bib(La)TeX be crazy.

## But why *so many* double braces?

Zotero expects titles to be entered in sentence case; bib(la)tex
expects them to be entered in Title Case. BBT converts titles to
title case to compensate for this. Zotero does allow for exceptions
to the sentence-case rule, which you can mark by surrounding them
with &lt;span class="nocase"&gt; ... &lt;/span&gt;, and BBT will
take that hint and use double braces (see previous sections) to
achieve the same effect in bib(la)tex. But BBT does one thing more
-- if BBT sees a word containing capital letters which is not at
the start of a (sub)sentence (such as the `ISDN` in `I like ISDN
heaps better than dialup`), it will assume it is a proper noun
(otherwise why would a word mid-sentence have a capital letter),
and *also* brace-protect it.

Unfortunately, there is a lot of variation in how titles are offered by the sites Zotero scrapes -- some sentence case, some title case -- so it is not at all uncommon for title-cased titles to (incorrectly) end up in Zotero, and as a result you'll get a lot of unnecesary braces. For example, if you (incorrectly!) have the following in Zotero:

> I Like ISDN Heaps Better than Dialup

BBT will export that as

> `title = {I {{Like ISDN Heaps Better}} than {{Dialup}}}`

which is clearly not correct. The proper way to fix this is to sentence case this in Zotero -- if you generate a bibliography through Zotero itself, there are styles where this title-cased title will not render correctly. But if you have a lot of these, and you do not care about the quality of the bibliographies generated by Zotero itself, you can disable the [title-casing]({{% ref "/installation/preferences/export#apply-title-casing-to-titles" %}}) and/or the [brace protection]({{% ref "/installation/preferences/export#apply-case-protection-to-capitalized-words-by-enclosing-them-in-braces" %}}).

## Importing JabRef databases

JabRef import works generally well but has a few gotchas:

*   If you have dynamic (query-based) groups these will not be imported.
*   If you have set a default folder for the PDF files in JabRef
    (`Options -> Preferences -> Linked Files -> Main File Directory`), the file paths in your JabRef database will be relative to that
    directory, but BBT can't read those preferences, so all attachments would
    fail to import. Make imports work with JabRef's library-specific setting `Library -> Library Properties -> General File Directory`.
    Make sure the latter path is correct, as JabRef might continue finding files and not notify you if it contains errors.

### Why Zotero + BBT instead of Mendeley?

Among the reasons to just prefer Zotero over Mendeley outright you will find:

* Mendeley is owned by Elsevier.
* Mendeley thinks you [cannot be trusted with your own data](https://www.zotero.org/support/kb/mendeley_import#mendeley_database_encryption)

But wrt bibtex export, I don't think the Mendeley engineers actively use bib(la)tex:

* Mendeley is still double-bracing titles -- a behavior so wrong (yet unfortunately ubiquitous), biblatex started [ignoring double-braced titles]() (see [here](https://tex.stackexchange.com/a/327387/27603) and [here](https://tex.stackexchange.com/a/233976/27603)).
* Mendeley uses CSL, so items should be entered in sentence case (as is the case in Zotero). But bib(la)tex expects title-case, so titles should be converted to title case during export. This is difficult, so Mendeley just doesn't bother doing it.
* Verbatim fields that should per spec be exported as regular fields by Mendeley. This will get you compilation errors.

## Exporting `language` fields in addition to `langid`

Zotero's `language` field exports to the biblatex field `langid` only, not bib(la)tex `language`. Zotero's `language` field and the biblatex `langid` field are supposed to contain only language tags that control formatting, e.g. capitalization of titles and hyphenation.

Biblatex's `language" field, by contrast, which has no equivalent in Zotero, is used to generate textual output in a formatted bibliography.

Exporting Zotero's `language` field to the biblatex field `language` would result in what are now merely language-dependent formatting instructions all of a sudden turned into textual output as well, breaking virtually every style on the biblatex side.

If you want the `language` field filled nonetheless, you can either use a BBT postscript, or the biblatex `langid` tags can still be used to selectively generate `language` fields that produce the output when rendered, assuming the aim is to eg have only items tagged as Japanese, i.e., containing biblatex `langid` fields whose contents begin with `ja` receive the string `[in Japanese]` in the formatted output.

In the following, biblatex's `\DeclareSourcemap` mechanism is used to generate such language fields at runtime. Details can be found in the biblatex manual.

```
\documentclass{article}
\begin{filecontents}[overwrite]{tmp.bib}
@article{UseLanguage,
  title = {Title of UseLanguage},
  author = {A. U. Thor Language},
  date = {1986},
  journaltitle = {Journal of Engineering},
  volume = {123},
  number = {28},
  pages = {1--12},
  language = {japanese}
}
@article{UseLangid,
  title = {Title of UseLangid},
  author = {A. U. Thor Langid},
  date = {1986},
  journaltitle = {Journal of Engineering},
  volume = {123},
  number = {28},
  pages = {1--12},
  langid = {Japanese}
}
@article{UseLangidAbbrev,
  title = {Title of UseLangidAbbrev},
  author = {A. U. Thor LangidAbbrev},
  date = {1986},
  journaltitle = {Journal of Engineering},
  volume = {123},
  number = {28},
  pages = {1--12},
  langid = {ja-JP}
}
@article{en,
  title = {Title of Something Completetly Different in English},
  author = {Doe, John},
  date = {2024},
  journaltitle = {Journal of Whatever},
  volume = {321},
  number = {1},
  pages = {33--77},
  langid = {en}
}
\end{filecontents}
\usepackage[sorting=none]{biblatex-chicago}
%\usepackage[sorting=none]{biblatex}
\addbibresource{tmp.bib}

\DeclareSourcemap{
  \maps[datatype=bibtex]{\map{
     \step[fieldsource=langid, matchi=\regexp{^ja},
   final]
  \step[fieldset=language, fieldvalue=Japanese]
    }
  }
}

\begin{document}
\nocite{*}
\printbibliography
\end{document}
```
