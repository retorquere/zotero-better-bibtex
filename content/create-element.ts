export const NAMESPACE = {
  XUL: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  HTML: 'http://www.w3.org/1999/xhtml',
}

type Handler = (event?: any) => void | Promise<void>

export class Elements {
  static all: Set<WeakRef<HTMLElement>> = new Set

  static removeAll(): void {
    for (const eltRef of this.all) {
      try {
        eltRef.deref()?.remove()
      }
      catch (err) {}
    }
    this.all = new Set
  }

  private className: string
  constructor(private document: Document) {
    this.className = `better-bibtex-${Zotero.Utilities.generateObjectKey()}`
  }

  create(name: string, attrs: Record<string, string | Handler> = {}, namespace = NAMESPACE.XUL): HTMLElement {
    const elt: HTMLElement = this.document.createElementNS(namespace, name) as HTMLElement
    attrs.class = `${this.className} ${attrs.class || ''}`.trim()
    for (const [a, v] of Object.entries(attrs)) {
      if (typeof v === 'string') {
        elt.setAttribute(a, v)
      }
      else if (a.startsWith('on')) {
        elt.addEventListener(a.replace('on', ''), event => { (v(event) as Promise<void>)?.catch?.(err => { throw(err) }) })
      }
      else {
        throw new Error(`unexpected attribute ${a}`)
      }
    }
    Elements.all.add(new WeakRef(elt))

    return elt
  }

  remove(): void {
    for (const elt of Array.from(this.document.getElementsByClassName(this.className))) {
      elt.remove()
    }
  }
}
