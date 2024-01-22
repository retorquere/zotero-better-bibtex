---
title: Cite as you Write
weight: 4
aliases:
  - /Cite-as-you-Write
  - /cayw
tags:
  - citation keys
  - overleaf
  - cite as you write
---

**PSA: as of Zotero 5.0.71, access to the CAYW URL will no longer work from the browser for security reasons; `curl` and other programmatic access such as from editors access will work.**

Good news for TeXnicians and those down with Mark (aka Markdown, RST, whatnot): this is the time to go pester the author of your favorite editor for Zotero integration! 

## Editor integration

### vim

Graciously supplied by David Lukes:

paste it in your .vimrc (and modify to your liking):

```vim
function! ZoteroCite()
  " pick a format based on the filetype (customize at will)
  let format = &filetype =~ '.*tex' ? 'citep' : 'pandoc'
  let api_call = 'http://127.0.0.1:23119/better-bibtex/cayw?format='.format.'&brackets=1'
  let ref = system('curl -s '.shellescape(api_call))
  return ref
endfunction

noremap <leader>z "=ZoteroCite()<CR>p
inoremap <C-z> <C-r>=ZoteroCite()<CR>
```

This inserts the citation at the cursor using the shortcut ctrl-z (in insert mode) or `<leader>`z (in normal, visual etc. modes, `<leader>` being backslash by default).

### emacs

@newhallroad wrote a function in elisp, which brings up the CAYW input, adds the chosen items as pandoc citations to the buffer, and moves the point to after the citations. This is for markdown-mode. Emacs users who use org-mode may (or may not) need something different.

```
(defun alk/bbt-zotero-insert-key ()
  "Run shell command to bring up better bibtex cayw input and insert pandoc citation at point"
  (interactive)
  (shell-command "curl -s http://127.0.0.1:23119/better-bibtex/cayw?format=pandoc^&brackets=true" t nil) ; caret escapes ampersand 
  (search-forward "]") ; place cursor after inserted citation
  )
```

###  Zotero Citations for Atom

A sample implementation of real integration (rather than the working-but-clunky workarounds using paste) can be found in the [Zotero Citations](https://atom.io/packages/zotero-citations) package for the [Atom](http://atom.io) editor.


###  VS Code Citation Picker for Zotero

If you don't feel like typing citations out (and let's be honest, you don't), executing [VS Code Citation Picker for Zotero](https://marketplace.visualstudio.com/items?itemName=mblode.zotero) extension for the [VS Code](https://code.visualstudio.com/) editor will call up a graphical picker which will insert these for you, formatted and all.

### Scrivener 2.0/Marked 2 for Mac

Dave Smith has gracefully written [instructions](http://davepwsmith.github.io/academic-scrivener-howto/) on how to set up Scrivener 2.0 and Marked 2 for OSX to use the CAYW picker, including ready-to-run apps

### Scrivener 1.0 for Windows

Emilie has writen [instructions](https://github.com/AmomentOfMusic/Zotero_scrivener_picker_windows) for using the CAYW picker for Scrivener 1.0 in Windows 10, with the necessary files

### Linux

- Emma Reisz has gracefully written [instructions and scripts](https://emmareisz.github.io/zotpicknix/) for setting up CAYW on Linux.
- ConorIA has more versatile solution called [zotero4overleaf](https://gitlab.com/ConorIA/shell-scripts/tree/master/zotero4overleaf), which was inspired by Emma's scripts. This should allow use with Overleaf, which is pretty insane that it's possible if you think about it.

### Overleaf

David Lukes takes Overleaf integration one step further with a GreaseMonkey/TamperMonkey [userscript](https://github.com/dlukes/zotero-sharelatex-cayw) which not only allows popping up the CAYW picker straight from your browser, no other tools required, but adds a hotkey to refresh your bib file on Overleaf. This should work with the free subscription, no fiddling with git or dropbox required.

## DIY

BBT exposes an URL at http://127.0.0.1:23119/better-bibtex/cayw [^1]. The url accepts
the following URL parameters:

| parameter |   |
| --------- | --- |
| `probe`   | If set to any non-empty value, returns `ready`. You can use this to test whether BBT CAYW picking is live; it will not pop up the picker |
| `format`  | Set the output format |
| `clipboard` | Any non-empty value will copy the results to the clipboard |
| `minimize` | Any non-empty value will minimize Zotero windows after a pick |
| `texstudio` | Any non-empty value will try to push the pick to TeXstudio |
| `selected` | Any non-empty value will use the current selection in Zotero rather than popping up the pick window |


The following formats are available:

* `latex`. Generates [natbib](https://ctan.org/pkg/natbib) citation commands. Extra URL parameters allowed:
  * `command`: the citation command to use (if unspecified, defaults to `cite`)
* `cite` is an alias for `latex` with the assumption you want the cite command to be `cite`
* `biblatex`. Generates [biblatex](https://ctan.org/pkg/biblatex) citation commands. Extra URL parameters allowed:
  * `command`: the citation command to use (if unspecified, defaults to `autocite`)
* `mmd`: MultiMarkdown
* `pandoc`. Accepts additional URL parameter `brackets`; any non-empty value surrounds the citation with brackets
* `asciidoctor-bibtex`
* `jupyter`
* `scannable-cite` for the [ODF scanner](https://zotero-odf-scan.github.io/zotero-odf-scan/)
* `formatted-citation`: output formatted citation as per the current Zotero quick-export setting, if it is set to a citation style, and not an export format
* `formatted-bibliography`: output formatted bibliography as per the current Zotero quick-export setting, if it is set to a citation style, and not an export format
* `translate` invokes a Zotero export translator. Extra URL parameters allowed:
  *  `translator`: stripped name of one of the BBT translators (lowercased, remove 'better', and only the letters, e.g.  `biblatex` or `csljson`), or a translator ID. Defaults to `biblatex`.
  * `exportNotes`: set to `true` to export notes
  * `useJournalAbbreviation`: set to `true` to use journal abbreviations
* `json`: the full pick information Zotero provides.
* `eta`: formats the pick using [Eta](https://eta.js.org/), with the picks exposed as `it.items`. To see what the items look like, use the `json` formatter. URL parameter required:
  * `template`: the Eta template to render

The `eta` formatter is great for experimentation, but if you need a format for a common target application, feel free to request a change to have that added to this list.

The picker passes the following data along with your picked items if you filled them out:

| field             |                                               |
| ----------------- | --------------------------------------------- |
| `locator`         | the place within the work (e.g. page number)  |
| `prefix`          | for stuff like "see ..."                      |
| `suffix`          | for stuff after the citations                 |
| `suppress author` | if you only want the year                     |

However not all output formats support these. Pandoc and scannable cite are the richest ones, supporting all 4. MultiMarkdown supports
none. The `formatted-` formats will ignore these. LaTeX supports all 4, in a way:

* in the `latex` ([`natbib`](https://ctan.org/pkg/natbib)) format: if you choose `suppress author` for none or all of your items in a pick, you
  will get the citation as you would normally enter it, such as `\cite{author1,author2}`, or
  `\citeyear{author1,author2}`. If you use `locator`, `prefix`, `suffix` in any one of them, or you use `suppress author`
  for some but not for others, the picker will write them out all separate, like `\cite[p. 1]{author1}\citeyear{author2}`,
  as natbib doesn't seem to have a good mechanism for combined citations that mix different prefixes/suffixes/locators.
* in the [`biblatex`](https://ctan.org/pkg/biblatex) format: `suppress author` is ignored unless the command is one of `\cite`, `\autocite`
  or `\parencite` **and** there is one items only, in which case the starred variant of the command is returned, which
  hides the author; for multiple items with `locator`s, `prefix`es or `suffix`es, the `s`-affixed variant of the
  command is generated

Some of the formatters use abbreviated labels for the results if you include a locator. The defaults are:

| locator label | abbreviation |
| --------- | --- |
| article | art. |
| chapter | ch. |
| subchapter | subch. |
| column | col. |
| figure | fig. |
| line | l. |
| note | n. |
| issue | no. |
| opus | op. |
| page | p. |
| paragraph | para. |
| subparagraph | subpara. |
| part | pt. |
| rule | r. |
| section | sec. |
| subsection | subsec. |
| Section | Sec. |
| sub verbo | sv. |
| schedule | sch. |
| title | tit. |
| verse | vrs. |
| volume | vol. |

In your call to the CAYW URL, you can override the abbreviations by adding them to the query, e.g. http://127.0.0.1:23119/better-bibtex/cayw?format=mmd&page=&Section=sec., page-picks will have no label, and Section-picks will get `sec.` rather than `Sec.`.

The `clipboard` option can be used as a workaround for editors that haven't gotten around to integrating this yet. If
you use this option you will probably want to bind to a hotkey, either system-wide (which is going to be platform-dependent, I know
[AutoHotKey](http://www.autohotkey.com) works for windows, for OSX [Karabiner](https://pqrs.org/osx/karabiner/) ought to
do the job, and for Linux [xbindkeys](https://unix.stackexchange.com/questions/44672/assign-shortcut-key-to-run-a-script) could do the job.

For example, if you call up http://127.0.0.1:23119/better-bibtex/cayw?format=mmd&clipboard=yes, the Zotero citation picker will pop up. If you then select two items that happen to have cite keys `adams2001` and `brigge2002`, then

* the response body will be `[#adams2001][][#brigge2002][]`, and
* `[#adams2001][][#brigge2002][]` will be left on the clipboard

More of a gimmick than anything else, but if you add `select=true`, BBT will select the picked items in Zotero.

[^1]: For Juris-M, the port number `23119` must be replaced with `24119`.
