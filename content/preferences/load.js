Zotero.debug('preference pane load trigger setup');
window.addEventListener('load', function() {
  Zotero.debug('preference pane load trigger, keyformat=' + document.getElementById('id-better-bibtex-preferences-citekeyFormat').value)
  Zotero.BetterBibTeX.prefPane.onLoad({
    Zotero_Preferences: Zotero_Preferences,
    document: document,
    window: window,
  });
}, false);
