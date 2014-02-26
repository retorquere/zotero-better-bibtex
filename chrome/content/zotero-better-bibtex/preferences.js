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

  var dflt = Zotero.BetterBibTex.prefs.dflt.getCharPref('attachmentFormat');
  var user = document.getElementById('id-better-bibtex-preferences-attachmentFormat').value;
  document.getElementById('id-zotero-better-bibtex-format-unique-warning').setAttribute('hidden', (user == dflt));

  var url = 'http://localhost:' + serverPort + '/better-bibtex/collection/?';
  serverAddress.setAttribute('value', url);
  console.log('server: ' + serverEnabled + ' @ ' + url);

  serverAddress.setAttribute('hidden', !serverEnabled);
  serverLabel.setAttribute('hidden', !serverEnabled);
  document.getElementById('id-zotero-better-bibtex-server-warning').setAttribute('hidden', serverEnabled);

  document.getElementById('id-zotero-better-bibtex-recursive-warning').setAttribute('hidden', !document.getElementById('id-better-bibtex-preferences-getCollections').checked);

  var dragons = document.getElementById('id-zotero-better-bibtex-dragons');
  var hidden = true;
  [].forEach.call(dragons.childNodes, function(warning) {
    if (warning.getAttribute('hidden')) {
      hidden = (hidden && (warning.getAttribute('hidden') == 'true'));
    }
  });
  dragons.setAttribute('hidden', hidden);

  console.log('better bibtex: prefs updated');

}

function resetFormatters()
{
  document.getElementById('id-better-bibtex-preferences-attachmentFormat').value = Zotero.BetterBibTex.prefs.dflt.getCharPref('attachmentFormat');
  Zotero.BetterBibTex.prefs.bbt.clearUserPref('attachmentFormat');
  updatePreferences();
}
