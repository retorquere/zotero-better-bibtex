Zotero.BetterBibTex = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),
  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},

  init: function () {
    Zotero.BetterBibTex.safeLoad('BetterBibLaTex.js');
    Zotero.BetterBibTex.safeLoad('BetterCiteTex.js');
    Zotero.BetterBibTex.safeLoad('BetterBibTex.js');
    Zotero.Translators.init();
  },

  export: function(translator, collectionkey) {
    var lkh = Zotero.Collections.parseLibraryKeyHash(collectionkey);
    if (!lkh) { return collectionkey + ' not found'; }

    var col = Zotero.Collections.getByLibraryAndKey(lkh.libraryID, lkh.key);
    if (!col) { return collectionkey + ' not found'; }

    var translator = Zotero.BetterBibTex.translators[translator.toLowerCase()];
    if (!translator) { return 'No translator' + translator; }

    var item;
    var items = col.getChildren(true, false, 'item');
    items = [item.id for (item of items)];
    items = Zotero.Items.get(items);

    var translation = new Zotero.Translate.Export();
    translation.setItems(items);
    translation.setTranslator(translator);

    var status = {finished: false};

    translation.setHandler("done", function(obj, success) {
      status.success = success;
      status.finished = true;
      if (success) { status.data = obj.string; }
    });
    translation.translate();

    while (!status.finished) {}

    if (status.success) {
      return status.data;
    } else {
      return 'export failed';
    }
  },

  safeLoad: function(translator) {
    try {
      Zotero.BetterBibTex.load(translator);
    } catch (err) {
      console.log('Loading ' + translator + ' failed: ' + err);
    }
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

    Zotero.BetterBibTex.translators[header.label.toLowerCase()] = header.translatorID;

    var override;
    for (section of ['configOptions', 'displayOptions']) {
      if (!header[section]) { continue; }
      for (option in header[section]) {
        override = null;
          var value = header[section][option];
        try {
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
        } catch (err) {
          console.log('Better ' + header.label + ' failed to get option ' + section + '.' + option + ': ' + err);
          continue;
        }
        if (((typeof override) == 'undefined') || (override === null)) { continue; }
        console.log('setting ' + section + '.' + [option] + '=' + override);
        header[section][option] = override;
        data = data.replace("safeGetOption('" + option + "')", JSON.stringify(override)); // explicit override, ought not be required
      }
    }

    console.log("Installing " + header.label);
    Zotero.Translators.save(header, data);
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
