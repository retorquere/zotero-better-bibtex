# Zotero: Better Bib(La)TeX [![Build Status](https://travis-ci.org/ZotPlus/zotero-better-bibtex.svg?branch=master)](https://travis-ci.org/ZotPlus/zotero-better-bibtex)

This extension aims to make Zotero effective for us LaTeX holdouts. At its core, it behaves like any Zotero
import/export module; anywhere you can export or import bibliography items in Zotero, you'll find Better Bib(La)TeX
listed as one of the choices. If nothing else, you could keep your existing workflow as-is, and just enjoy the emproved
LaTeX &lt;-&gt; unicode translation on im-and export. Over and above this improvement, it adds the following features to
Zotero:

* Stable **[Citation Keys](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**, without key clashes! Generates citation keys that take into account other existing keys in your library
  that are not part of the items you export. Prevent random breakage!
* Adds citation key column to the reference list view
* **Converts from/to HTML/LaTeX**: Currently supports &lt;i&gt;&#8660;\emph &amp; \textit, &lt;b&gt;&#8660;\textbf,
  &lt;sup&gt;&#8660;\_{...}
  and &lt;sub&gt;&#8660;^{...}; more can
  be added on request. Finally add italics and super/supscript to your titles! The plugin contains a comprehensive list
  of LaTeX constructs, so stuff like \"{o} or \"o will be converted to their unicode equivalents on import. If you need
  literal LaTeX in your export: surround it with &lt;pre&gt;....&lt;/pre&gt; tags.
* Integration with **[Report Customizer](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**
* Set your own, fixed **[Citation Keys](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**, generate citation keys from JabRef patterns, drag and drop LaTeX citations, add other custom BibLaTeX fields
* **[Customized Exports](https://zotplus.github.io/better-bibtex/Customized-Exports.html)**
* **Jabref groups import/export**: During import, if JabRef explicit (not dynamic) groups are present, collections will
  be created to mirror these. During export, collections will be added to the export as explicit jabref groups.
* **Fixes date field exports**: export dates like 'forthcoming' as 'forthcoming' instead of empty.
* **[Pull Export](https://zotplus.github.io/better-bibtex/Pull-Export)** from the embedded webserver
* Automatic **[journal abbreviation](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**

Experimental:

* Raw LaTeX import-export. An entry tagged with "#LaTeX" (case-sensitive!) will be exported as-is, so you can include
  LaTeX markup in your references. If you enable "Raw BibTeX import" in the preferences, BibTeX imports will not be
  escaped on import, and will automatically be tagged for raw export.

## Configuration

The Better BibTeX [configuration pane](https://zotplus.github.io/better-bibtex/Customized-Exports.html) can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases. Install by downloading the [latest
version](https://zotplus.github.io/better-bibtex/zotero-better-bibtex-0.6.61.xpi)
(**0.6.61**).
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
you're reporting a bug in the plugin, please take a moment to glance through the [Support Request Guidelines](https://zotplus.github.io/better-bibtex/Support-Request-Guidelines.html); it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes. The
guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines
simply express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I
prefer fuzzy ones over missed ones.

# Plans

* Automated background export (#70): IN POGRESS
  * Groundwork for caching (required to keep performance acceptable): DONE
  * Caching: IN PROGRESS
  * Automated export
  * GUI for it all
* Scholarly Markdown support
* add "citekey" field to reference editor
* sync citekey cleanly without abusing the "extra" field
* faster journal abbreviator using the [LTWA](http://www.issn.org/services/online-services/access-to-the-ltwa/)
* porting the bibtex parser to Jison for performance improvements

Submission to Addons.Mozilla.Org is off the table -- AMO moves *much* to slow for my sometimes daily releases.
