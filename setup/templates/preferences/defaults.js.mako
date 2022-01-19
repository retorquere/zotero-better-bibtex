<% import json %>\
% for pref in preferences:
pref("extensions.zotfile.${pref.var}", ${json.dumps(pref.default)});
% endfor
