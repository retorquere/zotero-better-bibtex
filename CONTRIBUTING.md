# Very rudimentary instructions to get you going on BBT coding

# SUPER IMPORTANT, READ THIS IF ANYTHING

Running the tests will **clear out the Zotero profile** used for running the tests without asking you any questions.

In order to make sure that this isn't my actual research data, I have set up the tests to do a couple of things, and I've done some things manually

Manually:

* Before first start of Zotero, I have created empty files (not directories, this is important), called `~/Zotero` and `~/zotero`. This will prevent Zotero from putting any data there
* I have set up Zotero to always start with `-datadir profile` so that the reference data sits within the actual Zotero profile, not in `~/Zotero`

Automated:

* The tests will create a Zotero profile called `BBTTEST`. **This profile gets clobbered everytime you start the tests. DO NOT PUT IMPORTANT DATA HERE.**
* The test runner starts Zoteru using `-datadir profile -P BBTTEST` which means I force it to use that profile, and it should leave your production profile alone

If you try to start up Zotero for your regular work and it's empty or you see test data, try running it with `-P` and the profile picker will pop up. Select your actual profile and tick the checkbox that says `start up with this profile by default`.

This has kept my data safe for the past few years but I can make no guarantees. Safest is to run the tests on a system or user account entirely separate from your own, but I don't.


# Setting up for development/test

## Zotero

If you're on Linux, install the latest Zotero release using the either manually or using https://github.com/retorquere/zotero-deb so Zotero will end up in
`/usr/lib/zotero/`. If you're on MacOS, just install the latest Zotero 5. If you're on Windows, please let me know how you got
everything to work and I'll happily document it here, but I can't help you.

## Getting the repo

1. Run `git clone https://github.com/retorquere/zotero-better-bibtex.git` or `git clone git@github.com:<your username>/zotero-better-bibtex.git` if you have forked the repo so you can submit pull requests
2. Run `git submodule update --init --recursive`

## Python for the test chain

1. Install python 3.6 or later
2. Run `pip3 install -r requirements`

## Node for the build chain

1. Install node 10 or later however appropriate for your platform
2. Update npm to the latest npm by running `npm install npm@latest -g`
3. Run `npm install`
4. Run `npm run build`

This should leave you with two XPI files in the `xpi` directory

## Running the tests

1. run `npm test`
