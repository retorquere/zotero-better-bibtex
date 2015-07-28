# Better Bib(La)TeX (BBT) for Zotero [![Build Status](https://travis-ci.org/ZotPlus/zotero-better-bibtex.svg?branch=master)](https://travis-ci.org/ZotPlus/zotero-better-bibtex)

This extension aims to make Zotero effective for us LaTeX holdouts. At its core, it behaves like any Zotero
import/export module; anywhere you can export or import bibliography items in Zotero, you'll find Better Bib(La)TeX
listed as one of the choices. If nothing else, you could keep your existing workflow as-is, and just enjoy the emproved
LaTeX &lt;-&gt; unicode translation on im-and export. Over and above this improvement, it will give you

* Stable, configurable [citation keys](https://zotplus.github.io/better-bibtex/citation-keys.html)
* No more [Unicode problems](https://zotplus.github.io/better-bibtex/unicode.html)
* A way to go [whole-hog](https://zotplus.github.io/better-bibtex/hardcore.html) for BibTeX
* Other [niceties](https://zotplus.github.io/better-bibtex/niceties.html)

BBT works from [BibTeXing](http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf) and [Tame the
BeaST](http://www.lsv.ens-cachan.fr/~markey/BibTeX/doc/ttb_en.pdf) for BibTeX, and
[The Biblatex Package](http://ctan.mirrorcatalogs.com/macros/latex/contrib/biblatex/doc/biblatex.pdf) for BibLaTeX, but
since there isn't really a definitive manual for either format that is universally followed by Bib(La)TeX
editors/processors, I'm pragmatic about implementing what works.

# Configuration

The Better BibTeX configuration pane can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases. Install by downloading the [latest
version](https://github.com/ZotPlus/zotero-better-bibtex/releases/download/1.2.2/zotero-better-bibtex-1.2.2.xpi)
(**1.2.2**).
If you are not prompted with a Firefox installation dialog then double-click the
downloaded xpi; Firefox ought to start and present you with the installation dialog.

For standalone Zotero, do the following:

1. In the main menu go to Tools > Add-ons
2. Select 'Extensions'
3. Click on the gear in the top-right corner and choose 'Install Add-on From File...'
4. Choose .xpi that you've just downloaded, click 'Install'
5. Restart Zotero

# Got problems? We got fixes!

If you have any questions on the use of the plugin, please do not hesitate to file a GitHub issue to ask for help. If
you're reporting a bug in the plugin, please take a moment to glance through the [Support Request Guidelines](https://zotplus.github.io/support.html); it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes. The
guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines
simply express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I
prefer fuzzy ones over missed ones.

# Plans

* add "citekey" field to reference editor
* sync citekey cleanly without abusing the "extra" field
* faster journal abbreviator using the [LTWA](http://www.issn.org/services/online-services/access-to-the-ltwa/)

Submission to Addons.Mozilla.Org is off the table -- AMO moves *much* to slow for my sometimes daily releases.

## Known problems

Before submitting an issue, please make sure this isn't a known problem. Known problems are either already on my radar,
or there are problems preventing me from implementing a fix.

* **Odd characters after import**. Zotero doesn't seem to handle importing of non-utf8 files particularly gracefully. If
  you're coming from JabRef, please verify in JabRef using file-database properties that your bibliography is saved in
  utf-8 format before importing.

<script type="text/javascript">

  switch (window.location.hash.trim()) {
    case '#xpi':
      window.location = 'https://github.com/ZotPlus/zotero-better-bibtex/releases/download/1.2.2/zotero-better-bibtex-1.2.2.xpi';
      break;
    case '#debug':
      window.location = 'https://drive.google.com/a/iris-advies.com/folderview?id=0B8tW4NMPfEosfkFETUV0V2l0N3NHZHEyQk5SUm03TjZmS1RoVmlBTmdHclUtcTRzZ2VHclU&usp=drive_web#list';
      break;
  }

</script>
