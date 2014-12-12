Components.utils.import('resource://gre/modules/AddonManager.jsm')

Zotero.BetterBibTeX.uninstaller = {
  init: ->
    Zotero.BetterBibTeX.log(':::Uninstaller initialized')
    @uninstalling = false
    AddonManager.addAddonListener(@)
    @register()
    return

  onUninstalling: (addon, needsRestart) ->
    Zotero.BetterBibTeX.log(':::Uninstaller uninstalling!')
    return unless addon.id == 'better-bibtex@iris-advies.com'
    @uninstalling = true
    return

  onOperationCancelled: (addon, needsRestart) ->
    Zotero.BetterBibTeX.log(':::Uninstaller cancelled!')
    return unless addon.id == 'better-bibtex@iris-advies.com'
    @uninstalling = false unless (addon.pendingOperations & AddonManager.PENDING_UNINSTALL)
    return

  observe: (subject, topic, data) ->
    if topic == 'quit-application-granted' && @uninstalling
      Zotero.BetterBibTeX.log(':::Uninstaller cleaning up!')
      Zotero.BetterBibTeX.removeTranslators()
      @unregister()
    return false

  register: ->
    svc = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService)
    svc.addObserver(this, 'quit-application-granted', false)
    return

  unregister: ->
    svc = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService)
    svc.removeObserver(this, 'quit-application-granted')
    return
}
