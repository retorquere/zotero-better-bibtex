# Very rudimentary instructions to get you going on BBT coding

## Zotero

If you're on Linux, install the latest Zotero release using the `zotero5_installer.sh` so Zotero will end up in
~/bin/zotero. If you're on MacOS, just install the latest Zotero 5. If you're on Windows, please let me know how you got
everything to work and I'll happily document it here, but I can't help you.

## Getting the repo

1. Run `git clone https://github.com/retorquere/zotero-better-bibtex.git` or `git clone git@github.com:<your username>/zotero-better-bibtex.git` if you have forked the repo so you can submit pull requests
2. Run `git checkout z5`

## Ruby for the test chain

1. Install [rvm](https://rvm.io/) and change to the BBT checkout. This should install ruby 2.3
2. Run `gem install bundler`
3. Run `bundle update`

## Node for the build chain

1. Install node 7.10 however appropriate for your platform
2. Run `npm install`
3. Run `npm run build`

This should leave you with two XPI files in the `xpi` directory

## Running the tests

1. Start Zotero, add a random reference, then shut it down. This will create the default profile.
2. Run `./features/support/mkprofile`. Zotero will start up, import a bunch of references, and shut down.
3. Start Zotero and verify your random reference from step 1 is still the only reference.

