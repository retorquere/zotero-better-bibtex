;if (typeof Zotero !== 'undefined' && Zotero.Debug) Zotero.Debug.enabled = true

const __estrace$circularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    try {
      if (typeof value === "object" && value !== null) {
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
}

function __estrace$report(msg) {
  const zotero = typeof Zotero !== 'undefined'
  const debug = zotero && Zotero.Debug
  const bbt = zotero && typeof Zotero.BetterBibTeX !== 'undefined'
  const ready = bbt && Zotero.BetterBibTeX.ready && !Zotero.BetterBibTeX.ready.isPending()

  if (!zotero) {
    msg = `Before Zotero load: ${msg}`
  }
  else if (!debug) {
    msg = `Zotero loaded, but not debug-ready: ${msg}`
  }
  else if (!bbt) {
    msg = `Zotero ready, BBT not loaded: ${msg}`
  }
  else if (!ready) {
    msg = `Zotero ready, BBT not ready: ${msg}`
  }

  if (debug) {
    Zotero.debug(msg)
  }
  else {
    // console.log(msg)
  }
}

const __estrace = {
  enter(name, url, args) {
    __estrace$report(`bbt trace.enter ${url}.${name}(${JSON.stringify(Array.from(args), __estrace$circularReplacer())})`)
  },
  exit(name, url, result) {
    __estrace$report(`bbt trace.exit ${url}.${name} => ${JSON.stringify(result, __estrace$circularReplacer())}`)
  },
};
