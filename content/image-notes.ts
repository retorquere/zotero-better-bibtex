/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

export async function genZipBib(path:string,collection:any,bib:string,bibJson:string): Promise<string> {
  const items = collection.getChildItems()
  let noteIDs = []
  for (const i of items) {
    noteIDs = noteIDs.concat(i.getNotes())
  }
  const parser = Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser)
  let noteHTML=null
  let attachmentKeyNotes = []
  for (const i of noteIDs){
    const note = Zotero.Items.get(i)
    noteHTML = note.getNote()
    const doc = parser.parseFromString(noteHTML, 'text/html')
    const notes = doc.querySelectorAll('img[data-attachment-key]')
    for (const node of notes) {
      attachmentKeyNotes = attachmentKeyNotes.concat(node.getAttribute('data-attachment-key'))
    }

  }

  const zipFile = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('AChrom',Components.interfaces.nsIFile)
  const tmpLocation = '/tmp/'+path+String(Zotero.Utilities.randomString())
  zipFile.initWithPath(tmpLocation+'.zip')
  const PR_RDWR  = 0x04
  const PR_CREATE_FILE = 0x08
  const PR_TRUNCATE = 0x20

  const zipWriter = Components.Constructor('@mozilla.org/zipwriter;1','nsIZipWriter')
  try {
    const zipW = new zipWriter()
    zipW.open(zipFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE)

    for (const i of attachmentKeyNotes) {
      const fileToAddToZip=FileUtils.File(String(Zotero.getStorageDirectory())+String(i)+'/image.png')
      zipW.addEntryFile(path+'/'+String(i)+'/image.png', 0 , fileToAddToZip, false)
    }

    await Zotero.File.putContentsAsync(tmpLocation+'.json', bibJson)
    await Zotero.File.putContentsAsync(tmpLocation+'.bib', bib)
    zipW.addEntryFile(path+'/'+path+'.json', 0 , FileUtils.File(tmpLocation+'.json'), false)
    zipW.addEntryFile(path+'/'+path+'.bib', 0 , FileUtils.File(tmpLocation+'.bib'), false)
    zipW.close()

    return (tmpLocation+'.zip')
  }
  catch(err){
    return err
  }
}

