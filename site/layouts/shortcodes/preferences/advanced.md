{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### postscript

Snippet of javascript to run [after each reference generation]({{ ref . "scripting" }}).

#### @string definitions

If you have externally maintained @string vars paste them here and they will be resolved for subsequent imports

### Export

#### Apply title-casing to titles

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, you can turn this off to suppress [title casing for English references]({{ ref . "support/faq#bbt-is-changing-the-capitalization-of-my-titles-why" }}).

#### Apply brace-protection to capitalized words

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice and the Zotero recommendations on title/sentence
casing, you can turn this off to suppress [automatic brace-protection for words with uppercase letters]({{ ref . "support/faq#why-the-double-braces" }}).

### Import

#### Sentence-case titles on import:

Bib(La)TeX references ought to be stored in Title Case; Zotero references are expected to be entered as sentence-case. With this option on, BBT will try to sentence-case
during import. This sentence-casing uses heuristics, no natural language processing is performed, and the results are not perfect. You can turn this off, but you may then also want
to disable `Apply title-casing to titles` (which has its own problems, see the help entry for that option on this page). With 'yes, but try to exclude already-sentence-cased titles', BBT will attempt to detect
titles that are already sentence cased and leave them as-is on import.

Options:

* yes, but try to exclude already-sentence-cased titles
* yes
* no (import titles as-is)

#### Insert case-protection for braces:

On import, BBT will add case-protection (<span class="nocase">...<span>) to titles that have words in {Braces}. There's plenty of bib(la)tex files
out there that do this a little overzealously, and you may not like the resulting HTML code in your items, even though this is what the braces mean in bib(la)tex, and
Zotero supports it. If you turn this off, the markup is omitted during import. When you select `yes`, all braces that bib(la)tex would interpret as case protection ([which is
not all of them]({{ ref . "support/faq#why-the-double-braces" }})) are converted to `span` elements. In `as-needed` mode, the number of `span` elements is minimized.

Options:

* minimal
* yes
* no

### @string definitions

#### Expand the @string vars below during imports

When enabled, BBT will prepend the @strings section below to all Bib(La)TeX imports and will expand the strings during export.

#### If a field could be a @string var, export it without braces

When enabled, BBT will try to retain @string vars its exports unsurrounded by braces; when set to 'detect', single-word strings will be assumed to be externally-defined @string vars,
when set to 'match', only @strings declared in the @strings section of the preferences will be preserved. If you don't know what this means, leave it off.

Options:

* No
* Assume single-word fields to be @string vars
* Match against the @string vars below

### Citation keys

#### Warn me when changing citation keys in bulk

For those who are curious about what the `Clear/Generate BibTeX key` right-click options do, this will warn
you if you are doing this on more than 10 (default) at the same time, to prevent your curiosity from changing
all your citation keys at once.


