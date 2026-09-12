#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { spawn } from 'node:child_process'
import { path7za } from '7zip-bin'

let [, , source, target, plugin] = process.argv
source = path.join(process.cwd(), source)

const { version } = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'))

if (!plugin) {
  console.info('zipup <source dir> <target dir> <plugin name>')
  process.exit(1)
}

const xpi = path.join(process.cwd(), target, `${plugin}-${version}.xpi`)
console.log(`creating ${xpi}`) // eslint-disable-line no-console
if (fs.existsSync(xpi)) fs.unlinkSync(xpi)
if (!fs.existsSync(path.dirname(xpi))) fs.mkdirSync(path.dirname(xpi))

async function main() {
  await new Promise((resolve, reject) => {
    const compression = process.env.GITHUB_ACTIONS === 'true' ? ['-mx=9', '-mfb=258', '-mpass=15'] : ['-mx=1']
    const zip = spawn(path7za, ['a', '-tzip', ...compression, xpi], { cwd: source, stdio: 'inherit' })

    zip.on('error', reject)
    zip.on('exit', code => {
      if (code === 0) resolve()
      else if (code !== null) reject(new Error(`${path7za} exited with status ${code}`))
    })
  })
}

main().catch(err => {
  console.log(err)
  process.exit(1)
})
