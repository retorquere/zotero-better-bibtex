Zotero.BetterBibTex = {
  init: function () {
    // monkey-patch Zotero.Attachments
    Zotero.Attachments.importFromFile = (function (self, original)
    {
      return function (file, sourceItemID, libraryID)
      {
        if (libraryID == null && Zotero.Attachments.getBaseDirectoryRelativePath(file.persistentDescriptor).indexOf('attachments:') == 0) {
          return Zotero.Attachments.linkFromFile(file, sourceItemID);
        } else {
          return original.apply(this, arguments);
        }
      }
    })(this, Zotero.Attachments.importFromFile);
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
