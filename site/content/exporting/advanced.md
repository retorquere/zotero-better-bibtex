---
title: Advanced
weight: 7
aliases:
  - /hardcore
  - /Going-hardcore
---
## You are a hardcore LaTeX user

If you'd really just rather hand-code your LaTeX constructs, BBT makes that possible:

* You can add literal LaTeX anywhere in your reference by surrounding it with `<script>...</script>` (`<pre>...</pre>` will also work for historical reasons) markers. BBT will
  convert to/from unicode and (un)escape where required but will pass whatever is enclosed in the pre tags unchanged.
* An entry tagged with `#LaTeX` (case-sensitive!) will have all fields exported as if they're wrapped in
  `<script>...</script>`, so you can include LaTeX markup in your references.

## Recognizing initials in names

In names, you can force first names like `Philippe` to be exported to `{\relax Ph}ilippe` (which causes it to get initial `Ph.` rather than `P.` in styles that do initials) by adding a [end of guarded area](http://www.fileformat.info/info/unicode/char/0097/index.htm) character between `Ph` and `ilippe`.
