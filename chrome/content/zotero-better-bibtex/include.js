// Only create main object once
if (!Zotero.BetterBibTeX) {
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://zotero-better-bibtex/content/zotero-better-bibtex.js");
	loader.loadSubScript("chrome://zotero-better-bibtex/content/keymanager.js");
  window.addEventListener('load', function(e) { Zotero.BetterBibTeX.init(); }, false);
}
