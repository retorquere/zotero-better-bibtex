Testing BBT is a little involved I'm afraid, but here goes:

1. Kill Firefox
1. Clone BBT, and check out the submodules
2. Make sure you have ruby 2.2 or later installed (I'm a great fan of [RVM](https://rvm.io/) for this), and run `gem install bundler && bundle update`. Depending on your build system (Linux or Mac only -- perhaps cygwin will work but I've never tried), grab a cup of water, coffee, lunch or dinner. On my i7, this takes a few minutes; on my server (which was an anemic dual-core atom when I built it 4 years ago), between 10-15.
3. Make sure you have Node 0.12.7 or later, and run `rake npm`
4. Be online, and run `SIGN=false rake test`. Grab dinner (again, as the case may be).

Standalone is not supported. you can set the variable `OFFLINE` to `true`, and it will not re-download things it has the first time, but I don't recommend it, as I haven't used it in a while. The build caches what it can -- it will not download Zotero afresh if it sees in the update.rdf it still has the newest version.

SIGN=false is *probably* not necessary as it will only actually attempt signing if it finds certain environment vars, but SIGN=false suppresses it in any case. If you don't sign (and you can't for this extension ID), the test script will set `xpinstall.signatures.required` to `false` in the test profile, so it requires a FF that supports this (45 does, 46, who knows)

It should in principle be possible to just fork and enable CircleCI integration to have all this done automatically for you; you can grab the debug logs by SSHing in, but that always runs the full test suite. If you run by hand locally, you can run individual tests by supplying its tag, like

```
SIGN=false rake test[345]
```

The test creates and deletes a fresh profile, so it won't touch anything in yours, but FF can't be running since the test uses the embedded webserver on a known port. If you forget to close FF, no harm done, the tests can only be activated by installing the debug bridge plugin, which the test will download and install in the test profile.

When a test fails, the test runner will leave the following artifacts:

* `cucumber.log`, which is what you saw scrolling by as the tests ran
* `<test name>.log`, which is the javascript console log that was captured during the run
* `<test name>.debug`, which is the Zotero debug log that was captured during the run.

The Zotero debug log cannot capture everything; errors that happen before the logging system is active can only be seen by enabling [run time logging](https://www.zotero.org/support/debug_output), and the test suite doesn't handle that. Anything that doesn't show up in the log, I usually replay by hand with realtime logging on, in a separate profile I created by hand.
