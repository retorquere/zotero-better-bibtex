declare const window: any
declare const document: any

export = new class FirstRun {
  private prefix = 'better-bibtex-first-run-'
  private params: { citekeyFormat: String, dragndrop: boolean }

  public load() {
    const wizard = document.getElementById('better-bibtex-first-run')
    const cancel = wizard.getButton('cancel')
    cancel.disabled = true

    this.params = window.arguments[0].wrappedJSObject

    for (const radiogroup of [...document.getElementsByTagName('radiogroup')]) {
      const option = radiogroup.id.substring(this.prefix.length)
      for (const radio of [...radiogroup.getElementsByTagName('radio')]) {
        if (radio.value === this.params[option]) radiogroup.selectedItem = radio
      }
    }

    for (const checkbox of [...document.getElementsByTagName('checkbox')]) {
      const option = checkbox.id.substring(this.prefix.length)
      checkbox.checked = !!this.params[option]
    }
  }

  public update() {
    for (const radiogroup of [...document.getElementsByTagName('radiogroup')]) {
      const option = radiogroup.id.substring(this.prefix.length)
      this.params[option] = radiogroup.selectedItem.value
    }

    for (const checkbox of [...document.getElementsByTagName('checkbox')]) {
      const option = checkbox.id.substring(this.prefix.length)
      this.params[option] = checkbox.checked
    }

    // special case for dynamic explanation
    const selected = document.getElementById('better-bibtex-first-run-citekeyFormat').selectedItem.value
    for (const pattern of ['bbt', 'zotero', 'whatever']) {
      document.getElementById(`better-bibtex-first-run-citekeyFormat-${pattern}`).setAttribute('hidden', pattern !== selected)
    }
  }

  /*
  public ok() {
    log.debug('ok')
  }
  */
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
