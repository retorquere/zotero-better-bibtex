'use strict';

var interval = null;
var progressWin = null;
var progress = null;

var Zotero = null;

function install(data, reason) { }

function startup(data, reason) {
  const observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService)
  const loadObserver = function() {
    observerService.removeObserver(loadObserver, 'zotero-loaded')

    Zotero = Components.classes['@zotero.org/Zotero;1'].getService(Components.interfaces.nsISupports).wrappedJSObject;
    progressWin = new Zotero.ProgressWindow({ closeOnClick: false })
    progressWin.changeHeadline('Zotero startup trace')
    const icon = `chrome://zotero/skin/treesource-unfiled${Zotero.hiDPI ? '@2x' : ''}.png`;
    progress = new progressWin.ItemProgress(icon, 'Waiting for Zotero.Schema.schemaUpdatePromise...')
    progressWin.show()
    const start = Date.now()

    interval = Components.classes['@mozilla.org/timer;1'].createInstance(Components.interfaces.nsITimer);
    interval.initWithCallback({
      notify() {
        progress.setText(`After ${Date.now() - start}, schemaUpdatePromise pending = ${Zotero.Schema.schemaUpdatePromise.isPending()}`)
        if (!Zotero.Schema.schemaUpdatePromise.isPending()) shutdown()
      }
    }, 500, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK)
  }
  observerService.addObserver(loadObserver, "zotero-loaded", false)
}

function shutdown(data, reason) {
  if (interval) interval.cancel()
  interval = null
  if (progressWin) progressWin.startCloseTimer(2000)
  progressWin = null
}

function uninstall(data, reason) { }
