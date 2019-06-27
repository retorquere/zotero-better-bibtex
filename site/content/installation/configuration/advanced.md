---
tags:
- configuration
- preferences
title: Advanced
weight: 14
---

#### Deterministically order references and fields; primarily for version control.

default: `no`

When on, BBT will deterministically order references on export. This is primarily interesting if you keep the exported file under some kind of version control. Comes at performance and memory consumption cost.

#### postscript

default: `<not set>`

Snippet of javascript to run [after each reference generation]({{< ref "scripting" >}}).

#### Expand the @string vars below during imports

default: `yes`

When enabled, BBT will prepend the @strings section below to all Bib(La)TeX imports and will expand the strings during export.

#### If a field could be a @string var, export it without braces

default: `No`

When enabled, BBT will try to retain @string vars its exports unsurrounded by braces; when set to 'detect', single-word strings will be assumed to be externally-defined @string vars,
when set to 'match', only @strings declared in the @strings section of the preferences will be preserved. If you don't know what this means, leave it off.

Options:

* No
* Assume single-word fields to be @string vars
* Match against the @string vars below

#### @string definitions

default: `<not set>`

If you have externally maintained @string vars paste them here and they will be resolved for subsequent imports

#### Warn me when changing citation keys in bulk

default: `10`

For those who are curious about what the "Clear/Generate BibTeX key" right-click options do, this will warn
you if you are doing this on more than 10 (default) at the same time, to prevent your curiosity from changing
all your citation keys at once.

#### Warn me when auto-exports take longer than (seconds)

default: `10`

If you have auto-export set up for a large library, Zotero might freeze for during exports. There is nothing I can do about this; caching helps,
but all Zotero exports freeze Zotero while they are running. BBT will warn you if it sees a long-running auto-export to suggest running it only
when Zotero goes idle.