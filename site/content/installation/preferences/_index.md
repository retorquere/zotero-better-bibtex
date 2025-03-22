---
aliases:
  - /Configuration
  - /configuration
tags:
  - configuration
  - cache
title: Citation keys
weight: 10
---


{{% preferences/header %}}

## Active citation key formula

default: `auth.lower + shorttitle(3,3) + year`

Set the pattern used to generate citation keys. The format of the keys is documented [here]({{ ref . "citing" }}).


## Force citation key to plain text

default: `yes`

If you have deviated from the default citation key format pattern by [specifying your own]({{ ref . "citing" }}), you may
wind up with non-ASCII characters in your citation keys. You can prevent that using the `fold` function at the
appropriate place in your pattern, but checking this checkbox will just apply `fold` to all your keys.



## Enable citation key search

default: `yes`

Enable searching on citation keys. Slows down startup on very large libraries. Requires Zotero restart to enable/disable.


## Automatically pin citation key after

default: `0`

When &gt; 0, BBT will automatically pin the first citation keys it generates for an item after this many seconds.


## Keeping citation keys unique

### Ignore upper/lowercase when comparing for uniqueness

default: `yes`

Treat "AugusteComte" and "augustecomte" as the same key when testing for uniqueness


### Keep keys unique

default: `within each library`

Auto-generated (non-pinned) keys automatically get a postfix when they would generate a duplicate. By default, the check for duplicates is restricted
to the library/group the item lives in. When set to global, the check will include all libraries/groups, so auto-generated keys would be globally
unique. Changing this setting *does not* affect existign keys - for this you would need to select the items and refresh the keys.


Options:

* across all libraries
* within each library


### On conflict with a pinned key, non-pinned keys will be

default: `kept (causes key duplicates)`

This determines what happens if you pin a key to a value that is already in use in a different item but not pinned there.
Neither are ideal, you just get to pick your poison. If you let BBT change the non-pinned key by adding a postfix character,
the citation key changes which could be problematic for existing papers. If you keep the non-pinned key as-is, your library now has duplicate keys.


Options:

* postfixed (causes key changes)
* kept (causes key duplicates)


## Ideographs in citekeys

### Apply kuroshiro romajization in Japanese names/titles. Uses a lot of memory.

default: `no`

When on, BBT will load kuroshiro for romajization in citation keys. This uses a lot of memory, easily 100MB. If you don't have Japanese titles/names, keep this off.


### Enable 'jieba'/'pinyin' filters in citekey patterns. Uses a lot of memory.

default: `no`

When on, BBT will make Chinese word segmentation (jieba) and transliteration (pinyin) available for citation keys generation. This uses a lot of memory, easily 70MB, and adds several seconds to the startup time of BBT. If you don't have Chinese titles/names, keep this off.


## Warn me when changing citation keys in bulk

default: `10`

For those who are curious about what the `Clear/Generate BibTeX key` right-click options do, this will warn
you if you are doing this on more than 10 (default) at the same time, to prevent your curiosity from changing
all your citation keys at once.



