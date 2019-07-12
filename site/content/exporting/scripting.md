---
title: Scripting
weight: 6
tags:
  - scripting
aliases:
  - /scripting
---
## You wanted customized...

You got customized. If you go into the Advanced tab of the Better BibTeX preferences you will find a text box (empty by
default) where you can edit a javascript snippet which will be executed for each reference generated in the Bib(La)TeX
exporter. In this code, you have access to the reference just before it will be written out and cached. There is an API
to do this, and it's fairly stable, but usually you can just open a new issue and ask me to write it, and I'll add it
here (it's how the examples got here). Postscripts are available in 4 of the translators:

1. BetterBibLaTeX
2. BetterBibTeX
3. BetterCSLJSON
4. BetterCSLYAML

You can (and totally should) check in which translator your postscript is running, which you can do by testing for
`Translator.<id>` where `<id>` is one of these four names, using something like

```
if (Translator.BetterBibLaTeX) {
  ...
}
```

or alternately on the full name using a switch

```
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

In the postscript, the reference being built is available as `reference`, and the Zotero item it is being built from is available as `item`. For backwards compatibility, in the `BetterBib(La)TeX` contexts, the reference being built is also available as `this`, and the Zotero item it is being built from as `this.item`, but use of these is discouraged now.

You should really test for the translator context in your postscripts using the `Translator.<name>` tests mentioned above. If you don't because you have a postscript that pre-date postscript CSL support, you will probably be using the legacy use of `this` to set things on the reference being built, and calling `this.add` in those postscripts; since, for CSL postscripts, `this` is not set, it will make the script will non-fatally error out, so you're very probably good to go as-is.
But please fix your postscripts to test for the translator context.

## The API (for the Better Bib(La)TeX context)

The postscript should be a `javascript` snippet. You can access the data with following objects or functions.

In `BetterBibLaTeX` and `BetterBibTeX`, 

- `reference` is the BibTeX reference you are building, and the reference has a number of fields.
- `item` is the Zotero item that's the source of the reference. 

  e.g. you can access the date in zotero item `item.date`.

- `reference.has` is a dictionary of fields for output.

  e.g. you can see whether the `year` field has been set by testing for `reference.has.year`

- `reference.add` is the function to add or modify keys in `reference.has`. 

  e.g. change the value of year in output `reference.add({name: 'year', value: your_year_value})`

In `BetterCSLJSON` and `BetterCSLYAML`:

- `reference` is the CSL object being built. Any changes made to this object will directly change the CSL object being output.
- `item` is the Zotero reference it's being built from.

## Samples

### Add accessdate, url for BibTeX

Since BibTeX doesn't really have well-defined behavior across styles the way BibLaTeX does, BBT can't generate URL data which is compatible with all BibTeX styles. If you know the style you use yourself, you can add the data in the format you want using a postscript. The script below will add a note for the last accessed date, and a `\url` tag within the `howpublished` field, but only for BibTeX, not for BibLaTeX, and only for `webpage` entries:

```
if (Translator.BetterBibTeX && item.itemType === 'webpage') {
    if (item.accessDate) {
      reference.add({ name: 'note', value: "(accessed " + item.accessDate + ")" });
    }
    if (item.url) {
      reference.add({ name: 'howpublished', bibtex: "{\\url{" + reference.enc_verbatim({value: item.url}) + "}}" });
    }
  }
```

### Comma's in keywords

If you want to retain commas in your keywords (e.g. for chemical elements) and separate with a comma-space, you could do:

```
if (Translator.BetterTeX) {
  reference.add({ name: 'keywords', value: item.tags, sep: ', ' });
}
```

as the default encoder knows what to do with arrays, if you give it a separator.

### Add DOI in note field

```
if (Translator.BetterTeX && item.DOI) {
  var doi = item.DOI;
  if (doi.indexOf('doi:') != 0) { doi = 'doi:' + doi; }
  reference.add({ name: 'note', duplicate: true, value: '[' + doi + ']' });
}
```

### Add arXiv data

arXiv is a bit of an odd duck. It really isn't a journal, so it shouldn't be the journal title, and their own recommendations on how to include arXiv IDs is a little lacking: [this](https://arxiv.org/help/faq/references) doesn't say where to include the `arXiv:...` identfier, and [this](https://arxiv.org/help/hypertex/bibstyles) says *not* to include it. Nor does it give any recommendations on how to achieve the [desired output](https://arxiv.org/help/faq/references).

But for arguments' sake, let's say you get the desired output by including an empty `journaltitle` field (ugh) and stuff the `arXiv:...` ID in the `pages` field (*ugh*). You could do that with the following postscript:

```
if (Translator.BetterTeX && item.arXiv.id) {
  reference.add({ name: 'pages', value: item.arXiv.id });
  if (!reference.has.journaltitle) { reference.add({ name: 'journaltitle', bibtex: '{}' }); }
}
```

### Custom field order

Specify the ordering of the listing of fields in an exported Biblatex/Bibtex entry. Your postscript:

```
if (Translator.BetterTeX) {
  // the bib(la)tex fields are ordered according to this array.
  // If a field is not in this list, it will show up at the end in random order.
  // https://github.com/retorquere/zotero-better-bibtex/issues/512

  const order = ['author', 'date', 'title', 'publisher'];
  const keys = Object.keys(reference.has)
  for (const field of keys.sort((a, b) => ((order.indexOf(a) + 1) || (keys.length + order.length + 1)) - ((order.indexOf(b) + 1) || (keys.length + order.length + 1)))) {
    const value = reference.has[field]
    delete reference.has[field]
    reference.has[field] = value
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

```
if (Translator.BetterTeX && reference.has.title) {
  reference.add({ name: 'title', value: item.title.replace(/(\$.*?\$)/g, '<script>{$1}</script>') });
}
```

### Replace `director` with `author` for `videoRecording` and `film` references

Creator handling is fairly complicated, so to change the authors/editors/creators of any kind, you must change them on `item` and then call `addCreators` to do the needful. `addCreators` will *replace* the existing creators that were added to `reference` with the current state in `item.creators`, however you left it.

```
if (Translator.BetterBibLaTeX) {
  switch (item.itemType) {
    case 'videoRecording':
    case 'film':
      for (const creator of item.creators) {
        if (creator.creatorType === 'director') creator.creatorType = 'author'
      }
      reference.addCreators();
      break;
  }
}
```

### Changing the reference type from collection to book

```
if (Translator.BetterBibLaTeX) {
  if (reference.referencetype === 'collection') reference.referencetype = 'book'
}
```

