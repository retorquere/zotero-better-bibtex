const fs = require('fs');
const archiver = require('archiver');
const version = require('../version');

const xpi = `${__dirname}/../xpi/${process.argv[3]}-${version}.xpi`;
console.log(`creating ${xpi}`);
if (fs.existsSync(xpi)) { fs.unlinkSync(xpi); }

const archive = archiver.create('zip', {});
archive.pipe(fs.createWriteStream(xpi));
archive.directory(`${__dirname}/../${process.argv[2]}`, false);
archive.finalize();
