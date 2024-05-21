export const Server = new class Endpoints {
  private handlers: Record<string, any> = {}

  public register(paths: string | string[], handler: any) {
    if (typeof paths === 'string') paths = [ paths ]
    for (const path of paths) {
      if (this.handlers[path]) throw new Error(`double registration for ${path}`)
      this.handlers[path] = handler
    }
  }

  public startup() {
    for (const [path, handler] of Object.entries(this.handlers)) {
      Zotero.Server.Endpoints[path] = handler
    }
  }

  public shutdown() {
    for (const path in this.handlers) { // eslint-disable-line guard-for-in
      delete Zotero.Server.Endpoints[path]
    }
    this.handlers = {}
  }
}
