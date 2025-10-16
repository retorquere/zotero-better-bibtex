#!/usr/bin/env node

import anyAscii from 'any-ascii'
import { execSync } from 'child_process'
import fs from 'fs'
import { globSync as glob } from 'glob'
import path from 'path'
import sanitize from 'sanitize-filename'
import { fileURLToPath } from 'url'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { TableCell, TableRow } from 'gherkin-ast'
import { format } from 'gherkin-formatter'
import { read } from 'gherkin-io'

import { Octokit } from '@octokit/rest'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
import dotenv from 'dotenv'
dotenv.config({ quiet: true, path: path.join(root, '.env') })

// Get current Git branch and issue number
let issue = null
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: root, encoding: 'utf8' }).trim()
  const m = branch.match(/^gh-(?<issue>\d+)$/)
  if (m) issue = parseInt(m.groups.issue, 10)
}
catch (error) {
  issue = null
}

// Argument parsing
const argv = yargs(hideBin(process.argv))
  .option('translator', {
    alias: 't',
    type: 'string',
    default: 'biblatex',
    description: 'Translator type (biblatex, bibtex, csl, csl-json, yml, csl-yaml)',
  })
  .option('data', {
    alias: 'd',
    type: 'string',
    demandOption: true,
    description: 'Path to the data file',
  })
  .option('feature', {
    alias: 'f',
    type: 'string',
    description: 'Path to the feature file',
  })
  .option('issue', {
    alias: 'i',
    type: 'number',
    default: issue,
    description: 'GitHub issue number',
  })
  .option('title', {
    type: 'string',
    description: 'Scenario title',
  })
  .option('number', {
    alias: 'n',
    type: 'number',
    default: 1,
    description: 'Number of items',
  })
  .option('mode', {
    type: 'string',
    choices: ['import', 'export', 'citekey'],
    conflicts: ['import', 'export', 'citekey'],
    description: 'Set the script mode to import, export, or citekey',
  })
  .option('export', {
    alias: 'e',
    type: 'boolean',
    conflicts: ['mode', 'import', 'citekey'],
    description: 'Set mode to "export"',
  })
  .option('import', {
    type: 'boolean',
    conflicts: ['mode', 'export', 'citekey'],
    description: 'Set mode to "import"',
  })
  .option('citekey', {
    type: 'boolean',
    conflicts: ['mode', 'export', 'import'],
    description: 'Set mode to "citekey"',
  })
  .option('prefs', {
    type: 'boolean',
    description: 'Run with --prefs',
  })
  .option('attachments', {
    type: 'boolean',
    description: 'Run with --attachments',
  })
  .option('attach', {
    type: 'boolean',
    description: 'Attach files',
  })
  .parse()

if (argv.export) {
  argv.mode = 'export'
}
else if (argv.import) {
  argv.mode = 'import'
}
else if (argv.citekey) {
  argv.mode = 'citekey'
}
else if (!argv.mode) {
  argv.mode = 'export'
}
for (const mode of ['import', 'export', 'citekey']) {
  argv[mode] = argv.mode === mode
}
if (!argv.feature) argv.feature = path.join(root, 'test', 'features', `${argv.mode}.feature`)

const Translator = new class {
  constructor() {
    switch (argv.translator.toLowerCase()) {
      case 'biblatex':
        this.name = 'BibLaTeX'
        this.ext = '.biblatex'
        break
      case 'bibtex':
        this.name = 'BibTeX'
        this.ext = '.bibtex'
        break
      case 'csl':
      case 'csl-json':
        this.name = 'CSL-JSON'
        this.ext = '.csl.json'
        break
      case 'yml':
      case 'csl-yaml':
        this.name = 'CSL-YAML'
        this.ext = '.csl.yml'
        break
    }
  }
}()

const main = async () => {
  // Validate arguments
  if (!argv.issue) {
    console.error('Error: no issue number provided.')
    process.exit(1)
  }

  if (!fs.existsSync(argv.feature)) {
    console.error(`Error: Feature file does not exist at ${argv.feature}`)
    process.exit(1)
  }

  argv.data = path.join(root, 'logs', `${argv.data}/items.json`)
  if (!fs.existsSync(argv.data)) {
    console.error(`Error: Data file does not exist at ${argv.data}`)
    process.exit(1)
  }

  if (!Translator.name) {
    console.error(`Error: Invalid translator specified: ${argv.translator}`)
    process.exit(1)
  }

  if (!argv.title) {
    // Get issue title from GitHub
    if (!process.env.GITHUB_TOKEN) {
      console.error('Error: GITHUB_TOKEN environment variable is not set.')
      process.exit(1)
    }
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    try {
      const { data: issue } = await octokit.rest.issues.get({
        owner: 'retorquere',
        repo: 'zotero-better-bibtex',
        issue_number: argv.issue,
      })
      argv.title = issue.title
        .replace(/^\[[^\]]+\]\s*:/, '').trim()
        .replace(/^(Bug|Feature|Feature Request)\s*:/i, '')
        .trim()
    }
    catch (error) {
      console.error(`Error fetching issue title for #${argv.issue}:`, error.message)
      process.exit(1)
    }
  }

  // Sanitize title
  argv.title = anyAscii(sanitize(`${argv.title} #${argv.issue}`).replace(/[`'"?]/g, ''))

  // Handle attachment logic
  if (argv.attach) {
    try {
      const attachmentDir = path.join(root, 'test/fixtures/export')
      const candidates = glob('attachments/*.*', { cwd: attachmentDir }).reduce((acc, file) => {
        const ext = path.extname(file)
        acc[ext] = file
        return acc
      }, {})

      const data = JSON.parse(fs.readFileSync(argv.data, 'utf8'))
      data.items.forEach(item => {
        if (item.attachments) {
          item.attachments.forEach(att => {
            if (att.path) {
              const ext = path.extname(att.path)
              if (candidates[ext]) {
                att.path = candidates[ext]
              }
            }
          })
        }
      })
      fs.writeFileSync(argv.data, JSON.stringify(data, null, 2), 'utf8')
    }
    catch (error) {
      console.error('Error handling attachments:', error.message)
      process.exit(1)
    }
  }

  /*
  // Clean lib using ts-node
  try {
    const cleanLibArgs = ['npx', 'ts-node', path.join(root, 'util', 'clean-lib.ts'), argv.data]
    if (argv.prefs) cleanLibArgs.push('--prefs')
    if (argv.attachments) cleanLibArgs.push('--attachments')
    execSync(cleanLibArgs.join(' '), { cwd: root, stdio: 'inherit' })
  }
  catch (error) {
    console.error('Error running clean-lib.ts:', error.message)
    process.exit(1)
  }
  */

  // Check for non-existing attachments
  try {
    const data = JSON.parse(fs.readFileSync(argv.data, 'utf8'))
    for (const item of data.items) {
      for (const att of (item.attachments || [])) {
        if (att.path) {
          const attPath = path.join(
            root,
            'test/fixtures/export',
            path.basename(path.dirname(att.path)),
            att.path.replace('STORAGE:', ''),
          )
          if (!fs.existsSync(attPath)) {
            console.warn(`*** WARNING ***: ${argv.data} has non-existing attachment ${att.path}`)
          }
        }
      }
    }
  }
  catch (error) {
    console.error('Error processing data file:', error.message)
    process.exit(1)
  }

  const document = (await read(argv.feature))[0]

  const name = argv.import
    ? /^Import <references> references/
    : new RegExp(`^Export <references> references for ${Translator.name} to`)
  const outlines = document.feature.elements
    .filter(_ => _.keyword === 'Scenario Outline' && _.name.match(name))

  if (outlines.length !== 1) {
    console.error(`Error: Found ${outlines.length} outlines containing "${Translator.name}"`)
    process.exit(1)
  }

  const outline = outlines[0]
  const examples = outlines[0].examples[0].body
  const existing = examples.find(example => example.cells[0].value === argv.title)
  if (argv.export) {
    const data = JSON.parse(fs.readFileSync(argv.data, 'utf8'))
    argv.number = data.items.length
  }
  if (existing) {
    existing.cells[1] = new TableCell(`${argv.number}`)
  }
  else {
    examples.unshift(new TableRow([new TableCell(argv.title), new TableCell(`${argv.number}`)]))
  }
  fs.writeFileSync(argv.feature, format(document))

  // Copy/create test fixtures
  const fixture = path.join(root, `test/fixtures/${argv.mode}`, argv.title)
  const source = `${fixture}.json`
  try {
    fs.copyFileSync(argv.data, source)
    execSync(`git add "${source}"`, { cwd: root, stdio: 'inherit' })

    const target = `${fixture}${argv.export ? Translator.ext : '.bib'}`
    if (Translator.name === 'CSL-JSON') {
      fs.writeFileSync(target, '{}', 'utf8')
    }
    else if (!fs.existsSync(target)) {
      fs.writeFileSync(target, '', 'utf8')
    }

    execSync(`git add "${target}"`, { cwd: root, stdio: 'inherit' })
  }
  catch (err) {
    console.error('Error creating/copying fixture files:', err.message)
    process.exit(1)
  }
}

main()
