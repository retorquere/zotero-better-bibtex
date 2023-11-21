---
title: Extra fields
weight: 8
---
In some cases the Zotero fields do not offer a place to enter the
data you need to get your exported entries just right. For this Zotero
has a so-called "cheater syntax" which allows you to add extra
"fields" as separate lines in the `extra` field all items in Zotero
have. These fields are supported by the citation processor inside
Zotero, and BBT understands them too, and adds one "cheater syntax
of its own.

You can add such fields by adding each on their own line in the following format:

```text
Label: value
```

or the older format you migh have seen, which is supported but considered depracated:

```text
{:csl-variable: value}
```

The full list of labels and the Zotero/CSL variables they translate to can be found in the table at the end.

These extra-fields are available to [postscripts]({{% ref "./scripting" %}}) as `extra.kv.<variable-name>`. Which variable it is depends (sorry):

* when you export to CSL, it is attempted to map it to the corrsponding CSL fields; if none are available, it is available under their *zotero* name
* when you export to Better BibTeX/Better BibLaTeX, it is attempted to map it to the corresponding zotero fields; if none are available, it is available under their *csl variable* name

There's three type of fields:

* text
* date
* name

Text is just that. For dates, BBT will do its darndest to parse the crazy dates so many people seem intent in using but if you want consistent results, stick to `YYYY-MM-DD`. For names, use either just text (equivalent to a single-part name in Zotero), or `<family name> || <given name>`.

## BBT-specific

There is also a BBT-specific extra-field format that looks like

```text
tex.field: value
```

These fields are simply copied to the output by BBT, so if you have

```text
tex.bestfield: philosophy
```

you will end up with

```bibtex
  bestfield = {philosophy}
```

in the written bib(la)tex.

You can make BBT export the field only for bibtex or biblatex by changing the prefix to `bibtex.` (so `bibtex.bestfield:`) or `biblatex.` respectively. Finally, you can use `=` instead of `:` as a delimiter, and that will indicate to BBT that what follows the `=` is "raw LaTeX"; BBT will not do any escaping and just copy it out unchanged. This means, for example, that you would probably want

```text
tex.corp: Black & Decker
tex.formula= $\sum\limits_{i=1}^{n} -p(m_{i})\log_{2}(p(m_{i}))$
```

and not

```text
tex.corp= Black & Decker
tex.formula: $\sum\limits_{i=1}^{n} -p(m_{i})\log_{2}(p(m_{i}))$
```

BBT will apply case-protection rules for non-raw fields by including capitals in the prefix, eg

```
TeX.corp: Black & Decker
```

It is important to note that these BBT-specific fields are not recognized by any other exporter. They might end up in notes for some other exporters; there's nothing I can do about that.

## Label/variable list

*note*: I list the Zotero fields here, not the bibtex fields. The Zotero fields are translated to bibtex fields but that translation is pretty complicated and I don't have a simple description of it at this time.

{{% extra-fields %}}

¹ only supported in Juris-M

<div class="alchemy" id="alchemy"></div>
<script src="http://cdn.graphalchemist.com/alchemy.min.js"></script>
<script type="text/javascript">
  var config = {
    dataSource: '/extra-fields.json',
    forceLocked: false,
    graphHeight: function(){ return 400; },
    graphWidth: function(){ return 400; },      
    linkDistance: function(){ return 40; },
    nodeTypes: {"node_type":[ "Maintainer", "Contributor"]},
    nodeCaption: function(node){ 
      return node.caption + " " + node.fun_fact;
    }
  };

  alchemy = new Alchemy(config)
</script>
