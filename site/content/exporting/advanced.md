---
title: Advanced
weight: 9
aliases:
  - /hardcore
  - /going-hardcore
---
## You are a hardcore LaTeX user

If you'd really just rather hand-code your LaTeX constructs, BBT makes that possible:

* You can add literal LaTeX anywhere in your item by surrounding it with `<script>...</script>` (`<pre>...</pre>` will also work for historical reasons) markers. BBT will
  convert to/from unicode and (un)escape where required but will pass whatever is enclosed in the pre tags unchanged.
* An entry tagged with `#LaTeX` (case-sensitive!) will have all fields exported as if they're wrapped in
  `<script>...</script>`, so you can include LaTeX markup in your items.

## Recognizing initials in names

In names, you can force first names like `Philippe` to be exported to `{\relax Ph}ilippe` (which causes it to get initial `Ph.` rather than `P.` in styles that do initials) capitalizing the letters you want to have used as the initials, so `PHilippe`.
