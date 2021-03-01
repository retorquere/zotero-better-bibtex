{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### postscript

default: `<not set>`

Snippet of javascript to run [after each reference generation]({{ ref . "exporting/scripting.md" }}).

#### @string definitions

default: `<not set>`

If you have externally maintained `@string` vars paste them here and they will be resolved for subsequent imports. These should be entered as `@string` declarations, such as `@string{IEEE_J_PWRE = "{IEEE} Transactions on Power Electronics"}`, not just the var name.

### Export

#### Apply title-casing to titles

default: `yes`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress [title casing for English references]({{ ref . "support/faq#bbt-is-changing-the-capitalization-of-my-titles-why" }})

#### Apply case-protection to capitalized words by enclosing them in braces

default: `yes`

If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress [automatic brace-protection for words with uppercase letters]({{ ref . "support/faq#why-the-double-braces" }}).

#### Retain export cache across upgrades

default: `no`

By default, BBT clears all caches whenever BBT or Zotero is upgraded. I can't realistically predict whether a change in Zotero or BBT is going to affect the output generated for any given item, so to be sure you always have the latest export-affecting fixes, the caches are discarded when a new version of either is detected. If you have a very large library however, of which you regularly export significant portions, you might want to retain the cached items even if that does come with the risk that you get wrong output on export that has been fixed in the interim.

If you have this on, and you experience any problem that is not the cache getting dropped on upgrade, you *must* clear the cache and reproduce the problem. When you change this setting, as with any setting change, the cache will be dropped.

#### Parallel background exports:

default: `1`

BBT can now perform its exports in a separate thread, and should no longer block Zotero's UI pretty much regardless of how large your library is. The default of 1 parallel export should suit most needs, but if you have many auto-exports set up, you may want to raise the maximum parallel exports to prevent queueing of exports. It is possible to turn background exports off by setting this value to `0` in the hidden preferences; you will get the old (blocking) behavior back, but you can't complain about Zotero being laggy during auto-exports. All Zotero exports are blocking, and it's a minor miracle I got background exports to work at all.

### Import

#### Sentence-case titles on import:

default: `yes, but try to exclude already-sentence-cased titles`

Bib(La)TeX references ought to be stored in Title Case; Zotero references are expected to be entered as sentence-case.

With this option on, BBT will try to sentence-case during import. This sentence-casing uses heuristics, no natural language processing is performed, and the results are not perfect.

You can turn this off, but you may then also want to disable `Apply title-casing to titles` (which has its own problems, see the help entry for that option on this page). With 'yes, but try to exclude already-sentence-cased titles', BBT will attempt to detect titles that are already sentence cased and leave them as-is on import.

Options:

* yes, but try to exclude already-sentence-cased titles
* yes
* no (import titles as-is)

#### Insert case-protection for braces:

default: `minimal`

On import, BBT will add case-protection (<span class="nocase">...<span>) to titles that have words in {Braces}.

There's plenty of bib(la)tex files out there that do this a little overzealously, and you may not like the resulting HTML code in your items, even though this is what the braces mean in bib(la)tex, and Zotero supports it.

If you turn this off, the markup is omitted during import. When you select 'yes', all braces that bib(la)tex would interpret as case protection ([which is not all of them]({{ ref . "support/faq#why-the-double-braces" }})) are converted to `span` elements. In `minimal` mode, the number of `span` elements is minimized.

Options:

* minimal
* yes
* no

### @string definitions

#### Expand the @string vars below during imports

default: `yes`

When enabled, BBT will prepend the @strings section below to all Bib(La)TeX imports and will expand the strings during export.

#### If a field could be a @string reference, export it as an unbraced @string reference

default: `No`

When enabled, BBT will try to retain @string vars its exports unsurrounded by braces; when set to 'detect', single-word strings will be assumed to be externally-defined @string vars, when set to 'match', only @strings declared in the @strings section of the preferences will be preserved. If you don't know what this means, leave it off.

Options:

* No
* Assume single-word fields to be @string vars
* Match against the @string declarations below
* Match against the @string declarations and their values below

### Citation keys

#### Warn me when changing citation keys in bulk

default: `10`

For those who are curious about what the `Clear/Generate BibTeX key` right-click options do, this will warn you if you are doing this on more than 10 (default) at the same time, to prevent your curiosity from changing all your citation keys at once.

#### their citation keys into an bib(la)tex `ids` field

default: `no`

When merging items, also merge their citation keys into an bib(la)tex `ids` field.

#### fields that are understood to be CSL fields by Zotero

default: `no`

When merging items, also merge fields that are understood to be CSL fields by Zotero.

#### their `tex.*` fields

default: `no`

When merging items, also merge their `tex.*` fields.


