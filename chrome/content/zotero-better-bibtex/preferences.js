function serverURL(collectionsView, extension)
{
  if (!collectionsView) { return; }
  var itemGroup = collectionsView._getItemAtRow(collectionsView.selection.currentIndex);
  if (!itemGroup) { return; }

  var serverPort = null;
  try {
    serverPort = Zotero.BetterBibTex.prefs.zotero.getIntPref('httpServer.port');
  } catch(err) {
    return;
  }

  var isLibrary = true;
  for (var type of ['Collection', 'Search', 'Trash', 'Group', 'Duplicates', 'Unfiled', 'Header', 'Bucket']) {
    if (itemGroup['is' + type]()) {
      isLibrary = false;
      break;
    }
  }

  var url = null;

  if (itemGroup.isCollection()) {
    collection = collectionsView.getSelectedCollection();
    url = 'collection?/' + (collection.libraryID || 0) + '/' + collection.key + extension;
  }

  if (isLibrary) {
    url = 'library?library' + extension;
  }

  if (!url) { return; }

  return 'http://localhost:' + serverPort + '/better-bibtex/' + url
}

function updatePreferences(load) {
  console.log('better bibtex: updating prefs');

  var serverCheckbox = document.getElementById('id-better-bibtex-preferences-server-enabled');
  var serverEnabled = serverCheckbox.checked;
  serverCheckbox.setAttribute('hidden', (Zotero.isStandalone && serverEnabled));

  // var url = serverURL();
  // if (!url) { serverEnabled = false; }

  var dflt = Zotero.BetterBibTex.prefs.dflt.getCharPref('attachmentFormat');
  var user = document.getElementById('id-better-bibtex-preferences-attachmentFormat').value;
  document.getElementById('id-zotero-better-bibtex-format-unique-warning').setAttribute('hidden', (user == dflt));

  console.log('server: ' + serverEnabled + ' @ ' + url);

  document.getElementById('id-zotero-better-bibtex-server-warning').setAttribute('hidden', serverEnabled);

  document.getElementById('id-zotero-better-bibtex-recursive-warning').setAttribute('hidden', !document.getElementById('id-better-bibtex-preferences-getCollections').checked);
  document.getElementById('id-better-bibtex-preferences-fancyURLs-warning').setAttribute('hidden', !document.getElementById('id-better-bibtex-preferences-fancyURLs').checked);

  console.log('better bibtex: prefs updated');

}

function resetFormatters()
{
  document.getElementById('id-better-bibtex-preferences-attachmentFormat').value = Zotero.BetterBibTex.prefs.dflt.getCharPref('attachmentFormat');
  Zotero.BetterBibTex.prefs.bbt.clearUserPref('attachmentFormat');
  updatePreferences();
}
