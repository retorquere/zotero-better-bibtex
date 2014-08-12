function serverURL(collectionsView, extension)
{
  if (!collectionsView) { return; }
  var itemGroup = collectionsView._getItemAtRow(collectionsView.selection.currentIndex);
  if (!itemGroup) { return; }

  var serverPort = null;
  try {
    serverPort = Zotero.BetterBibTeX.prefs.zotero.getIntPref('httpServer.port');
  } catch(err) {
    return;
  }

  var isLibrary = true;
  for (var type of ['Collection', 'Search', 'Trash', 'Duplicates', 'Unfiled', 'Header', 'Bucket']) {
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
    var libid = collectionsView.getSelectedLibraryID();
    if (libid) {
        url = 'library?/' + libid + '/library' + extension;
    } else {
        url = 'library?library' + extension;
    }
  }

  if (!url) { return; }

  return 'http://localhost:' + serverPort + '/better-bibtex/' + url
}

function BBTstyleChanged(index) {
  var listbox = document.getElementById("better-bibtex-abbrev-style");
  if (index != undefined) {
    var selectedItem = listbox.getItemAtIndex(index);
  } else {
    var selectedItem = listbox.selectedItem;
  }
  var styleID = selectedItem.getAttribute('value');
  Zotero.BetterBibTeX.prefs.bbt.setCharPref('auto-abbrev.style', styleID);
  selectedStyleObj = Zotero.Styles.get(styleID);
  selectedStyleObj.usesAbbreviation;
}

function updatePreferences(load) {
  console.log('better bibtex: updating prefs');

  var serverCheckbox = document.getElementById('id-better-bibtex-preferences-server-enabled');
  var serverEnabled = serverCheckbox.checked;
  serverCheckbox.setAttribute('hidden', (Zotero.isStandalone && serverEnabled));

  // var url = serverURL();
  // if (!url) { serverEnabled = false; }

  document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-change').setAttribute('disabled', !Zotero.BetterBibTeX.KeyManager.allowAutoPin());
  document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-export').setAttribute('disabled', !Zotero.BetterBibTeX.KeyManager.allowAutoPin());

  document.getElementById('id-zotero-better-bibtex-server-warning').setAttribute('hidden', serverEnabled);

  document.getElementById('id-zotero-better-bibtex-recursive-warning').setAttribute('hidden', !document.getElementById('id-better-bibtex-preferences-getCollections').checked);
  document.getElementById('id-better-bibtex-preferences-fancyURLs-warning').setAttribute('hidden', !document.getElementById('id-better-bibtex-preferences-fancyURLs').checked);

  var styles = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; });

  var listbox = document.getElementById("better-bibtex-abbrev-style");
  var fillList = (listbox.children.length == 0)
  var selectedStyle = Zotero.BetterBibTeX.prefs.bbt.getCharPref('auto-abbrev.style');
  var selectedIndex = -1;
  for (var i = 0; i < styles.length; i++) {
    if (fillList) {
      console.log('better bibtex: adding ' + styles[i].styleID + '=' + styles[i].title);
      var itemNode = document.createElement("listitem");
      itemNode.setAttribute("value", styles[i].styleID);
      itemNode.setAttribute("label", styles[i].title);
      listbox.appendChild(itemNode);
    }
    if (styles[i].styleID == selectedStyle) { selectedIndex = i; }
  }

  if (selectedIndex == -1) { selectedIndex = 0; }
  BBTstyleChanged(selectedIndex);

  window.setTimeout(function () {
    console.log('better bibtex: selecting ' + selectedIndex);
    listbox.ensureIndexIsVisible(selectedIndex);
    listbox.selectedIndex = selectedIndex;
  }, 0);

  console.log('better bibtex: prefs updated');
}
