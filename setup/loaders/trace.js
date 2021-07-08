;if (typeof Zotero !== 'undefined' && Zotero.Debug) Zotero.Debug.enabled = true

const __estrace = {
  depth: 0,
  hold: '',
  prefix: 'zotero(?)(+0000000): ',

  enter(name, url, args) {
    const replacer = this.circularReplacer()
    this.report(`bbt trace.enter ${url}.${name}(${Array.from(args).map(arg => JSON.stringify(arg, replacer)).join(', ')})`)
    this.state(1)
  },

  exit(name, url, result) {
    this.state(-1)
    this.report(`bbt trace.exit ${url}.${name} => ${JSON.stringify(result, this.circularReplacer())}`)
  },

  state(inc) {
    const zotero = typeof Zotero !== 'undefined'
    const debug = zotero && Zotero.Debug
    const bbt = zotero && typeof Zotero.BetterBibTeX !== 'undefined'
    const ready = bbt && Zotero.BetterBibTeX.ready && !Zotero.BetterBibTeX.ready.isPending()
    const host = bbt ? Zotero.BetterBibTeX : this

    host.trace$depth = host.trace$depth || 0
    if (inc) host.trace$depth += inc
    
    return {
      depth: host.trace$depth,
      zotero: {
        loaded: zotero,
        ready: debug,
      },
      bbt: {
        loaded: bbt,
        ready: ready,
      },
    }
  },

  report(msg) {
    const state = this.state()

    msg = '  '.repeat(state.depth || 0) + msg
    if (!state.zotero.loaded) {
      msg = `Before Zotero load: ${msg}`
    }
    else if (!state.zotero.ready) {
      msg = `Zotero loaded, but not debug-ready: ${msg}`
    }
    else if (!state.bbt.loaded) {
      msg = `Zotero ready, BBT not loaded: ${msg}`
    }
    else if (!state.bbt.ready) {
      msg = `Zotero ready, BBT not ready: ${msg}`
    }

    const now = Date.now()
    if (state.zotero.ready && (!this.last || (now - this.last) > 1000)) {
      Zotero.debug((this.hold ? this.hold.replace(this.prefix, '') + this.prefix : '') + msg)
      this.last = now
      this.hold = ''
    }
    else {
      this.hold += this.prefix + msg + '\n'
    }
  },

  circularReplacer() {
    const seen = new WeakSet()
    return (key, value) => {
      try {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return
          seen.add(value)
          return { ...value }
        }
        else {
          return value
      }
      }
      catch (err) {
        return
      }
    }
  },
};
