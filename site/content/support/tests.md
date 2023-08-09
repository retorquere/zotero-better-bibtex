---
title: Running the BBT test suite
menuTitle: Testing
weight: 8
---

Please **DO NOT DO THIS** without an open issue on the github tracker. I've been running tests this way for years, but I'd still prefer to guide you through this to prevent any risks to your citation library. The test suite has only been tested on MacOS and Linux. I doubt it'll run on Windows, and I don't know what will go wrong when you test. If you're on Windows, **DO NOT** run this on the same account that holds your actual Zotero library.

The tests require an installed Zotero, python 3.6+, and node 12+, a working `gcc`, and libgit. On MacOS, that requires:

* `brew install libgit2`
* if `xcode-select -p` doesn't respond with `/Applications/Xcode.app/Contents/Developer`: `xcode-select --install` (select `install`, not `get Xcode` in the popup that follows).

Then:

* `git clone https://github.com/retorquere/zotero-better-bibtex.git`
* `cd zotero-better-bibtex`
* `pip3 install -r requirements.txt`

then a few things I'd really prefer you do before anything else. **In principle** the tests are safe to run on the user account that also has your own library. I've been doing this for years. Still, it would be good to verify rather than trust this. The next steps are all reversible if things don't go as expected.

* Make sure Zotero is not running. If you're on a Mac, that means `cmd-Q`
* copy the Zotero profiles to a safe place. The profiles live in `~/Library/Application\ Support/Zotero` if you're on a Mac, `~/.zotero` if you're on Linux.
* `mv ~/Zotero ~/Zotero.saved`
* `touch ~/Zotero`

this is all temporary, and when all is verified to be setup correctly, we'll undo them.

`~/Library/Application\ Support/Zotero` / `~/.zotero` holds the administration of your Zotero profiles. The test setup will add a new profile leaving your existing profile(s) untouched. But better safe than sorry, which is why we're holding a copy.

The `mv` sets aside your library so that Zotero won't be able to find it. The `touch` creates an empty file in its place. The tests don't use that location, they use `~/.BBTTEST` instead, but if for whatever reason that doesn't work, Zotero will try to write to `~/Zotero/something`, and since `~/Zotero` is now a file instead of a directory, Zotero will complain loudly if that happens, and we know we must back out.

Now then:

* make sure you're in `zotero-better-bibtex`
* `./test/behave --tags @438`

and be amazed. Zotero will pop up, load the test library, executes one test, and shuts down. The log file after the tests run will be `~/.BBTTEST.log`. The tests do not touch your own library.

To restore access to your regular library so you can run either a test suite or just work with your library (but **not** both at the same time. **always** fully close Zotero between these).

* `rm ~/Zotero`
* `mv ~/Zotero.saved ~/Zotero`

and you can remove the copy of the profile administration you made earlier. Zotero should now start again normally opening your library.
