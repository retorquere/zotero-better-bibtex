{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
#### @string definitions

default: `<not set>`

If you have externally maintained `@string` vars paste them here and they will be resolved for subsequent imports. These should be entered as `@string` declarations, such as `@string{IEEE_J_PWRE = "{IEEE} Transactions on Power Electronics"}`, not just the var name.

### Citation keys

#### their citation keys into an bib(la)tex `ids` field

default: `no`

When merging items, also merge their citation keys into an bib(la)tex `ids` field.

#### fields that are understood to be CSL fields by Zotero

default: `no`

When merging items, also merge fields that are understood to be CSL fields by Zotero.

#### their `tex.*` fields

default: `no`

When merging items, also merge their `tex.*` fields.

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

#### When scanning an AUX file, attempt to import references from the attached bib file when their citation keys are not in Zotero

default: `no`

By default, when scanning for cited items in the aux file, BBT will just generate a note listing all citation keys it cannot find in Zotero. When this option is turned on, BBT will attempt to import such missing items from the bib file that the AUX file being scanned points to.

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


