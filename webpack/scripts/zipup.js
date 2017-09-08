const fs = require('fs');
const archiver = require('archiver');
const version = require('../version');
const path = require('path');

const build_root = path.join(__dirname, '../../');

const xpi = `${build_root}/xpi/${process.argv[3]}-${version}.xpi`;
console.log(`creating ${xpi}`);
if (fs.existsSync(xpi)) { fs.unlinkSync(xpi); }

const archive = archiver.create('zip', {});
archive.pipe(fs.createWriteStream(xpi));
archive.directory(`${build_root}/${process.argv[2]}`, false);
archive.finalize();
