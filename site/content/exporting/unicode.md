---
title: Unicode
weight: 8
---
## LaTeX en unicode

If you're lucky and you live in the 21st century or later, you can just use unicode in BibLaTeX and you don't have to bother about anything that follows except if you're the curious kind.

Some of us though are bound to outlets that still demand BibTeX, and there's geezers like me who just prefer the aesthetic of TeX commands over fancy-schmancy unicode, or you find TeX commands easier to search for in your doc than having to memorize how to enter `Ψ`. BBT has an extensive map of unicode characters, but translating unicode to TeX comes with a massive downside -- support for non-ascii characters is scattered across a myriad of packages that you will have to `usepackage` into your document. The default set are supported by your latex distribution, and require nothing extra in your preamble, but to to that I've had to make some compromises. You can amend those choices by telling BBT you have extra packages available. BBT can export commands from the following packages:

<!-- generated tables below -->

discard this
