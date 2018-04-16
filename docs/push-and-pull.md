## Push Export

When exporting using Better Bib(La)Tex you will be offered a new export option: `Keep updated`. Checking this option
registers the export for automation; any changes to the collection after you've completed the current export will
trigger an automatic re-export to update the bib file. You can review/remove exports from the BBT preferences.  While
I've gone to some lengths to make sure performance is OK, don't go overboard with the number of auto-exports you have
going. Also, exporting only targeted selections over your whole library will get you better performance. You can set up
separate exports for separate papers for example if you have set up a collection for each.

### git support

If you run plan to use BBT auto-export with a git repo, you can run `git config zotero.betterbibtex.push true` in that repo, and BBT will, at each auto-export update to that folder:

1. `git pull`
2. Perform the export
3. `git add <your library file>`
4. `git commit -m <your library file`
5. `git push`

Note that the nature of git commit/push is not file-bound; if you made edits to other files, and added those, they will be committed and pushed along. If you want to be super-careful, the best way to go about it is to have a separate clone of your repo that BBT auto-exports to, and then another repo that you do your own edits in. I don't use it myself this way, but you have been warned.

git auto-export works nicely with overleaf, which is where I use it myself, but any git service (gitlab, github, etc) should work exactly the same.

## Pull Export
You can fetch your library as part of your build, using curl (for example by using the included zoterobib.yaml arara
rule), or with a BibLaTeX remote statement like

```
\addbibresource[location=remote]{http://localhost:23119/better-bibtex/collection?/0/8CV58ZVD.biblatex}
```

You can then fetch your bibliography on the url http://localhost:23119/better-bibtex/collection?[collectionID].[format], where collectionID is:

* the ID you get by right-clicking your collection and selecting "Show collection key"
* the path "/[library id]/full/path/to/collection" (the library id is the first number from the key you get in the
  option above; it's always '0' for your personal library)

or any multiple of those, separated by a '+' sign.

The format is either 'bibtex' or 'biblatex', and determines the translator used for export.

You can add options to the export as URL parameters:

* `&exportCharset=<charset>`
* `&exportNotes=[true|false]`
* `&useJournalAbbreviation=[true|false]`
