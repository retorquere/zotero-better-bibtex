export const NAMESPACE = {
  XUL: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  HTML: 'http://www.w3.org/1999/xhtml',
}

export class Elements {
  static all: Set<HTMLElement> = new Set

  static removeAll(): void {
    for (const elt of Array.from(this.all)) {
      try {
        elt.remove()
      }
      catch (err) {}
    }
    this.all = new Set
  }

  private className: string
  constructor(private document: Document, namespace: string) {
    this.className = `better-bibtex-${namespace}`
  }

  create(name: string, attrs: Record<string, string> = {}, namespace = NAMESPACE.XUL): HTMLElement {
    const elt: HTMLElement = this.document.createElementNS(namespace, name) as HTMLElement
    attrs.class = `${this.className} ${attrs.class || ''}`.trim()
    for (const [a, v] of Object.entries(attrs)) {
      elt.setAttribute(a, v)
    }
    Elements.all.add(elt)
    return elt
  }

  remove(): void {
    for (const elt of Array.from(this.document.getElementsByClassName(this.className))) {
      Elements.all.delete(elt as HTMLElement)
      elt.remove()
    }
  }
}
