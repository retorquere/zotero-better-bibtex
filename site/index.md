---
title: Better BibTeX (BBT) for Zotero
nav: Home
layout: default
---

This extension aims to make Zotero effective for us text-based authoring holdouts; currently, that translates to the
LaTeX/Markdown crowd. At its core, it behaves like any Zotero import/export module; anywhere you can export or import bibliography items in Zotero, you'll find Better Bib(La)TeX/CSL JSON
listed as one of the choices. If nothing else, you could keep your existing workflow as-is, and just enjoy the improved
LaTeX &lt;-&gt; unicode translation on im-and export. Over and above this improvement, it will give you

* Stable, configurable [citation keys](citation-keys.html)
* No more [Unicode problems](unicode.html)
* A way to go [whole-hog](hardcore.html) for BibTeX
* Other [niceties](niceties.html)

BBT works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://ctan.mirrorcatalogs.com/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

# Configuration

The Better BibTeX configuration pane can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.
You can get also there by pasting [this link](chrome://zotero/content/preferences/preferences.xul#better-bibtex) in
Firefox. Clicking the link won't work, sorry.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases, so installation is a one-time procedure. You can
install BBT in ***either*** Standalone or Firefox; installing Zotero in both puts Zotero Standalone and Zotero Firefox in
what is called "connector mode", which is currently [not
supported](https://github.com/ZotPlus/zotero-better-bibtex/issues/143). Or, to be fully exact, you can have it installed
in both, but running both at the same time will have BBT break at indeterminate occasions. Recoverable, but not fun.

Start by downloading the [latest XPI](https://github.com/ZotPlus/zotero-better-bibtex/releases/latest), and then

## BBT for Zotero Firefox

If you downloaded BBT from Firefox you will usually be prompted with an installation dialog; if not, or if you
downloaded using another browser, double-click the downloaded xpi; Firefox ought to start and present you with the installation dialog.

## BBT for Zotero Standalone

1. In the main menu go to Tools > Add-ons
2. Select 'Extensions'
3. Click on the gear in the top-right corner and choose 'Install Add-on From File...'
4. Choose .xpi that you've just downloaded, click 'Install'
5. Restart Zotero

# Got problems? We got fixes!

If you have any questions on the use of the plugin, please do not hesitate to file a GitHub issue to ask for help. If
you're reporting a bug in the plugin, please take a moment to glance through the [Support Request Guidelines](/support.html); it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes. The
guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines
simply express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I
prefer fuzzy ones over missed ones.

# Plans

* add "citekey" field to reference editor
* sync citekey cleanly without abusing the "extra" field
* faster journal abbreviator using the [LTWA](http://www.issn.org/services/online-services/access-to-the-ltwa/)

BBT has traditionally not been hosted on addons.mozilla.org because the review process involved takes in the order of 10
weeks -- a *little* too slow for my tastes. As of Firefox 42, addons.mozilla.org involvement is going to be mandatory,
and miserable. I'm weighing my options.

## Known problems

Before submitting an issue, please make sure this isn't a known problem. Known problems are either already on my radar,
or there are problems preventing me from implementing a fix.

* **Odd characters after import**. Zotero doesn't seem to handle importing of non-utf8 files particularly gracefully. If
  you're coming from JabRef, please verify in JabRef using file-database properties that your bibliography is saved in
  utf-8 format before importing.

