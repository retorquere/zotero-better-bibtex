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
in-text citations as `[@citekey]` when you ask Zotero to render the bibliography. If you want LaTeX, modify the
style accordingly. You can then put your document through pandoc or whatnot to get LaTeX/Markdown.

For the curious, BBT does this by patching in the `citation-key`
variable in the CSL processing so it can be rendered using a CSL
style. If you previously used the `citeprocNoteCitekey` preference,
that is now gone, so you'll have to update the style you used.

Update: pandoc now supports docx+citations as input format and will export your word documents into pandoc-compatible markdown with citations! That should be a much smoother experience:

```
pandoc -f docx+citations -t markdown -i Aristotle.docx -o Aristotle.md
```

should do the trick!
