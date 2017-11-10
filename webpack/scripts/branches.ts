// tslint:disable:no-console

require('dotenv').config()

import * as github from './github'

async function main() {
  const branches = await github.request({ uri: '/branches' })
  for (const branch of branches) {
    if (branch.name.match(/^[0-9]+$/)) {
      const issue = await github.request({ uri: `/issues/${branch.name}` })
      if (issue.state !== 'open') console.log(branch.name, issue.state)
    } else if (branch.name !== 'master' && branch.name !== 'gh-pages') {
      console.log(branch.name)
    }
  }
}

main()
