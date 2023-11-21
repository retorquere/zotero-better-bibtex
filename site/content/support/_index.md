---
title: Support
weight: 4
aliases:
  - /Support
---

Before all else, ***thank you for taking the time for submitting an issue***, and I'm sorry that I've probably
interrupted your flow.

Your report matters to me. I love hearing my software helps you, and it pains me to know that things aren't working for
you.

If you have any questions on the use of the plugin, please do not hesitate to file a GitHub issue to ask for help.

If you're reporting a bug in the plugin, please take a moment to glance through the Support Request Guidelines below; it will
make sure I get your problem fixed as quick as possible. The guidelines are very detailed, perhaps to the point of being off-putting, but please do not fret; these guidelines simply
express my ideal bug submission. I of course prefer very clearly documented issue reports over fuzzy ones, but I prefer
fuzzy ones over missed ones.

## Submitting an issue

You can report problems with BBT by [opening a new issue](https://github.com/retorquere/zotero-better-bibtex/issues/new/choose) on github.
Unfortunately, my time is extremely limited for a number of very great reasons (you shall have to trust me on this). Because of this, I
cannot accept bug reports or support requests on anything but the latest version. By the time I get to your issue, the latest
version might have bumped up already, and you will have to upgrade (you might have auto-upgraded already however) and
re-verify that your issue still exists. Apologies for the inconvenience, but such are the breaks.

* You can send off an debug report by selecting `Send Better BibTeX debug report` from the `Help` menu. Post the resulting ID
  (displayed in red) in a github issue.
* You can send off an debug report for a specific collection or (selection of) items that fails to export by selecting those, right-clicking
  and choosing `Send Better BibTeX debug report`

That in itself will in many cases give me what I need. Don't forget to copy the generated ID to paste it into the github
issue; you cannot call it up later (although you can just do it again).

For the fastest fix:

* **Please be around** for follow-up questions and verification I've fixed the problem. It's really frustrating for me to get a bug report, work feverishly to get it fixed, and then the reporter having no time to verify it is actually addressed.
* **Please include *specifics* of what doesn't work**. I use this plugin every day myself, so "it doesn't work" is trivially
  false. Please tell me what you expected and what you see happening, and the relevant difference between them.
* **Please don't file a jumble of problems in one issue**. Posting a slew of separate issues is much preferred, as I can
  more easily tackle them one by one.
* **Do not hijack existing issues**. You can chime in on existing issues if you're close to certain it is the same problem,
  otherwise, open a new issue. I rather have duplicate issues than issues I cannot close because they are in fact two or
  more issues.
* **If your problem pertains to *importing BibTeX files*,** you ***must*** put up a sample for me to reproduce the issue with.
  *Do not* paste the sample in the issue, as the issue tracker will format it into oblivion. Instead, choose one of
  these options:
  * Post an URL in the issue where I can download your sample, or
  * Put the sample in a [gist](https://gist.github.com/) and post the URL of the gist into the issue
* **If your problem pertains to BBT interfering with other plugins** (which wouldn't be the first time), and this interference
  has something to do with importing, you ***must*** include a sample file that triggers the issue. I know it may seem
  that "any file triggers it" -- I need a *specific* file that does so I know we're looking at the same problem.

## Known problems

If Zotero stalls after installing BBT, it is often a one-time thing as the [cache fills]({{% ref "performance" %}}).
