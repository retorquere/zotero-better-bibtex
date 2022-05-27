export var genZipBib = async function (path,collection,bib,bibJson){
      let items = collection.getChildItems();
      let noteIDs = [];
      for (let i in items) {
          let item = items[i];
          noteIDs = noteIDs.concat(item.getNotes());
      }
      let parser = Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser);
      let noteHTML=null;
      let attachmentKeyNotes = [];
      for (let i in noteIDs){
          let note = Zotero.Items.get(noteIDs[i]);
          noteHTML = note.getNote();
          let doc = parser.parseFromString(noteHTML, 'text/html');
          let notes = doc.querySelectorAll('img[data-attachment-key]');
          for (let node of notes) {
              attachmentKeyNotes = attachmentKeyNotes.concat(node.getAttribute('data-attachment-key'));
          }

      }
      let zoteroStorageDir = Zotero.Prefs.get('dataDir')+'/storage/';

      let zipFile = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('AChrom',Components.interfaces.nsIFile);
      let tmpLocation = '/tmp/'+path+Zotero.Utilities.randomString();
      zipFile.initWithPath(tmpLocation+'.zip');
      const PR_RDWR  = 0x04;
      const PR_CREATE_FILE = 0x08;
      const PR_TRUNCATE = 0x20;

      let zipWriter = Components.Constructor('@mozilla.org/zipwriter;1','nsIZipWriter');
      try {
      let zipW = new zipWriter();
      zipW.open(zipFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);

      for (let i in attachmentKeyNotes) {
          let fileToAddToZip=FileUtils.File(zoteroStorageDir+attachmentKeyNotes[i]+'/image.png');
          zipW.addEntryFile(path+'/'+attachmentKeyNotes[i]+'/image.png', 0 , fileToAddToZip, false);
      }

      await Zotero.File.putContentsAsync(tmpLocation+'.json', bibJson);
      await Zotero.File.putContentsAsync(tmpLocation+'.bib', bib);
      zipW.addEntryFile(path+'/'+path+'.json', 0 , FileUtils.File(tmpLocation+'.json'), false);
      zipW.addEntryFile(path+'/'+path+'.bib', 0 , FileUtils.File(tmpLocation+'.bib'), false);
      zipW.close();

      return (tmpLocation+'.zip');
      }catch(err){return err}
}
