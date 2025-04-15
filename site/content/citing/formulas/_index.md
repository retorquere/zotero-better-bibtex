---
title: Formulas
tags:
  - citation keys
---

## Functions

{{< citekey-formatters/functions >}}

**Note**: All `auth...` functions will fall back to editors if no authors are present on the item.

**Note**: The functions above used to have the `clean` function automatically applied to them, **this is no longer the case**, so if you have CJK authors/titles and you want to manipulate them (using eg. `capitalize`), you could have to use `transliterate` on them first, eg. `authEtal2.transliterate.capitalize + year + shorttitle(3, 3)`.

## Direct access to unprocessed fields ("Field functions")

The above functions all retrieve information stored in the item's fields and process it in some way. If you don't want this, you can instead call field contents without any processing. To access Zotero fields, refer to them as given in the table below:

{{< citekey-formatters/fields >}}

(fields marked <sup>Z</sup> are only available in Zotero, fields marked with <sup>JM</sup> are only available in Juris-M).

## Filters

{{< citekey-formatters/filters >}}

*Usage note*: the functions `condense`, `skipwords`, `capitalize` and `select` rely on whitespaces for word handling. Most functions strip
whitespace and thereby make these filter functions sort of useless. You will in general want to use the fields from the
table above, which give you the values from Zotero without any changes. The fields with `**` are only available in Juris-M.
