<% import json %>\
% for pref in preferences:
pref("extensions.zotero.translators.better-bibtex.${pref.var}", ${json.dumps(pref.default)});
% endfor
