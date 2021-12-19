---
title: Migrating from Word/Libreoffice
weight: 5
tags:
  - citation keys
  - word
  - libreoffice
---

So you have decided that enough is enough, and you want to migrate
your existing Word/Libreoffice document to LaTeX/Markdown. Plenty
(well...) tools exist to help with the migration of your document
content, pandoc being the most prominent one, but one thing none
of them will do is keep your citations intact. This will not do.

If you install [this](better-bibtex-citekeys.csl) CSL style in
Zotero (or modify it further and use that), Zotero will render the
in-text citations as `[@citekey]`. If you want LaTeX, modify the
style accordingly. BBT does this by patching in the `citation-key`
variable to make it available to the CSL processor.

