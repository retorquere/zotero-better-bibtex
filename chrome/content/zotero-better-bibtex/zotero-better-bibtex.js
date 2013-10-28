Zotero.BetterBibTex = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),

  init: function () {
    Zotero.BetterBibTex.load('BetterBibTex.js');
    Zotero.BetterBibTex.load('BetterBibLaTex.js');
    Zotero.BetterBibTex.load('BetterCiteTex.js');
    Zotero.Translators.init();
  },

  load: function(translator) {
    console.log('Loading ' + translator);

    var header = null;
    var data = null;
    var start = -1;

    try {
      data = Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/' + translator);
      if (data) { start = data.indexOf('{'); }

      if (start >= 0) {
        let len = 0;
        for (len = 0; len < 3000; len++) {
          try {
            header = JSON.parse(data.substring(start, len).trim());
            data = data.substring(len, data.length);
            break;
          } catch (err) {
          }
        }
      }
    } catch (err) {
      header = null;
    }

    if (!header) {
      console.log('Loading ' + translator + ' failed: ' + err);
      return;
    }

    var override;
    for (section of ['configOptions', 'displayOptions']) {
      if (!header[section]) { continue; }
      for (option in header[section]) {
        override = null;
        var value = header[section][option];
        switch (typeof value) {
          case 'boolean':
            override = Zotero.BetterBibTex.prefs.getBoolPref(option);
            break;
          case 'number':
            override = Zotero.BetterBibTex.prefs.getIntPref(option);
            break;
          case 'string':
            override = Zotero.BetterBibTex.prefs.getCharPref(option);
            if (override && override.trim() == '') { override = null; }
            break;
        }
        if (((typeof override) == 'undefined') || (override === null)) { continue; }
        header[section][option] = override;
      }
    }

    console.log("Installing " + header.label);
    Zotero.Translators.save(header, data);
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
