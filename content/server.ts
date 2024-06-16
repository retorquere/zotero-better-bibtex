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

  public queryParams(request: { query?: Record<string, string>, searchParams?: URLSearchParams }): Record<string, string> {
    let query: Record<string, string> = {}
    if (request.query) query = {...request.query}
    if (request.searchParams) {
      query[''] = request.searchParams.toString()
      for (const [key, value] of request.searchParams) {
        if (value) query[key] = value
      }
    }
    return query
  }
}
