Zotero.BetterBibTeX.KeyManager = new function() {
  var self = this;

  Zotero.DB.query("ATTACH ':memory:' AS 'betterbibtex'");
  Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null)');

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

  var rows = Zotero.DB.query("" +
    "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
    "from items i " +
    "join itemData id on i.itemID = id.itemID " +
    "join itemDataValues idv on idv.valueID = id.valueID " +
    "join fields f on id.fieldID = f.fieldID  " +
    "where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) and idv.value like '%bibtex:%'");
  rows.forEach(function(row) {
    Zotero.debug('load: ' + JSON.stringify(row));
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
    if (extra.length > 0) { extra += "\n"; }
    item.setField('extra', extra + 'bibtex: ' + citekey);

    item.save({ skipDateModifiedUpdate: true });

    Zotero.DB.query('insert or replace into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [item.itemID, item.libraryID || 0, citekey]);
  }

  self.clear = function(item) { // NOT FOR TRANSLATOR
    Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [item.itemID]);
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
