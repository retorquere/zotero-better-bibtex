Zotero.BetterBibTex = {
  init: function () {
    console.log('Loading Better BibTex');

    var header = null;
    var data = null;
    var start = -1;

    try {
      data = Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/BetterBibTex.js");
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
      console.log('Loading Better BibTex failed: ' + err);
      header = null;
    }

    if (header) {
      prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex.");

      var citeKeyFormat = prefs.getCharPref('citekeyformat');
      if (!citeKeyFormat || !citeKeyFormat.match(/\[/)) { citeKeyFormat = null; }
      citeKeyFormat = JSON.stringify(citeKeyFormat);

      if (header.configOptions) { header.configOptions.getCollections = prefs.getBoolPref('recursive'); }

      // install bibtex translator
      console.log("Installing " + header.label);
      Zotero.Translators.save(header, "var citeKeyFormat = " + citeKeyFormat + ";\n" + data);

      // cite key exporter
      header = {
	      translatorID: 'b4a5ab19-c3a2-42de-9961-07ae484b8cb0',
	      label: 'BibTeX cite keys',
	      creator: 'Emiliano heyns',
	      target: 'bib',
	      minVersion: '2.1.9',
	      maxVersion: '',
	      priority: 100,
        configOptions: {
          getCollections: prefs.getBoolPref('recursive')
        },
	      inRepository: true,
	      translatorType: 2,
	      browserSupport: "gcsv",
	      lastUpdated: "2013-10-24 10:05:00"
      };
      console.log("Installing " + header.label);
      Zotero.Translators.save(header, "var citationCommand = " + JSON.stringify(prefs.getCharPref('citecommand')) + "; var citeKeyFormat = " + citeKeyFormat + ";\n" + data);

      //re-initialize Zotero translators so Better Bibtex shows up right away
      Zotero.Translators.init();
      console.log("Better BibTex installed");
    } else {
      console.log("Invalid or missing translator metadata JSON object");
    }
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
