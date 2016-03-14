---
title: Support
---

# Getting support for Better BibTeX

Before all else, ***thank you for taking the time for submitting an issue***, and I'm sorry that I've probably
interrupted your flow.

Your report matters to me. I love hearing my software helps you, and it pains me
to know that things aren't working for you.

If you have any questions on the use of the plugin, please do not hesitate to file a GitHub issue to ask for help. If
you're reporting a bug in the plugin, please take a moment to glance through the Support Request Guidelines; it will
make sure I get your problem fixed as quick as possible. Clear bug reports commonly have time-to-fix of 10 minutes. The
guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines
simply express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I
prefer fuzzy ones over missed ones.

Unfortunately, however, my time is extremely limited for a number of very great reasons (you shall have to trust me on this). Because of this, I
cannot accept bug reports or support requests on anything but the latest version, which you'll find
[here](https://github.com/ZotPlus/zotero-better-bibtex/releases/latest).

If you submit an issue report, please include the version that you are on. By the time I get to your issue, the latest
version might have bumped up already, and you will have to upgrade (you might have auto-upgraded already however) and
re-verify that your issue still exists. Apologies for the inconvenience, but such are the breaks.

* You can send off an error report by choosing `Report Better BibTeX Errors` from the gear menu.
  If you go into the BBT preferences and enable "extended debugging", I'll have more information to work
  with, but don't keep it on indefinately as it'll slow doen Zotero. After you submit the error report, click continue
  until you see the debug ID and paste that in the [issue
  tracker](https://github.com/ZotPlus/zotero-better-bibtex/issues).
* You can send off an error report for a specific collection or (selection of) items that fails to export by selecting those, right-clicking
  and choosing `Report ZotPlus Errors`

That in itself will in many cases give me what I need. Don't forget to copy the generated ID to paste it into the github
issue; you cannot call it up later (although you can just do it again). Still, if you want a faster fix:

* **Please include *specifics* of what doesn't work**. I use this plugin every day myself, so "it just doesn't work" is trivially
  false. Please tell me what you expected and what you see happening, and the relevant difference between them.
* **Please don't file a jumble of problems in one issue**. Posting a slew of separate issues is much preferred, as I can
  more easily tackle them one by one.
* **Do not hijack existing issues**. You can chime in on existing issues if you're close to certain it is the same problem,
  otherwise, open a new issue. I rather have duplicate issues than issues I cannot close because they are in fact two or
  more issues.
* **If your problem pertains to *importing BibTeX files*,** ***please*** put up a sample for me to reproduce the issue with.
  *Do not* paste the sample in the issue, as the issue tracker will format it into oblivion. Instead, choose one of
  these options:
  * Post an URL in the issue where I can download your sample, or
  * Put the sample in a [gist](https://gist.github.com/) and post the URL of the gist into the issue, or 
  * upload your files to [dbinbox](http://dbinbox.com/allthatisthecase) -- please use descriptive file names (at least
    the issue number), as I can't see who uploaded what.
* **If your problem pertains to BBT interfering with other plugins** (which wouldn't be the first time), and this interference
  has something to do with importing, you ***must*** include a sample file that triggers the issue. I know it may seem
  that "any file triggers it" -- I need a *specific* file that does so I know we're looking at the same problem.

## Providing test cases

If you have a problem, right-clicking on a reference that exhibits the problem and selecting `Report Better BibTeX Error` will send me a ready-to-use
testcase, including your currents settings.

# Going it your own -- building BBT

I really don't like JavaScript. I know it's not too bad a language, but it's much more verbose than I'd like it to be,
there's no list comprehensions, iterating over lists or arrays is much more effort than it should be, you name it. Then
there's the whole async/promises bandwagon which I think is just a mistake engineered to perfection, necessitated by the
single-threadedness of JavaScript. Fine and all, but some things are just simply single-threaded (such as my build
scripts) and I don't need that kind of hassle.

To avoid dealing with JavaScript, the bulk of the code is written in CoffeeScript. That language has its own problems,
but I prefer those to JavaScript's. Some of the code is generated, and that code generation is generally done using Ruby
-- much of that code lives inside the Rakefile that builds the XPI. Additionally, Zotero translators must be wholly
self-contained, and for code-reuse reasons, the translators are assembled from their constituent parts during the build.
It's a glorious mess. All of this makes it impossible to run BBT straight from the repository, or to just zip the repo
and expect it to install.

If this doesn't scare you, install ruby (at least 2.2) and node.js, then run

```
npm install
gem install bundler
bundle install
```

after which you can run `rake` to build the XPI. It will download various JavaScript libraries, generate some
CoffeeScript files, convert all CoffeeScript files to JavaScript, and finally zip the whole up to create a XPI. It will also
attempt to sign the plugin -- surprise, won't work, since you don't have my credentials. The resulting plugin can be
installed in any version of Firefox that still allows unsigned plugins, or Zotero standalone.
