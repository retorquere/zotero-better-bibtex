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

function __estrace$report(event, name, url, args) {
  function logger(msg) {
    const zotero = typeof Zotero !== 'undefined'
    const debug = zotero && Zotero.Debug
    const bbt = zotero && typeof Zotero.BetterBibTeX !== 'undefined'
    const ready = bbt && Zotero.BetterBibTeX.ready && !Zotero.BetterBibTeX.ready.isPending()

    let context = ''
    if (!zotero) {
      context = 'Before Zotero load:'
    }
    else if (!debug) {
      context = 'Zotero loaded, but not debug-ready:'
    }
    else if (!bbt) {
      context = 'Zotero ready, BBT not loaded:'
    }
    else if (!ready) {
      context = 'Zotero ready, BBT not ready:'
    }

    if (debug) {
      Zotero.debug(`${context} ${msg}`)
    }
    else {
      // console.log(context, msg)
    }
  }

  if (event === 'enter') {
    logger(`bbt trace.${event} ${name} ${url}.(${JSON.stringify(Array.from(args), __estrace$circularReplacer())})`)
  }
  else {
    logger(`bbt trace.${event} ${name} ${url}`)
  }
}

const __estrace = {
  enter(name, url, args) {
    __estrace$report('enter', name, url, args)
  },
  exit(name, url, result) {
    __estrace$report('exit', name, url)
  },
};
