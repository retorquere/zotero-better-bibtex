<% import json %>\
% for pref in preferences:
pref("extensions.translators.better-bibtex.${pref.var}", ${json.dumps(pref.default)});
% endfor
