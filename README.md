# Zotero: Better Bib(La)TeX [![Build Status](https://travis-ci.org/ReichenHack/zotero-better-bibtex.svg?branch=master)](https://travis-ci.org/ReichenHack/zotero-better-bibtex)

This extension aims to make Zotero effective for us LaTeX holdouts. It adds the following features:

## Converts embedded HTML tags to LaTeX on export

Currently supports i, b, sup and sub; more can be added on request. Finally add italics and super/supscript to your
titles!

## Imports your LaTeX and converts to unicode

As of 0.5.3 Better Bib(La)TeX cleanly import most LaTeX constructs; stuff like \"{o} or \"o will be converted to their
Unicode equivalents, and the import will recognize and convert \emph (italics), \TeXtit (italics), \TeXtbf (bold), \_{...}
(subscript) and ^{...} (superscript).

## Duplicate keys; integration with [Report Customizer](https://github.com/ReichenHack/zotero-report-customizer)

The plugin will generate bibTeX comments to show whether a key conflicts and with which entry. This plugin now
integrates with [Zotero: Report Customizer](https://github.com/ReichenHack/zotero-report-customizer), to display the bibTeX key plus
any conflicts between them in the zotero report.

## Set your own, fixed citation keys

You can fix the citation key for a reference by adding the TeXt "bibTeX: [your citekey]" (sans quotes) anywhere in the
"extra" field of the reference, or by using biblaTeXcitekey[my_key].

## Add your own biblaTeX fields

You can add any field you like by using something like biblaTeXdata[origdate=1856;origtitle=An Old Title].

## Drag and drop/hotkey citations

You can drag and drop citations into your LaTeX editor, and it will add a proper \cite{citekey}. The actual command is
configurable by setting the config option in the BBT preferences (see below). Do not include the leading backslash. This
feature requires a one-time setup: go to zotero preferences, tab Export, under Default Output Format, select "LaTeX Citation".

If you want even more convenience (and you're on Windows), install [AutoHotKey](http://www.autohotkey.com/), modify the
[Zotero sample macro](https://raw.github.com/ReichenHack/zotero-better-bibTeX/master/FastCite.ahk), and add it to your AutoHotKey.ahk. If you use this macro unmodified, when you select one or more entries in Zotero, it will copy them, bring TeXMaker to the forground, and paste your citation at the cursor. Caution: this macro does *not* check that you are in Zotero when you activate it, nor that TeXMaker is actually running.

## Recursive collection export

You can export collections including/excluding its child collections. Note that this also sets Zotero to list collection
contents recursively.

## Omit fields from export

You can add a comma-separated list of fields you do not want in the exported file in the preferences to slim down your exports

## JabRef groups import/export

During import, if JabRef explicit (not dynamic) groups are present, collections will be created to mirror these. During
export, collections will be added to the export as explicit jabref groups.

## Configurable citekey generator

This plugin also implements a new citekey generator for those entries that don't have one set explicitly; the formatter
follows the [JabRef key formatting syntax](http://jabref.sourceforge.net/help/LabelPatterns.php), with a twist; you can
set multiple patterns separated by a vertical bar, of which the first will be applied that yields a non-empty string. If
all return a empty string, a random key will be generated. Note that in addition to the 'special' fields listed JabRef
also allows all 'native' fields as key values; the plugin does the same but allows for *Zotero* native fields (case
sensitive! but the first letter may be capitalized to disambiguate a field from a pattern function), not Bib(La)TeX
native fields. The possible fields are:

|                      |                      |                      |                      |
| -------------------- | -------------------- | -------------------- | -------------------- |
| abstractNote         | accessDate           | applicationNumber    | archive              |
| archiveLocation      | artworkMedium        | artworkSize          | assignee             |
| attachments          | audioFileType        | audioRecordingFormat | billNumber           |
| blogTitle            | bookTitle            | callNumber           | caseName             |
| code                 | codeNumber           | codePages            | codeVolume           |
| committee            | company              | conferenceName       | country              |
| court                | date                 | dateAdded            | dateDecided          |
| dateEnacted          | dateModified         | dictionaryTitle      | distributor          |
| docketNumber         | documentNumber       | DOI                  | edition              |
| encyclopediaTitle    | episodeNumber        | extra                | filingDate           |
| firstPage            | forumTitle           | genre                | history              |
| institution          | interviewMedium      | ISBN                 | ISSN                 |
| issue                | issueDate            | issuingAuthority     | itemType             |
| journalAbbreviation  | label                | language             | legalStatus          |
| legislativeBody      | letterType           | libraryCatalog       | manuscriptType       |
| mapType              | medium               | meetingName          | month                |
| nameOfAct            | network              | notes                | number               |
| numberOfVolumes      | numPages             | pages                | patentNumber         |
| place                | postType             | presentationType     | priorityNumbers      |
| proceedingsTitle     | programmingLanguage  | programTitle         | publicationTitle     |
| publicLawNumber      | publisher            | references           | related              |
| reporter             | reporterVolume       | reportNumber         | reportType           |
| rights               | runningTime          | scale                | section              |
| series               | seriesNumber         | seriesTeXt           | seriesTitle          |
| session              | shortTitle           | source               | studio               |
| subject              | system               | tags                 | thesisType           |
| title                | university           | url                  | version              |
| videoRecordingFormat | volume               | websiteTitle         | websiteType          |

### Advanced usage

BBT adds a few filter functions that JabRef (perhaps wisely) doesn't. These are:

- **condense**: this replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
  parameter, e.g *condense,_* will replace spaces with underscores. **Parameters should not contain spaces** unless you
  want the spaces in the value passed in to be replaced with those spaces in the parameter
- **skipwords**: filters out common words like 'of', 'the', ...
- **select**: selects words from the value passed in. The format is *select,start,number* (1-based), so *select,1,4*
  would select the first four words
- **ascii**: removes all non-ascii characters
- **fold**: tries to replace diacritics with ascii look-alikes.

Most functions on the item already strip whitespace and thereby make these functions sort of useless; these are mostly
useful for when you use any of the options from the table above with the initial letter uppercased, which will make sure
a function doesn't take precedence over direct-field access.

## Date field exports

Export dates like 'forthcoming' as 'forthcoming' instead of empty.

## Pull export

You can fetch your library as part of your build, using curl (for example by using the included zoterobib.yaml arara
rule), or with a biblaTeX remote statement like \addbibresource[location=remote]{http://localhost:23119/better-bibTeX/collection?/0/8CV58ZVD.biblaTeX}.
For Zotero standalone this is enabled by default; for Zotero embedded, you need to enable the embedded webserver from the BBT preferences screen (see below). You can then fetch your bibliography on the url
http://localhost:23119/better-bibTeX/collection?\[collectionID].\[format], where collectionID is:

* the ID you get by right-clicking your collection and selecting "Show collection key"
* the path "/[library id]/full/path/to/collection" (the library id is the first number from the key you get in the option above; it's always '0' for your personal library)

or any multiple of those, separated by a '+' sign.

The format is either 'bibTeX' or 'biblaTeX', and determines the translator used for export.

You can add options to the export as URL parameters:

* &exportCharset=&lt;charset&gt;
* &exportNotes=true
* &@useJournalAbbreviation=true

Zotero needs to be running for this to work.

## Force citation key

You can force the citation key to whatever Better BibTeX would have exported by selecting references, right-clicking, and selecting "Generate BibTeX key".

# Things to watch out for

## Duplicate keys

In case you have ambiguous keys (both resolve to Smith2013 for example), drag and drop won't yield the same keys
as export (which does disambiguate them). You will have to either:
* Set an explicit cite key for at least one of them, or
* Configure your generator to generate non-ambigous keys (see below)

The plugin will generate bibTeX comments to show whether a key conflicts and with which entry

## Configuration

The Better BibTeX configuration pane can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

## HTTP Export

BibTeX http export uses the general Zotero HTTP facility; please note that disabling this will disable ALL http
facilities in zotero -- including the non-Firefox plugins.

## Omitting fields in the export

Should you so wish, you can prevent fields of your choosing from being exported. In the configuration screen, add a
comma-separated list of bibTeX fields you do not want to see in your export. The fields are case-sensitive, separated by
a comma *only*, no spaces.

# Installation (one-time)

After installation, the plugin will auto-update to newer releases. Install by downloading the [latest
version](https://raw.github.com/ReichenHack/zotero-better-bibtex/master/zotero-better-bibtex-0.5.14.xpi) (**0.5.14**, released
on 2014-05-15 12:37). If you are not prompted with a Firefox installation dialog then double-click the downloaded xpi; Firefox ought to start and present you with the installation dialog.

For standalone Zotero, do the following:

1. In the main menu go to Tools > Add-ons
2. Select 'Extensions'
3. Click on the gear in the top-right corner and choose 'Install Add-on From File...'
4. Choose .xpi that you’ve just downloaded, click 'Install'
5. Restart Zotero

# Support - read carefully

My time is extremely limited for a number of very great reasons (you shall have to trust me on this). Because of this, I cannot accept bug reports
or support requests on anything but the latest version, currently at **0.5.14**.

If you submit an issue report,

* Please make *sure* you are on the latest version, currently **0.5.14**. Auto-update will usually take care of it.
* Please include *specifics* of what doesn't work. I use this plugin every day myself, so "it doesn't work" is trivially
  false. Please tell me what you expected and what you see happening, and the relevant difference between them.
* One problem/feature request, one issue.
* Do not hijack existing issues. You can chime in on existing issues if you're close to certain it is the same problem,
  otherwise, open a new issue. I rather have duplicate issues than issues I cannot close because they are in fact two or
  more issues.
* If your problem pertains to importing bibTeX files, you *must* put up a sample for me to reproduce the issue with.
  *Do not* paste the sample in the issue, as the issue tracker will format it into oblivioin. Instead, choose one of
  these two options:
  * Post an URL in the issue where I can download your sample, or
  * Put the sample in a [gist](https://gist.github.com/) and post the URL of the gist into the issue
* If your problem pertains to exporting bibTeX files, you *must* put up a sample for me to reproduce the issue with, in
  CSL-JSON format (Zotero can do CSL-JSON export). For making the sample available to me: see 'import issues' in the
  point directly above.
* If your problem pertains to BBT interfering with other plugins, and this interference has something to do with
  importing, you *must* include a sample file that triggers the issue. Don't just say "any file I import does" -- I need
  a *specific* file that does.

## Known issues

* If you see a duplicate translator for Better BibLaTeX, go to "preferences/advanced/files", reset translators and restart.
* Zotero doesn't seem to handle importing of non-utf8 files particularly gracefully. If you're coming from JabRef,
  please verify using file-database properties that your bibliography is saved in utf-8 format before importing.

# Plans

* add "citekey" columns to reference list view
* Submission to Mozilla Extension registry

# Notes

BibLaTeX features from https://github.com/andersjohansson/zotero-biblaTeX-translator
