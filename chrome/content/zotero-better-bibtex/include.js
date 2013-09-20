// Only create main object once
if (!Zotero.BetterBibTex) {
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                                  .getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://zotero-better-bibtex/content/zotero-better-bibtex.js");
}
