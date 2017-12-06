// tslint:disable:no-console

import * as shell from 'shelljs'

console.log('update submodules')
if (shell.exec('git submodule update --init --recursive').code !== 0) throw new Error('submodule update failed')
if (shell.exec('git submodule update --remote').code !== 0) throw new Error('submodule update failed')
