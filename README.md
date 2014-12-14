# Zotero: Better Bib(La)TeX (BBT) [![Circle CI](https://circleci.com/gh/ZotPlus/zotero-better-bibtex.svg?style=svg)](https://circleci.com/gh/ZotPlus/zotero-better-bibtex)

Recent changes:

**0.6.64**

* hide fallback 'zotero-null-id' keys in the 'extra' column
* extract cited items to a new .bib file (#118, LaTeX AUX scanner)

**0.6.63**

* fixes #125 ("Biblatex URL" doesn´t show up)

[more](https://zotplus.github.io/better-bibtex/changelog.html)

This extension aims to make Zotero effective for us LaTeX holdouts. At its core, it behaves like any Zotero
import/export module; anywhere you can export or import bibliography items in Zotero, you'll find Better Bib(La)TeX
listed as one of the choices. If nothing else, you could keep your existing workflow as-is, and just enjoy the emproved
LaTeX &lt;-&gt; unicode translation on im-and export. Over and above this improvement, it addresses the following
issues in Zotero:

## Citation keys

Zotero citations keys are fully auto-generated, using an algorithm that usually generates unique keys. For serious LaTeX
users, this presents the following problems:

* If a non-unique key is generated, which one gets postfixed with a distinguishing character is essentially
  non-deterministic.
* The keys are *always* auto-generated, so if you correct a typo in the author name, the key might change
* You can't see the citation keys until you export them

For a LaTeX author, the citation keys have their own meaning, fully separate from the other reference data, even if
people usually pick a naming scheme related to them. As the citation key is *the* piece of data that connects your
bibliography, this is a piece of data you want to have control over. BBT offers you this control:

* Set your own, fixed **[citation keys](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**
* Stable **[citation keys](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**, without key clashes. BBT generates citation keys that take into account other existing keys in your library
  in a deterministic way, regardless of what part of your library you export, or the order in which you do it.
* Drag and drop LaTeX citations to your favorite LaTeX editor
* Generate citation keys from JabRef patterns
* Shows both pinned (fixed) citation keys and dynamically generated ones in the reference list view
* Add other custom BibLaTeX fields
* Scan your AUX files to get a list of references specifically for your article (and incidentally list missing references)

## Unicode problems

Zotero does all its work in UTF-8 Unicode, which is absolutely the right thing to do. Unfortunately, for those shackled
to BibTeX and who cannot (yet) move to BibLaTeX, unicode is a major PITA. Also, Zotero supports some simple HTML markup
in your references that Bib(La)TeX won't understand; BBT will

* converts from/to HTML/LaTeX; Currently supports &lt;i&gt;&#8660;\emph &amp; \textit, &lt;b&gt;&#8660;\textbf,
  &lt;sup&gt;&#8660;\_{...}
  and &lt;sub&gt;&#8660;^{...}; more can
  be added on request.
* The plugin contains a comprehensive list of LaTeX constructs, so stuff like \"{o} or \"o will be converted to their unicode equivalents on import.

## Going hardcore: Zotero as a BibTeX manager

If you'd really just rather hand-code your LaTeX constructs, BBT makes that possible:

* You can add literal LaTeX anywhere in your reference by surrounding it with &lt;pre&gt;....&lt;/pre&gt; tags. BBT will
  convert to/from unicode and (un)escape where required but will pass whatever is enclused in the pre tags unchanged.
* An entry tagged with "#LaTeX" (case-sensitive!) will have all fields exported as-is, so you can include
  LaTeX markup in your references. If you enable "Raw BibTeX import" in the preferences, BibTeX imports will not be
  escaped on import, and will automatically be tagged for raw export.

## Other niceties

* Integration with **[Report Customizer](https://zotplus.github.io/better-bibtex/Citation-Keys.html)**
* **[Customized exports](https://zotplus.github.io/better-bibtex/Customized-Exports.html)**
* **Jabref groups import/export**: During import, if JabRef explicit (not dynamic) groups are present, collections will
  be created to mirror these. During export, collections will be added to the export as explicit jabref groups.
* **Fixes date field exports**: export dates like 'forthcoming' as 'forthcoming' instead of empty.
* **[Pull export](https://zotplus.github.io/better-bibtex/Pull-Export)** from the embedded webserver
* Automatic **[journal abbreviation](https://zotplus.github.io/better-bibtex/Citation-Keys.html)** to bring BibTeX export on par with the Word integration

# Configuration

The Better BibTeX [configuration pane](https://zotplus.github.io/better-bibtex/Customized-Exports.html) can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases. Install by downloading the [latest
version](https://zotplus.github.io/better-bibtex/zotero-better-bibtex-0.6.64.xpi)
(**0.6.64**).
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
  * Caching: DONE
  * Automated export
  * GUI for it all: IN PROGRESS
* Scholarly Markdown support
* add "citekey" field to reference editor
* sync citekey cleanly without abusing the "extra" field
* faster journal abbreviator using the [LTWA](http://www.issn.org/services/online-services/access-to-the-ltwa/)

Submission to Addons.Mozilla.Org is off the table -- AMO moves *much* to slow for my sometimes daily releases.
