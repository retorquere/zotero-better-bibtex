function updatePreferences(load) {
  console.log('better bibtex: updating prefs');
  var serverLabel = document.getElementById('id-zotero-better-bibtex-server');
  var serverAddress = document.getElementById('id-zotero-better-bibtex-server-address');

  var serverEnabled = document.getElementById('id-better-bibtex-preferences-server-enabled').checked;
  var serverPort = null;
  try {
    serverPort = Zotero.BetterBibTex.prefs.zotero.getIntPref('httpServer.port');
  } catch(err) {
    serverEnabled = false;
  }

  var formats = {
    attachmentFormat: {},
    snapshotFormat: {}
  };
  for (var key of Object.keys(formats)) {
    console.log(key);
    formats[key].dflt = Zotero.BetterBibTex.prefs.dflt.getCharPref(key);
    formats[key].user = document.getElementById('id-better-bibtex-preferences-' + key).value;
  }
  document.getElementById('id-zotero-better-bibtex-format-unique-warning').setAttribute('hidden', (
      (formats.attachmentFormat.user == formats.attachmentFormat.dflt)
      &&
      (formats.snapshotFormat.user == formats.snapshotFormat.dflt)
    )
  );

  var url = 'http://localhost:' + serverPort + '/better-bibtex/collection/?';
  serverAddress.setAttribute('value', url);
  console.log('server: ' + serverEnabled + ' @ ' + url);

  serverAddress.setAttribute('hidden', !serverEnabled);
  serverLabel.setAttribute('hidden', !serverEnabled);
  console.log('better bibtex: prefs updated');
}

function resetFormatters()
{
  ['attachmentFormat', 'snapshotFormat'].forEach(function(key) {
    document.getElementById('id-better-bibtex-preferences-' + key).value = Zotero.BetterBibTex.prefs.dflt.getCharPref(key);
    Zotero.BetterBibTex.prefs.bbt.clearUserPref(key);
  });
  updatePreferences();
}
