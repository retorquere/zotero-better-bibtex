// tslint:disable:no-console

import * as fs from 'fs'
import * as path from 'path'
import * as archiver from 'archiver'

import root from '../root'
import version from '../version'

const [ , , source, target ] = process.argv

const xpi = path.join(root, 'xpi', `${target}-${version}.xpi`)
console.log(`creating ${xpi}`)
if (fs.existsSync(xpi)) fs.unlinkSync(xpi)

const archive = archiver.create('zip', {})
archive.pipe(fs.createWriteStream(xpi))
archive.directory(`${root}/${source}`, false)
archive.finalize()
