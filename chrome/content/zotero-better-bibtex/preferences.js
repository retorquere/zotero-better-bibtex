function updatePreferences(load) {
  console.log('better bibtex: updating prefs');
  try {
    var restartRequired = false;
  
    for (var option of Object.keys(Zotero.BetterBibTex.config)) {
      var orig = Zotero.BetterBibTex.config[option];
      var current;
      switch (typeof orig) {
        case 'boolean':
           //current = Zotero.BetterBibTex.prefs.getBoolPref(option);
          current = document.getElementById('id-better-bibtex-preferences-' + option).checked;
          break;
        case 'number':
          // current = Zotero.BetterBibTex.prefs.getIntPref(option);
          current = parseInt(document.getElementById('id-better-bibtex-preferences-' + option).value);
          break;
        case 'string':
          // current = Zotero.BetterBibTex.prefs.getCharPref(option);
          current = document.getElementById('id-better-bibtex-preferences-' + option).value;
          if (current && current.trim() == '') { current = null; }
          break;
      }
      
      restartRequired = restartRequired || (current != orig);
    }
  
    var restartLabel = document.getElementById('id-better-bibtex-restart-required');
    restartLabel.setAttribute('hidden', !restartRequired);
    console.log('restart: ' + restartRequired);
  
    var serverLabel = document.getElementById('id-zotero-better-bibtex-server');
    var serverAddress = document.getElementById('id-zotero-better-bibtex-server-address');
  
    // var serverEnabled = Zotero.BetterBibTex.zotPrefs.getBoolPref('httpServer.enabled');
    var serverEnabled = document.getElementById('id-better-bibtex-preferences-server-enabled').checked;
    var serverPort = Zotero.BetterBibTex.zotPrefs.getIntPref('httpServer.port');
    var url = 'http://localhost:' + serverPort + '/better-bibtex/collection/?';
    serverAddress.setAttribute('value', url);
    console.log('server: ' + serverEnabled + ' @ ' + url);
  
    serverAddress.setAttribute('hidden', !serverEnabled);
    serverLabel.setAttribute('hidden', !serverEnabled);
  } catch (err) {
    console.log('better bibtex: updating prefs failed: ' + err);
  }
}
