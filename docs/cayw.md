# Cite as you Write

Good news for TeXnicians and those down with Mark (aka Markdown, RST, whatnot): this is the time to go pester the author of your favorite editor for Zotero integration! 

## Editor integration

### vim

Graciously supplied by David Lukes:

paste it in your .vimrc (and modify to your liking):

```
function! ZoteroCite()
  " pick a format based on the filetype (customize at will)
  let format = &filetype =~ '.*tex' ? 'citep' : 'pandoc'
  let api_call = 'http://localhost:23119/better-bibtex/cayw?format='.format.'&brackets=1'
  let ref = system('curl -s '.shellescape(api_call))
  return ref
endfunction

noremap <leader>z "=ZoteroCite()<CR>p
inoremap <C-z> <C-r>=ZoteroCite()<CR>
```

This inserts the citation at the cursor using the shortcut ctrl-z (in insert mode) or `<leader>`z (in normal, visual etc. modes, `<leader>` being backslash by default).

###  Zotero Citations for Atom

A sample implementation of real integration (rather than the working-but-clunky workarounds using paste) can be found in the [Zotero Citations](https://atom.io/packages/zotero-citations) package for the [Atom](http://atom.io) editor.

### Scrivener 2.0/Marked 2 for Mac

Dave Smith has gracefully written [instructions](http://davepwsmith.github.io/academic-scrivener-howto/) on how to set up Scrivener 2.0 and Marked 2 for OSX to use the CAYW picker, including ready-to-run apps

### Scrivener 1.0 for Windows

Emilie has writen [instructions](https://github.com/AmomentOfMusic/Zotero_scrivener_picker_windows) for using the CAYW picker for Scrivener 1.0 in Windows 10, with the necessary files

### Linux

- Emma Reisz has gracefully written [instructions and scripts](https://emmareisz.github.io/zotpicknix/) for setting up CAYW on Linux.
- ConorIA has more versatile solution called [zotero4overleaf](https://gitlab.com/ConorIA/shell-scripts/tree/master/zotero4overleaf), which was inspired by Emma's scripts.

## DIY

BBT exposes an URL at http://localhost:23119/better-bibtex/cayw. The url accepts
the following URL parameters:

| parameter |   |
| --------- | --- |
| `probe`   | If set to any non-empty value, returns `ready`. You can use this to test whether BBT CAYW picking is live; it will not pop up the picker |
| `format`  | Set the output format |
| `clipboard` | Any non-empty value will copy the results to the clipboard |
| `minimize` | Any non-empty value minimize all Firefox windows after a pick |

The following formats are available:

* `latex`. Extra URL parameters allowed:
  * `command`: the citation command to use (if unspecified, defaults to `cite`)
* `cite` is an alias for `latex` with the assumption you want the cite command to be `cite`
* `mmd`: MultiMarkdown
* `pandoc`. Accepts additional URL parameter `brackets`; any non-empty value surrounds the citation with brackets
* `asciidoctor-bibtex`
* `scannable-cite` for the [ODF scanner](https://zotero-odf-scan.github.io/zotero-odf-scan/)
* `formatted-citation`: output formatted citation as per the current Zotero quick-export setting, if it is set to a citation style, and not an export format
* `formatted-bibliography`: output formatted bibliography as per the current Zotero quick-export setting, if it is set to a citation style, and not an export format
* `translate` invokes a Zotero export translator. Extra URL parameters allowed:
  *  `translator`: stripped name of one of the BBT translators (lowercased, remove 'better', and only the letters, e.g.  `biblatex` or `csljson`), or a translator ID. Defaults to `biblatex`.
  * `exportNotes`: set to `true` to export notes
  * `useJournalAbbreviation`: set to `true` to use journal abbreviations


The picker passes the following data along with your picked references if you filled them out:

| field    |   |
| -------- | --------- |
| `locator` | the place within the work (e.g. page number) |
| `prefix` | for stuff like "see ..." |
| `suffix` | for stuff after the citations |
| `suppress author` | if you only want the year |

However not all output formats supports these. Pandoc and scannable cite are the richest ones, supporting all 4. MultiMarkdown supports
none. LaTeX supports all 4, in a way; if you choose `suppress author` for none or all of your references in a pick, you
will get the citation as you would normally enter it, such as `\\cite{author1,author2}`, or
`\\citeyear{author1,author2}`. If you use `locator`, `prefix`, `suffix` in any one of them, or you use `suppress author`
for some but not for others, the picker will write them out all separate, like `\cite[p.  1]{author1}\citeyear{author2}`, 
as LaTeX doesn't seem to have a good mechanism for combined citations that mix different prefixes/suffixes/locators. The `formatted-` formats will ignore these.

The `clipboard` option can be used as a workaround for editors that haven't gotten around to integrating this yet. If
you use this option you will probably want to bind to a hotkey, either system-wide (which is going to be platform-dependent, I know
[AutoHotKey](http://www.autohotkey.com) works for windows, for OSX [Karabiner](https://pqrs.org/osx/karabiner/) ought to
do the job, and for Linux you could give [IronAHK](https://github.com/polyethene/IronAHK) or
[autokey](https://code.google.com/p/autokey/) a shot).

For example, if you call up [http://localhost:23119/better-bibtex/cayw?format=mmd&clipboard=yes](http://localhost:23119/better-bibtex/cayw?format=mmd&clipboard=yes), the Zotero citation picker will pop up. If you then select two references that happen to have cite keys `adams2001` and `brigge2002`, then

* the response body will be `[#adams2001][][#brigge2002][]`, and
* `[#adams2001][][#brigge2002][]` will be left on the clipboard

## Playing around

For testing for other markdown formatters, you can construct simple references yourself, using:

* `citeprefix`, default empty, for text to put before the full citation.
* `citepostfix`, default empty, for text to put after the full citation.
* `keyprefix`, default empty, for text to put before each individual citekey
* `keypostfix`, default empty, for text to put after each individual citekey
* `separator`, default `,`, for text to put between citekeys

but if you need an extra format, just ask.
