# Zotero: Better Bib(La)TeX [![Build Status](https://travis-ci.org/ReichenHack/zotero-better-bibtex.svg?branch=master)](https://travis-ci.org/ReichenHack/zotero-better-bibtex)

This extension aims to make Zotero effective for us LaTeX holdouts. It adds the following features:

* **Converts from/to HTML/LaTeX**: Currently supports i/\emph/\textit, b/\textbf, sup/\_{...} and sub/^{...}; more can
  be added on request. Finally add italics and super/supscript to your titles! The plugin contains a comprehensive list
  of LaTeX constructs, so stuff like \"{o} or \"o will be converted to their unicode equivalents on import.
* Integration with **[Report Customizer](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Citation-Keys)**
* Set your own, fixed **[Citation Keys](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Citation-Keys)**, generate citation keys from JabRef patterns, drag and drop LaTeX citations, add other custom BibLaTeX fields
* **[Customized Exports](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Customized-Exports)**
* **Jabref groups import/export**: During import, if JabRef explicit (not dynamic) groups are present, collections will
  be created to mirror these. During export, collections will be added to the export as explicit jabref groups.
* **Fixes date field exports**: export dates like 'forthcoming' as 'forthcoming' instead of empty.
* **[Pull Export](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Pull-Export)** from the embedded webserver

## Configuration

The Better BibTeX [configuration pane](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Customized-Exports) can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases. Install by downloading the [latest
version](https://raw.github.com/ReichenHack/zotero-better-bibtex/master/zotero-better-bibtex-0.5.16.xpi) (**0.5.16**,
released on 2014-05-20 15:29). If you are not prompted with a Firefox installation dialog then double-click the
downloaded xpi; Firefox ought to start and present you with the installation dialog.

For standalone Zotero, do the following:

1. In the main menu go to Tools > Add-ons
2. Select 'Extensions'
3. Click on the gear in the top-right corner and choose 'Install Add-on From File...'
4. Choose .xpi that you’ve just downloaded, click 'Install'
5. Restart Zotero

# Got problems? We got fixes!

Before submitting an issue, please go through the [Support Request Guidelines](https://github.com/ReichenHack/zotero-better-bibtex/wiki/Support-Request-Guidelines); it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes.

# Plans

* add "citekey" columns to reference list view
* Submission to Mozilla Extension registry
