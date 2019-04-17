#!/usr/bin/env node

const biblatex = require('biblatex-csl-converter');
const fs = require('fs');
const path = require('path');

const replace = {
  '\\;':    '\u0011',
  '\u0011': ';',
  '\\:':    '\u0012',
  '\u0012': ':',
  '\\\\':   '\u0013',
  '\u0013': '\\',
}

function attachments(v, fileDirectory) {
  const _attachments = [];

  for (const record of v.replace(/\\[\\;:]/g, escaped => replace[escaped]).split(';')) {
    const att = {
      mimeType: '',
      path: '',
      title: '',
    }

    const parts = record.split(':').map(str => str.replace(/[\u0011\u0012\u0013]/g, escaped => replace[escaped]))
    switch (parts.length) {
      case 1:
        att.path = parts[0]
        break

      case 3: // tslint:disable-line:no-magic-numbers
        att.title = parts[0]
        att.path = parts[1]
        att.mimeType = parts[2] // tslint:disable-line:no-magic-numbers
        break

      default:
        debug(`Unexpected number of parts in file record '${record}': ${parts.length}`)
        break
    }

    // if (att.path) att.path = att.path.replace(/\\/g, '/');
    if (att.path && att.path[0] != '/' && fileDirectory) att.path = `${fileDirectory}/${att.path}`;

    _attachments.push(att)
  }
  
  return _attachments;
}

const root = 'test/fixtures/import';
for (let stored of fs.readdirSync(root).map(stored => path.resolve(root + '/' + stored))) {
  if (!stored.endsWith('.bib')) continue;

  const bib = biblatex.parse(fs.readFileSync(stored, 'utf-8'), {
    processUnexpected: true,
    processUnknown: { comment: 'f_verbatim' },
    processInvalidURIs: true,
  })

  if (!bib.jabref.meta.fileDirectory) {
    bib.jabref.meta.fileDirectory = path.resolve(path.dirname(stored));
  } else if (bib.jabref.meta.fileDirectory[0] == '.') {
    bib.jabref.meta.fileDirectory = path.resolve(path.dirname(stored)) + bib.jabref.meta.fileDirectory.substr(1);
  }

  let header = false;
  for (const [key, entry] of Object.entries(bib.entries)) {
    if (!entry.unexpected_fields || !entry.unexpected_fields.file) continue
    for (const att of attachments(entry.unexpected_fields.file, bib.jabref.meta.fileDirectory)) {
      if (att.path) {
        if (!header) {
          console.log(stored);
          header = true;
        }
        console.log('  ', (fs.existsSync(att.path) ? '+' : '-'), att.path)
      }
    }
  }
}
