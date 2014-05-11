Zotero.Item = function(type) {
  this.itemType = type;
  this.creators = [];
  this.notes = [];
  this.attachments = [];
  this.seeAlso = [];
  this.tags = [];

  this.setNote = function(text) {
    if (this.itemType != 'note') {
      throw ("updateNote() can only be called on notes and attachments");
    }

    if (typeof text != 'string') {
      throw ("text must be a string in Zotero.Item.setNote() (was " + typeof text + ")");
    }

    text = text
      // Strip control characters
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim();

    this._hasNote = text !== '';
    this._noteText = text;
    this._noteTitle = '';

    return true;
  }

  this.complete = function() {
    Zotero.complete(JSON.stringify(this));
  }
};
