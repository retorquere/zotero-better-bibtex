---
title: Scripting
weight: 7
tags:
  - scripting
aliases:
  - /scripting
---
## You wanted customized...

You got customized. If you go into the Advanced tab of the Better BibTeX preferences you will find a text box (empty by
default) where you can edit a javascript snippet which will be executed for each entry generated in the Bib(La)TeX
exporter. In this code, you have access to the entry just before it will be written out and cached. There is an API
to do this, and it's fairly stable, but usually you can just open a new issue and ask me to write it, and I'll add it
here (it's how the examples got here). Postscripts are available in 4 of the translators:

1. BetterBibLaTeX
2. BetterBibTeX
3. BetterCSLJSON
4. BetterCSLYAML

You can (and totally should) check in which translator your postscript is running, which you can do by testing for
`Translator.<id>` where `<id>` is one of these four names, using something like

```javascript
if (Translator.BetterBibLaTeX) {
  ...
}
```

or alternately on the full name using a switch

```javascript
switch (Translator.header.label) {
  case 'Better BibLaTeX':
    ...
    break;
  case 'Better BibTeX':
    ...
    break;
  case 'Better CSL JSON':
    ...
    break;
  case 'Better CSL YAML':
    ...
    break;
}
```

If you want to run a postscript in the CSL translators but don't care whether it will output YAML or JSON, you can test for `Translator.BetterCSL`, which will be true when either one of `BetterCSLJSON` or `BetterCSLYAML` is active. Analogously, `Translator.BetterTeX` will be true if either of `Better BibTeX` or `Better BibLaTeX` is active.

In the postscript, the entry being built is available as `entry`, as both `entry` and `this` in BetterTeX postscripts, and as `reference` for legacy postscripts; and the Zotero item it is being built from is available as `item`.

You should really test for the translator context in your postscripts using the `Translator.<name>` tests mentioned above. If you don't because you have a postscript that pre-date postscript CSL support, you will probably be using the legacy use of `this` to set things on the entry being built, and calling `reference.add` in those postscripts; since, for CSL postscripts, `this` is not set, it will make the script will non-fatally error out, so you're very probably good to go as-is. But please fix your postscripts to test for the translator context.

## The API for `Better BibTeX` and `Better BibLaTeX`

The postscript should be a `javascript` snippet. You can access the data with following objects and methods:

- `item` is the Zotero item that's the source for the entry being built. 
- `entry` is the BibTeX entry you are building, and the entry has a number of fields.

  e.g. you can access the date in zotero item `item.date`.

- `entry.has` is a dictionary of fields for output.
- `entry.date` is the parsed and normalized version of `item.date`.

  e.g. you can see whether the `year` field has been set by testing for `entry.has.year`, and when e.g. for a season-date only the year is exported in bibtex, you can find it in `entry.date.season`

- `entry.add` is the function to add or modify keys in `entry.has`. It accepts the following named parameters in the form of an object:

  - `name`: name of the bib(la)tex field to output
  - `value`: the value for the field *without* LaTeX encoding
  - `bibtex`: the value for the field *with LaTeX encoding already applied*. If both `bibtex` and `value` are present, `bibtex` takes precedence
  - `enc`: specifies how to encode the `value` field. Valid values are:
      - `latex`: encode markup and special characters to LaTeX. This is the default, if you don't provide an `enc` parameter, `latex` is assumed
      - `verbatim`: encode under `verbatim` rules
      - `literal`: encode under `literal` rules
      - `raw`: assume `value` is already LaTeX-encoded (same as passing the value in `bibtex`)
      - `url`: encode as verbatim url
  - `sep`: if `value` is an array, and `enc` is `latex`, encode each array element using `latex` and join the results with the string in `sep`. Defaults to an empty string.
  - `html`: boolean indicating whether the `value` is full HTML (really only useful for notes)

  e.g. change the value of year in output `entry.add({name: 'year', value: "your_year_value"})`

- `entry.addCreators` adds the contents of `item.creators` to `entry`.

  author encoding has a fair number of moving bits and generates multiple fields (`author`, `editor`, etc), this function is here so you can manipulate `item.creators` and call `entry.addCreators` to *replace*
  the existing creator fields on `entry`.

- `entry.remove` removes a field previously added by `entry.add` or `entry.addCreators`

## The API for `BetterCSLJSON` and `BetterCSLYAML`

- `entry` is the CSL object being built. Any changes made to this object will directly change the CSL object being output.
- `item` is the Zotero item it's being built from.

There isn't really an API. You can use regular javascript to manipulate the `entry` object, which is a [CSL-JSON](http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables) object.

## Debugging

There isn't much in place in terms of debugging, as tranlators (and
thus postscripts) are not allowed to do any UI work. You can do
old-fashioned `printf`-style debugging by calling `Zotero.debug(...)`
in your postscript -- it will output the string you pass into the
Zotero debug log which you can inspect from the `Help` menu. You
can for example do `Zotero.debug(JSON.stringify(item))` to see what
the Zotero item looks like to the translator.

## Samples

### Add accessdate, url for BibTeX

Since BibTeX doesn't really have well-defined behavior across styles the way BibLaTeX does, BBT can't generate URL data which is compatible with all BibTeX styles. If you know the style you use yourself, you can add the data in the format you want using a postscript. The script below will add a note for the last accessed date, and a `\url` tag within the `howpublished` field, but only for BibTeX, not for BibLaTeX, and only for `webpage` entries:

```javascript
if (Translator.BetterBibTeX && item.itemType === 'webpage') {
    if (item.accessDate) {
      entry.add({ name: 'note', value: "(accessed " + item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') + ")" });
    }
    if (item.url) {
      entry.add({ name: 'howpublished', bibtex: "{\\url{" + entry.enc_verbatim({value: item.url}) + "}}" });
    }
  }
```

### Comma's in keywords

If you want to retain commas in your keywords (e.g. for chemical elements) and separate with a comma-space, you could do:

```javascript
if (Translator.BetterTeX) {
  entry.add({ name: 'keywords', value: item.tags, sep: ', ', enc: 'tags' });
}
```

as the default encoder knows what to do with arrays, if you give it a separator.

### Add DOI in note field

```javascript
if (Translator.BetterTeX && item.DOI) {
  var doi = item.DOI;
  if (doi.indexOf('doi:') != 0) { doi = 'doi:' + doi; }
  entry.add({ name: 'note', value: '[' + doi + ']' });
}
```

### Add arXiv data

arXiv is a bit of an odd duck. It really isn't a journal, so it shouldn't be the journal title, and their own recommendations on how to include arXiv IDs is a little lacking: [this](https://arxiv.org/help/faq/references) doesn't say where to include the `arXiv:...` identfier, and [this](https://arxiv.org/help/hypertex/bibstyles) says *not* to include it. Nor does it give any recommendations on how to achieve the [desired output](https://arxiv.org/help/faq/references).

But for arguments' sake, let's say you get the desired output by including an empty `journaltitle` field (ugh) and stuff the `arXiv:...` ID in the `pages` field (*ugh*). You could do that with the following postscript:

```javascript
if (Translator.BetterTeX && item.arXiv) {
  entry.add({ name: 'pages', value: item.arXiv.id });
  if (!entry.has.journaltitle) { entry.add({ name: 'journaltitle', bibtex: '{}' }); }
}
```

### Custom field order

Specify the ordering of the listing of fields in an exported Biblatex/Bibtex entry. Your postscript:

```javascript
if (Translator.BetterTeX) {
  // the bib(la)tex fields are ordered according to this array.
  // If a field is not in this list, it will show up after the ordered fields.
  // https://github.com/retorquere/zotero-better-bibtex/issues/512

  const order = ['author', 'date', 'title', 'publisher']
  for (const [field, value] of order.filter(front => entry.has[first]).concat(Object.keys(entry.has).filter(other => !order.includes(other))).map(f => [f, entry.has[f]])) {
    delete entry.has[field]
    entry.has[field] = value
  }
}
```
In Zotero when using an Export Format of Better Biblatex we'll get something like the following entry ...

<pre><code>@book{nietzsche_1974_gay,
  <u>author</u> = {Nietzsche, Friedrich Wilhelm},
  <u>date</u> = {1974-03},
  <u>title</u> = {The {{Gay Science}}: {{With}} a {{Prelude}} in {{Rhymes}} and an {{Appendix}} of {{Songs}}},
  <u>publisher</u> = {{Random House}},
  origdate = {1882},
  shorthand = {GS},
  keywords = {Philosophy / General,Philosophy / History  Surveys / Modern},
  translator = {Kaufmann, Walter},
  timestamp = {2016-06-05T20:12:28Z},
  pagetotal = {407},
  shorttitle = {The {{Gay Science}}},
  isbn = {0-394-71985-9},
  edition = {1}
}
</code></pre>

Further details [Export to Biblatex/Bibtex. Custom field order. #512](https://github.com/retorquere/zotero-better-bibtex/issues/512).

### Detect and protect LaTeX math formulas

```javascript
if (Translator.BetterTeX && entry.has.title) {
  entry.add({ name: 'title', value: item.title.replace(/(\$.*?\$)/g, '<script>{$1}</script>') });
}
```

### Or, detect and protect (simple) LaTeX commands

```javascript
if (Translator.BetterTeX && entry.has.journal) {
  entry.add({ name: 'journal', value: entry.has.journal.value.replace(/(\\\w+)/g, '<script>{$1}</script>') });
}
```

### Detect and protect MathJax

```javascript
if (Translator.BetterTeX) {
  // different for bibtex and biblatex exporters
  const note = ['annotation', 'note'].find(field => entry.has[field])

  if (note) {
    let notes = item.notes.map(note => `<div>${note}</div>`).join('')
    notes = notes
      .replace(/(\$\$[\s\S]*?\$\$)/g, '<script>$1</script>')
      .replace(/\\\(/g, '<script>$')
      .replace(/\\\)/g, '$</script>')
    entry.add({ name: note, value: notes, html: true });
  }
}
```

### Replace `director` with `author` for `videoRecording` and `film` entries

Creator handling is fairly complicated, so to change the authors/editors/creators of any kind, you must change them on `item` and then call `addCreators` to do the needful. `addCreators` will *replace* the existing creators that were added to `entry` with the current state in `item.creators`, however you left it.

```javascript
if (Translator.BetterBibLaTeX) {
  switch (item.itemType) {
    case 'videoRecording':
    case 'film':
      for (const creator of item.creators) {
        if (creator.creatorType === 'director') creator.creatorType = 'author'
      }
      entry.addCreators();
      break;
  }
}
```

### Changing the entry type from collection to book

```javascript
if (Translator.BetterBibLaTeX) {
  if (entry.entrytype === 'collection') entry.entrytype = 'book'
}
```

### Set the entry type to `misc` for arXiv preprints in BibTeX

```
if (Translator.BetterBibTeX && entry.entrytype === 'article' && item.arXiv) {
  if (entry.has.journal && item.arXiv.source === 'publicationTitle') {
    entry.remove('journal');
  }
  if (!entry.has.journal) entry.entrytype = 'misc'
}
```

### Citing documents with a physical archive location

This is one area where some of the supposedly most popular packages -- `biblatex`,
`biblatex-apa`, `biblatex-chicago`, `biblatex-mla` -- are all over the
place, if they explicitly support archival material at all. There
doesn't seem to be a solution that caters for all of these and
possibly other packages, too. biblatex has no special fields for
dealing with info about physical archives, even if it does have
provisions for electronic archives via the fields eprint (`identifier`),
eprintclass (`section of an archive`), and eprinttype (`name of the
archive`).

Of the packages mentioned above, only one (`biblatex-mla`) has a
clear schema of how to record archival information (type `@unpublished`;
fields `number`, `library`, `location`). Note that the `library` field
is unique to biblatex-mla. (biblatex does define the field, but
never uses it in its standard styles, and we find no indication
that either biblatex-apa or biblatex-chicago would use it for a
physical archive.)

Given all of this, I'm going to leave referencing of physical
location to postscripts for now. If you enable the [quality report]({{< ref "/installation/preferences/export" >}}#include-comments-about-potential-problems-with-the-references), BBT
will list Zotero fields with data that has not been used in the
export:

```
@letter{MillionDemiInfirmes1968,
  title = {Un Million et Demi d'infirmes, Handicapés Physiques et Mentaux},
  date = {1968-05-31},
  url = {https://archives.strasbourg.eu/archive/fonds/FRAM67482_0592_114Z/view:115037},
  urldate = {2021-04-08},
  type = {Letter}
}
% == BibLateX quality report for MillionDemiInfirmes1968:
% Unexpected field 'title'
% Unexpected field 'type'
% ? Unused archive: Archives de la Ville et l'Eurométropole de Strasbourg
% ? Unused archiveLocation: 114 Z 1 248
% ? Unused callNumber: 114 Z 1 248
```

if you then apply a postscript such as 

```
if (Translator.BetterBibLaTeX) {
  // biblatex-mla
  if (item.archive && item.archiveLocation) {
    entry.add({ name: 'type', value: entry.entrytype })
    entry.entrytype = 'unpublished'
    entry.add({ name: 'library', value: item.archive})
    entry.add({ name: 'number', value: item.archiveLocation })
  }
}
```

you get

```
@unpublished{MillionDemiInfirmes1968,
  title = {Un Million et Demi d'infirmes, Handicapés Physiques et Mentaux},
  date = {1968-05-31},
  url = {https://archives.strasbourg.eu/archive/fonds/FRAM67482_0592_114Z/view:115037},
  urldate = {2021-04-08},
  type = {letter},
  library = {Archives de la Ville et l'Eurométropole de Strasbourg},
  number = {114 Z 1 248}
}
% == BibLateX quality report for MillionDemiInfirmes1968:
% Unexpected field 'number'
% Missing required field 'author'
```

### Export season for BibTeX

```
if (Translator.BetterBibTeX && entry.date.type === 'season') {
  entry.add({ name: 'month', value: ['', 'spring', 'summer', 'fall', 'winter'][entry.date.season] })
}
```

### Adding rights field in BibLaTeX

```
if (Translator.BetterBibLaTeX) {
  entry.add({ name: 'rights', value: item.rights});
}
```

### Use `~` in file paths to avoid the .bib file being different on different computers

For example on a Linux machine you might have `/home/myname` and on MacOS it is typically `/Users/mypossiblyothername`. If you sync a bib file on both to a git repo you will see a lot of diffs everytime due to them fighting each other.

```javascript
if (Translator.BetterTeX && !Translator.options.exportFileData && item.attachments && item.attachments.length) {
  for (const att of item.attachments) {
    if (att.localPath) {
      att.localPath = att.localPath.replace(RegExp("^\/.*?\/.*?\/"), "~/")
    }
  }
  entry.add({ name: 'file', value: item.attachments, enc: 'attachments' })
  return { cache: false }
}
```

From [discussion here](https://forums.zotero.org/discussion/comment/399187#Comment_399187).

### Adding file field for CSL JSON export
It can be useful to have paths to attachment files included in json files, which is currently not the case, see [issue 518](https://github.com/retorquere/zotero-better-bibtex/issues/518).

```javascript
if (Translator.BetterCSLJSON) {
	entry.file = item.attachments.map(a => a.localPath).join(";");
}
```
