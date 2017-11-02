/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Zotero.BetterBibTeX.endpoints = { };
Zotero.BetterBibTeX.endpoints.collection = { supportedMethods: ['GET'] };
Zotero.BetterBibTeX.endpoints.collection.init = function(url, data, sendResponseCallback) {
  let collection, err;
  try {
    collection = url.query[''];
  } catch (error) {
    err = error;
    collection = null;
  }

  if (!collection) {
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path');
    return;
  }

  try {
    let path = collection.split('.');
    if (path.length === 1) {
      sendResponseCallback(404, 'text/plain', `Could not export bibliography '${collection}': no format specified`);
      return;
    }

    let translator = path.pop().toLowerCase();
    translator = Zotero.BetterBibTeX.Translators.getID(translator);
    path = path.join('.');
    if (path.charAt(0) !== '/') { path = `/0/${path}`; }
    path = path.split('/');
    /* removes empty field before first '/' */
    path.shift();

    const libid = parseInt(path.shift());
    if (isNaN(libid)) { throw `Not a valid library ID: ${collectionkey}`; }

    const key = `${path[0]}`;
    let col = null;
    for (let name of path) {
      const children = Zotero.getCollections(col != null ? col.id : undefined, false, libid);
      col = null;
      for (let child of children) {
        if (child.name.toLowerCase() === name.toLowerCase()) {
          col = child;
          break;
        }
      }
      if (!col) { break; }
    }
    if (!col) { col = Zotero.Collections.getByLibraryAndKey(libid, key); }
    if (!col) { throw `${collectionkey} not found`; }

    return Zotero.BetterBibTeX.Translators.translate(translator, {collection: col}, Zotero.BetterBibTeX.displayOptions(url)).then(result => sendResponseCallback(200, 'text/plain', result)).catch(err => sendResponseCallback(500, 'text/plain', `${err}`));

  } catch (error1) {
    err = error1;
    Zotero.BetterBibTeX.log(`Could not export bibliography '${collection}`, err);
    return sendResponseCallback(404, 'text/plain', `Could not export bibliography '${collection}': ${err}`);
  }
};

Zotero.BetterBibTeX.endpoints.library = { supportedMethods: ['GET'] };
Zotero.BetterBibTeX.endpoints.library.init = function(url, data, sendResponseCallback) {
  let err, library;
  try {
    library = url.query[''];
  } catch (error) {
    err = error;
    library = null;
  }

  if (!library) {
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path');
    return;
  }

  try {
    const params = /^\/?([0-9]+)?\/?library.(.*)$/.exec(library);

    const libid = params[1];
    const format = params[2];

    if (libid && !Zotero.Libraries.exists(libid)) {
      sendResponseCallback(404, 'text/plain', `Could not export bibliography: library '${library}' does not exist`);
      return;
    }

    if (!format) {
      sendResponseCallback(404, 'text/plain', `Could not export bibliography '${library}': no format specified`);
      return;
    }

    const translator = Zotero.BetterBibTeX.Translators.getID(format);
    if (!translator) {
      sendResponseCallback(404, 'text/plain', `Could not export bibliography '${library}': unsupported format ${format}`);
      return;
    }

    return Zotero.BetterBibTeX.Translators.translate(translator, {library: libid}, Zotero.BetterBibTeX.displayOptions(url)).then(result => sendResponseCallback(200, 'text/plain', result)).catch(err => sendResponseCallback(500, 'text/plain', `${err}`));

  } catch (error1) {
    err = error1;
    Zotero.BetterBibTeX.log(`Could not export bibliography '${library}'`, err);
    return sendResponseCallback(404, 'text/plain', `Could not export bibliography '${library}': ${err}`);
  }
};

Zotero.BetterBibTeX.endpoints.selected = { supportedMethods: ['GET'] };
Zotero.BetterBibTeX.endpoints.selected.init = function(url, data, sendResponseCallback) {
  let translator;
  try {
    translator = url.query[''];
  } catch (error) {
    const err = error;
    translator = null;
  }

  if (!translator) {
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path');
    return;
  }

  const zoteroPane = Zotero.getActiveZoteroPane();
  const items = Zotero.Items.get(zoteroPane.getSelectedItems().map(item => item.id));

  translator = Zotero.BetterBibTeX.Translators.getID(translator);
  return Zotero.BetterBibTeX.Translators.translate(translator, {items}, Zotero.BetterBibTeX.displayOptions(url)).then(result => sendResponseCallback(200, 'text/plain', result)).catch(err => sendResponseCallback(500, 'text/plain', `${err}`));
};
