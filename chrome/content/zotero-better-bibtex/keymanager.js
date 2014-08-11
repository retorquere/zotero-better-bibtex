Zotero.BetterBibTeX.KeyManager = new function() {
  var self = this;

  Zotero.DB.query("ATTACH ':memory:' AS 'betterbibtex'");
  Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null)');

  self.syncNeeded = function() {
    if (!Zotero.Sync.Server.enabled) { return false; }
    if (Zotero.Sync.Server.syncInProgress || Zotero.Sync.Server.updatesInProgress) { return true; }

    var params = [];
    var lastSync = Zotero.Sync.Server.lastLocalSyncTime();
    if (lastSync) {
      params = [Zotero.Date.dateToSQL(new Date(lastSync * 1000), true)];
      lastSync = ' where clientDateModified > ?';
    } else {
      lastSync = '';
    }

    return (Zotero.DB.valueQuery('select count(*) from items' + lastSync, params) > 1000); // 1000 is an arbitrary limit to make sure we don't overtax the Zotero sync infrastructure
  }

  self.journalAbbrev = function(item) {
    if (arguments.length > 1) { item = arguments[1]; }
    if (item.journalAbbreviation) { return item.journalAbbreviation; }
    if (!Zotero.BetterBibTeX.prefs.bbt.getBoolPref('auto-abbrev')) { return; }

    var styleID = Zotero.BetterBibTeX.prefs.bbt.getCharPref('auto-abbrev.style');
    if (styleID == '') { styleID = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; })[0]; }
    var style = Zotero.Styles.get(styleID);
    var cp = style.getCiteProc(true);

    cp.setOutputFormat('html');
    cp.updateItems([item.itemID]);
    cp.appendCitationCluster({"citationItems":[{id:item.itemID}], properties:{}}, true);
    cp.makeBibliography();

    if (cp.transform.abbrevs) {
      var abbr = Dict.values(cp.transform.abbrevs);
      abbr = abbr.filter(function(abbrev) { return abbrev['container-title'] && (Object.keys(abbrev['container-title']).length > 0); });
      abbr = [].concat.apply([], abbr.map(function(abbrev) { return Dict.values(abbrev['container-title']); }));
      if (abbr.length > 0) { return abbr[0]; }
    }

    return '';
  }

  self.syncWarn = function() {
    alert('Sync required! Apologies for the inconvenience, please see https://github.com/ZotPlus/zotero-better-bibtex/wiki/Citation-Keys#stable-keys for a full explanation');
  }

  self.extract = function(item) {
    // the sandbox inserts itself in call parameters
    if (arguments.length > 1) { item = arguments[1]; }

    var embeddedKeyRE = /bibtex:\s*([^\s\r\n]+)/;
    var andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/;
    var extra = item.extra;

    if (!extra) { return null; }

    var m = embeddedKeyRE.exec(item.extra) || andersJohanssonKeyRE.exec(item.extra);
    if (!m) { return null; }

    extra = extra.replace(m[0], '').trim();
    item.extra = extra;

    return m[1];
  }

  var findKeysSQL = "" +
    "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
    "from items i " +
    "join itemData id on i.itemID = id.itemID " +
    "join itemDataValues idv on idv.valueID = id.valueID " +
    "join fields f on id.fieldID = f.fieldID  " +
    "where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) and idv.value like '%bibtex:%'";
  var rows = Zotero.DB.query(findKeysSQL) || [];
  rows.forEach(function(row) {
    Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra})]);
  });

  self.set = function(item, citekey) {
    if (arguments.length > 2) {
      item = arguments[1];
      citekey = arguments[2];
    }

    var oldkey = self.extract(item);
    if (oldkey == citekey) { return; } // prevent save loops in the notifier

    item = Zotero.Items.get(item.itemID)

    var _item = {extra: '' + item.getField('extra')};
    self.extract(_item);
    var extra = _item.extra.trim();
    if (extra.length > 0) { extra += " \n"; }
    item.setField('extra', extra + 'bibtex: ' + citekey);

    item.save({ skipDateModifiedUpdate: true });

    Zotero.DB.query('insert or replace into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [item.itemID, item.libraryID || 0, citekey]);
  }

  self.get = function(item) {
    if (arguments.length > 1) { item = arguments[1]; }
    return Zotero.DB.valueQuery('select citekey from betterbibtex.keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]);
  }

  self.clear = function(item) {
    Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [item.itemID]);
  }

  self.updated = function(itemIDs) {
    if (itemIDs.length == 0) { return; }

    itemIDs = '(' + itemIDs.map(function(id) { return '' + parseInt(id); }).join(',') + ')';
    Zotero.DB.query('delete from betterbibtex.keys where itemID in ' + itemIDs);

    var rows = Zotero.DB.query(findKeysSQL + ' and i.itemID in ' + itemIDs) || [];
    rows.forEach(function(row) {
      Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra})]);
    });
  }

  self.isFree = function(citekey, item) {
    if (arguments.length > 2) {
      citekey = arguments[1];
      item = arguments[2];
    }

    var count = null
    if (typeof item.itemID == 'undefined') {
      Zotero.debug('checking whether ' + citekey + ' is free');
      count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and libraryID = ?', [citekey, item.libraryID || 0]);
    } else {
      Zotero.debug('checking whether ' + citekey + ' is taken by anyone else than ' + item.itemID);
      count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and itemID <> ? and libraryID = ?', [citekey, item.itemID, item.libraryID || 0]);
    }
    return (parseInt(count) == 0);
  }
};
