class Report {
  constructor() {
    let item;
    this.items = {};
    while ((item = Zotero.nextItem())) {
      if (item.itemType === 'note' || (item.notes || []).length) { this.items[item.itemID] = item; }
    }

    this.itemInCollection = {};
    this.collections = [];
    this.mark(Translator.collections);

    const title = Translator.HTMLEncode(Zotero.getOption('exportFilename').replace(/\.[^\.]*$/i, ''));

    this.html = `<html><head><title>${title}</title></head><body>`;
    const notes = [];
    for (let id of Object.keys(this.items)) {
      item = this.items[id];
      if (this.itemInCollection[id]) { continue; }
      notes.push(item);
    }
    this.notes(notes, 1);

    this.walk(Translator.collections, 1);
    this.html += '</body></html>';
  }

  walk(collection, level) {
    if (!collection && !collection.notes) return;

    this.html += `<h${ level }>${ Translator.HTMLEncode(collection.name) }</h${ level }>\n`;
    const notes = (collection.items.filter((id) => this.items[id]).map((id) => this.items[id]));
    this.notes(notes, level);

    return collection.collections.map((coll) =>
      this.walk(coll, level + 1));
  }

  notes(items, level) {
    for (var item of items) {
      if (this.itemInCollection[item.itemID]) { continue; }
      if (item.itemType !== 'note') { continue; }
      this.note(item);
    }
    for (item of items) {
      if (this.itemInCollection[item.itemID]) { continue; }
      if (item.itemType === 'note') { continue; }
      this.itemWithNotes(item, level + 1);
    }
  }

  note(item) {
    return this.html += `<div>${ item.note }</div>\n`;
  }

  creator(cr) {
    if (!cr.firstName && !cr.lastName) { return ''; }
    return ([cr.lastName, cr.firstName].filter((name) => name)).join(', ');
  }

  itemWithNotes(item, level) {
    let date;
    let { title } = item;

    let creators = item.creators.map(this.creator).filter(creator => creator);
    if (creators.length > 0) {
      creators = creators.join(' and');
    } else {
      creators = null;
    }

    if (item.date) {
      date = Zotero.Utilities.strToDate(item.date);
      if (typeof date.year === 'undefined') {
        ({ date } = item);
      } else {
        date = Zotero.Utilities.strToISO(item.date);
      }
    } else {
      date = null;
    }

    let author = [creators, date].filter(v => v);
    if (author.length > 0) {
      author = `(${author.join(', ')})`;
    } else {
      author = null;
    }

    title = ([item.title || '', author].filter((str) => str)).join(' ');

    this.html += `<h${ level + 1}>${ Translator.HTMLEncode(title) }</h${ level + 1}>\n`;

    return item.notes.map((note) =>
      (this.html += `<div>${ note.note }</div>\n`));
  }

  mark(collection) {
    let coll;
    if (!collection) { return; }
    this.collections.push(collection);

    let notes = false;
    for (let id of collection.items || []) {
      if (!this.items[id]) { continue; }
      this.itemInCollection[id] = true;
      notes = true;
    }
    if (notes) {
      for (coll of this.collections) {
        coll.notes = true;
      }
    }

    for (coll of collection.collections || []) {
      mark(coll);
    }

    return this.collections.pop();
  }
}

const doExport = function() {
  Translator.initialize();
  const report = new Report();

  return Zotero.write(report.html);
};
