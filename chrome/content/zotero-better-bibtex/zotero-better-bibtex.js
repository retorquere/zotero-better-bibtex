Zotero.BetterBibTex = {
  init: function () {
    console.log('Loading Better BibTex');

    var header = null;
    var data = null;

    try {
      data = Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/BetterBibTex.js");

      if (data) {
        let len = 0;
        for (len = 0; len < 3000; len++) {
          try {
            header = JSON.parse(data.substring(0, len).trim());
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
      console.log("Installing Better BibTex");
      Zotero.Translators.save(header, data);
      //re-initialize Zotero translators so Better Bibtex shows up right away
      Zotero.Translators.init()
      console.log("Better BibTex installed");
    } else {
      console.log("Invalid or missing translator metadata JSON object");
    }
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
// search metadata = indexOf('{')
