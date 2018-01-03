declare const window: any
declare const document: any

import debug = require('./debug.ts')

export = new class FirstRun {
  public load() {
    const wizard = document.getElementById('better-bibtex-first-run')
    const cancel = wizard.getButton('cancel')
    cancel.disabled = true
  }

  public citekeyFormat() {
    const selected = document.getElementById('better-bibtex-first-run-citekeyFormat').selectedItem.value
    window.arguments[0].wrappedJSObject.citekeyFormat = selected

    for (const pattern of ['bbt', 'zotero', 'whatever']) {
      document.getElementById(`better-bibtex-first-run-citekeyFormat-${pattern}`).setAttribute('hidden', pattern !== selected)
    }
  }

  public ok() {
    debug('ok')
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
