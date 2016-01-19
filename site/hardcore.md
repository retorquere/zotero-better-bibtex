---
title: "Going hardcore; Zotero as a BibTeX manager"
nav: Going hardcore
---

If you'd really just rather hand-code your LaTeX constructs, BBT makes that possible:

* You can add literal LaTeX anywhere in your reference by surrounding it with &lt;pre&gt;....&lt;/pre&gt; tags. BBT will
  convert to/from unicode and (un)escape where required but will pass whatever is enclosed in the pre tags unchanged.
* An entry tagged with "#LaTeX" (case-sensitive!) will have all fields exported as-is, so you can include
  LaTeX markup in your references. If you enable "Raw BibTeX import" in the preferences, BibTeX imports will not be
  escaped on import, and will automatically be tagged for raw export.
