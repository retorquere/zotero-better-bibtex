# Very rudimentary instructions to get you going on BBT coding

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
