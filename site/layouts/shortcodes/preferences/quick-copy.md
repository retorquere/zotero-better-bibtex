{{/* DO NOT EDIT. This shortcode is created automatically from Preferences.xul */}}
### Quick copy/drag-and-drop citations

#### QuickCopy format

default: `LaTeX citation`

Used for drag-and-drop/quick copy using Better BibTeX citation keys. In the Zotero "Export" pane, choose `Better BibTeX Quick Copy` as the default export format for quick copy, and choose the desired format for the drag-and-drop citations here.

Options:

* LaTeX citation
* Cite Keys
* Pandoc citation
* Org-mode select link
* org-ref citation
* RTF Scan marker
* Roam Cite Key
* Atom (https://atom.io/packages/zotero-citations)
* GitBook
* Zotero select link
* Eta template

#### LaTeX command

default: `cite`

Used for drag-and-drop/quick copy citations in `LaTeX` format. Set the desired LaTeX citation command here. If you set this to `citep`, drag-and-drop citations will yield `\citep{key1,key2,...}`

#### Surround Pandoc citations with brackets

default: `no`

Used for drag-and-drop/quick copy citations in `Pandoc` format. You can use this option to select whether you want to have these pandoc citations surrounded with brackets or not.

#### Org-mode select link

default: `using Zotero item key`

OrgMode to select items in your library

Options:

* using Zotero item key
* using Better BibTeX citation key

#### Zotero select link

default: `using Zotero item key`

Hyperlink to select items in your library

Options:

* using Zotero item key
* using Better BibTeX citation key

#### Eta template

default: `<not set>`

Used for drag-and-drop/quick copy citations in `Build your own` format. This is going to get pretty technical, sorry. You can paste a [Eta](https://eta.js.org/) template here. Inside the template, you will find an array `it.items`, each of which is a serialized Zotero item. To find out what an item looks like inside the template, export some items as BetterBibTeX JSON.


