var picked = yield Zotero.Integration.execCommand("BetterBibTeX", "addEditCitation", 1);
Zotero.debug('picked:' + picked)
return picked
