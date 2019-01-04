# You wanted customized...

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

If you want to run a postscript in the CSL translators but don't care whether it will output YAML or JSON, you can test for `Translator.BetterCSL`, which will be true when either one of `BetterCSLJSON` or `BetterCSLYAML` is active.

In the `BetterBib(La)TeX` context you will typically access `this`, which will
be undefined in the `BetterCSL(JSON|YAML)` context. In the `BetterBib(La)TeX` context, your Bib(La)TeX reference being built is
available as both `this` and `reference`; the source Zotero item is available both as `item` (and `this.item` for historic reasons). In the `BetterCSL(JSON|YAML)` context,
the CSL object being built is available as `reference` and the the source Zotero item is available as `item`.

You should
really test for the translator context in your postscripts. If you don't because you have a postscript that pre-date CSL support, you will probably be using `this.<something>` in your
existing postscripts, which will make the script will non-fatally error out. So you're very probably good to go as-is.
But please fix your postscripts to test for the translator context.

## The API (for the Better Bib(La)TeX context)

The postscript should be a `javascript` snippet. You can access the data with following objects or functions.

In `BetterBibLaTeX` and `BetterBibTeX`, 

- `this` is the BibTeX reference you are building, and the reference has a number of fields.
- `this.fields`
- `item` (or as mentioned earlier, `this.item`) is the Zotero item that's the source of the reference. 

  e.g. access the date in zotero item `item.date`.

- `this.has` is a dictionary of fields for output.

  e.g. access the year in output `this.has.year`

- `this.add` is the function to add or modify keys in `this.has`. It will check check for unintentional duplicates (unless you specify explicitly with `replace: true`). 

  e.g. change the value of year in output `this.add({name: 'year', replace: true, value: your_year_value})`

In `BetterCSLJSON` and `BetterCSLYAML`:

- `reference` is the CSL object being built. Any changes made to this object will directly change the CSL object being output.
- `item` is the Zotero reference it's being built from.

## Add accessdate, url for BibTeX

Since BibTeX doesn't really have well-defined behavior across styles the way BibLaTeX does, BBT can't generate URL data which is compatible with all BibTeX styles. If you know the style you use yourself, you can add the data in the format you want using a postscript. The script below will add a note for the last accessed date, and a `\url` tag within the `howpublished` field, but only for BibTeX, not for BibLaTeX, and only for `webpage` entries:

```js
if (Translator.BetterBibTeX && item.itemType === 'webpage') {
    if (item.accessDate) {
      this.add({ name: 'note', value: "(accessed " + item.accessDate + ")" });
    }
    if (item.url) {
      this.add({ name: 'howpublished', bibtex: "{\\url{" + this.enc_verbatim({value: item.url}) + "}}" });
    }
  }
```

## Comma's in keywords

If you want to retain commas in your keywords (e.g. for chemical elements) and separate with a comma-space, you could do:

```js
if (Translator.BetterBibTeX || Translator.BetterBibLaTeX) {
  this.add({ name: 'keywords', replace: true, value: item.tags, sep: ', ' });
}
```

as the default encoder knows what to do with arrays, if you give it a separator.

## Add DOI in note field

```js
if ((Translator.BetterBibTeX || Translator.BetterBibLaTeX) && item.DOI) {
  var doi = item.DOI;
  if (doi.indexOf('doi:') != 0) { doi = 'doi:' + doi; }
  this.add({ name: 'note', duplicate: true, value: '[' + doi + ']' });
}
```

## Add arXiv data

arXiv is a bit of an odd duck. It really isn't a journal, so it shouldn't be the journal title, and their own recommendations on how to include arXiv IDs is a little lacking: [this](https://arxiv.org/help/faq/references) doesn't say where to include the `arXiv:...` identfier, and [this](http://arxiv.org/hypertex/bibstyles/) says *not* to include it. Nor does it give any recommendations on how to achieve the [desired output](https://arxiv.org/help/faq/references).

But for arguments' sake, let's say you get the desired output by including an empty `journaltitle` field (ugh) and stuff the `arXiv:...` ID in the `pages` field (*ugh*). You could do that with the following postscript:

```
if ((Translator.BetterBibTeX || Translator.BetterBibLaTeX) && item.arXiv.id) {
  this.add({ name: 'pages', value: item.arXiv.id });
  if (!this.has.journaltitle) { this.add({ name: 'journaltitle', bibtex: '{}' }); }
}
```

<!--
## Custom field order

Specify the ordering of the listing of fields in an exported Biblatex/Bibtex entry. Your postscript:

```javascript
if (Translator.BetterBibTeX || Translator.BetterBibLaTeX) {
  // the bib(la)tex fields are ordered according to this array.
  // If a field is not in this list, it will show up at the end in random order.
  // https://github.com/retorquere/zotero-better-bibtex/issues/512
  var order = ['author', 'date', 'origdate', 'shorthand', 'title'];
  this.fields.sort(function(a, b) {
    var oa = order.indexOf(a.name);
    var ob = order.indexOf(b.name);
    if (oa < 0) { return 1; } // a is not in order, so put it at the end
    if (ob < 0) { return -1; } // b is not in order, so put it at the end
    return oa - ob;
  });
}
```
In Zotero when using an Export Format of Better Biblatex we'll get something like the following entry ...

{% raw %}
<pre><code>@book{nietzsche_1974_gay,
  <strong>author</strong> = {Nietzsche, Friedrich Wilhelm},
  <strong>date</strong> = {1974-03},
  <strong>origdate</strong> = {1882},
  <strong>shorthand</strong> = {GS},
  <strong>title</strong> = {The {{Gay Science}}: {{With}} a {{Prelude}} in {{Rhymes}} and an {{Appendix}} of {{Songs}}},
  keywords = {Philosophy / General,Philosophy / History  Surveys / Modern},
  translator = {Kaufmann, Walter},
  publisher = {{Random House}},
  timestamp = {2016-06-05T20:12:28Z},
  pagetotal = {407},
  shorttitle = {The {{Gay Science}}},
  isbn = {0-394-71985-9},
  edition = {1}
}
{% endraw %}
</code></pre>

Further details [Export to Biblatex/Bibtex. Custom field order. #512](https://github.com/retorquere/zotero-better-bibtex/issues/512).
-->

## Detect and protect LaTeX math formulas

```
if (Translator.BetterBibTeX && this.has.title) {
  this.add({ name: 'title', value: item.title.replace(/(\$.*?\$)/g, '<script>$1</script>'), replace: true });
}
```

## Replace `director` with `author` for `videoRecording` and `film` references

```
if (Translator.BetterBibLaTeX) {
  switch (item.itemType) {
    case 'videoRecording':
    case 'film':
      item.creators.forEach(creator => {
        if (creator.creatorType === 'director') creator.creatorType = 'author'
      })
      this.addCreators();
      break;
  }
}
```
