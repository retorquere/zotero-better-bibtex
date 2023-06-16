let window: Window
let document: Document
export class FirstRun {
  private prefix = 'better-bibtex-first-run-'
  private params: { citekeyFormat: string, dragndrop: boolean }

  constructor(win: Window) {
    window = win
    document = window.document
  }

  public load(): void {
    const wizard = document.getElementById('better-bibtex-first-run')
    const cancel = (wizard as any).getButton('cancel')
    cancel.disabled = true

    this.params = (window as any).arguments[0].wrappedJSObject

    for (const radiogroup of [...document.getElementsByTagName('radiogroup')]) {
      const option = radiogroup.id.substring(this.prefix.length)
      for (const radio of [...radiogroup.getElementsByTagName('radio')] as HTMLInputElement[]) {
        if (radio.value === this.params[option]) (radiogroup as unknown as any).selectedItem = radio
      }
    }

    for (const checkbox of [...document.getElementsByTagName('checkbox')] as HTMLInputElement[]) {
      const option = checkbox.id.substring(this.prefix.length)
      checkbox.checked = !!this.params[option]
    }
  }

  public update(): void {
    for (const radiogroup of [...document.getElementsByTagName('radiogroup')]) {
      const option = radiogroup.id.substring(this.prefix.length)
      this.params[option] = (radiogroup as unknown as any).selectedItem.value
    }

    for (const checkbox of [...document.getElementsByTagName('checkbox')] as HTMLInputElement[]) {
      const option = checkbox.id.substring(this.prefix.length)
      this.params[option] = checkbox.checked
    }

    // special case for dynamic explanation
    const selected = (document.getElementById('better-bibtex-first-run-citekeyFormat') as unknown as any).selectedItem.value
    for (const format of [...document.querySelectorAll('#better-bibtex-first-run-citekeyFormat radio')] as HTMLInputElement[]) {
      document.getElementById(`better-bibtex-first-run-citekeyFormat-${format.value}`).hidden = format.value !== selected
    }
  }
}
