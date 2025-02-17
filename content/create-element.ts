export const NAMESPACE = {
  XUL: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  HTML: 'http://www.w3.org/1999/xhtml',
}

type Handler = (event?: any) => void | Promise<void>

export class Elements {
  static all: WeakRef<Elements>[] = []

  static removeAll(): void {
    for (const ref of this.all) {
      try {
        const elements = ref.deref()
        if (elements) elements.document.querySelectorAll(`.${ elements.className }`).forEach(e => e.remove())
      }
      catch {}
    }
    this.all = []
  }

  private className: string
  constructor(private document: Document) {
    this.className = `better-bibtex-${ Zotero.Utilities.generateObjectKey() }`
    Elements.all.push(new WeakRef(this))
  }

  public serialize(node: HTMLElement): string {
    const s = new XMLSerializer
    return s.serializeToString(node)
  }

  create(name: string, attrs: Record<string, number | string | Handler | HTMLElement[]> = {}): HTMLElement {
    const children: HTMLElement[] = (attrs.$ as unknown as HTMLElement[]) || []
    delete attrs.$

    const namespace = name.startsWith('html:') ? NAMESPACE.HTML : NAMESPACE.XUL
    name = name.replace('html:', '')

    const elt: HTMLElement = this.document[namespace === NAMESPACE.XUL ? 'createXULElement' : 'createElement'](name) as HTMLElement
    attrs.class = `${ this.className } ${ attrs.class || '' }`.trim()
    for (const [ a, v ] of Object.entries(attrs)) {
      if (typeof v === 'string') {
        elt.setAttribute(a, v)
      }
      else if (typeof v === 'number') {
        elt.setAttribute(a, `${ v }`)
      }
      else if (a.startsWith('on') && typeof v === 'function') {
        elt.addEventListener(a.replace('on', ''), event => { (v(event) as Promise<void>)?.catch?.(err => { throw (err) }) })
      }
      else {
        throw new Error(`unexpected attribute ${ a } of type ${ typeof v }`)
      }
    }
    for (const child of children) {
      elt.appendChild(child)
    }

    return elt
  }

  remove(): void {
    for (const elt of Array.from(this.document.getElementsByClassName(this.className))) {
      elt.remove()
    }
  }
}
