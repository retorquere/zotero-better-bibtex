

{{% preferences/header %}}

## Fields

### When merging items, also merge:

#### their citation keys into an bib(la)tex `ids` field

default: `no`

When merging items, also merge their citation keys into an bib(la)tex `ids` field.


#### fields that are understood to be CSL fields by Zotero

default: `no`

When merging items, also merge fields that are understood to be CSL fields by Zotero.


#### their `tex.*` fields

default: `no`

When merging items, also merge their `tex.*` fields.


## @string definitions

### Expand the @string vars below during imports

default: `yes`

When enabled, BBT will prepend the @strings section below to all Bib(La)TeX imports and will expand the strings during export.


### If a field could be a @string reference, export it as an unbraced @string reference

default: `No`

When enabled, BBT will try to retain @string vars its exports unsurrounded by braces; when set to 'detect', single-word strings will be assumed to be externally-defined @string vars,
when set to 'match', only @strings declared in the @strings section of the preferences will be preserved. If you don't know what this means, leave it off.


Options:

* No
* Assume single-word fields to be @string vars
* Match against the @string declarations below
* Match against the @string declarations and their values below


