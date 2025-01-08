interface DirectoryIterator {
  forEach(handler: any): Promise<void>
  close(): void
  next: () => Entry
}
interface DirectoryIteratorConstructable {
  new(path: string): DirectoryIterator // eslint-disable-line @typescript-eslint/prefer-function-type
}

namespace OS {
  namespace File {
    type Entry = { isDir: boolean, size: number, path: string, unixMode?: number }
    type FileInfo = { isDir: boolean, size: number, unixMode?: number, lastModificationDate: Date }
  }
}
declare const OS: {
  // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/OSFile.jsm/OS.File_for_the_main_thread
  File: {
    exists: (path: string) => boolean | Promise<boolean>
    read: (path: string | BufferSource, options?: { encoding?: string }) => ArrayBuffer | Promise<ArrayBuffer>
    move: (from: string, to: string) => void | Promise<void>
    remove: (path: string, options?: { ignoreAbsent: boolean }) => Promise<void>
    writeAtomic: (path: string, data: Uint8Array | string, options?: { tmpPath?: string, encoding?: string }) => void | Promise<void>
    makeDir: (path: string, options?: { ignoreExisting?: boolean }) => void | Promise<void>
    stat: (path: string) => OS.File.FileInfo | Promise<OS.File.FileInfo>
    copy: (src: string, tgt: string, options?: { noOverwrite?: boolean }) => void | Promise<void>
    removeDir: (path: string, options?: { ignoreAbsent?: boolean, ignorePermissions?: boolean }) => void

    DirectoryIterator: DirectoryIteratorConstructable
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/OSFile.jsm/OS.Path
  Path: {
    join: (...args: string[]) => string
    dirname: (path: string) => string
    basename: (path: string) => string
    normalize: (path: string) => string
    split: (path: string) => { absolute: boolean, components: string[], winDrive?: string }
    toFileURI: (path: string) => string
  }

  Constants: {
    Path: {
      homeDir: string
    }
  }
}

interface ZoteroItem {
  id: number
  deleted: boolean
  isRegularItem: () => boolean
  isFeedItem: boolean
  isNote: () => boolean
  isAttachment: () => boolean
  isAnnotation?: () => boolean
  itemTypeID: number
  libraryID: number
  parentID: number
  parentItem?: ZoteroItem
  key: string
  getField: (name: string, unformatted?: boolean, includeBaseMapped?: boolean) => string | number
  setField: (name: string, value: string | number) => void
  getCreators: () => {firstName?: string, lastName: string, fieldMode: number, creatorTypeID: number}[]
  getCreatorsJSON: () => { firstName?: string, lastName?:string, name?: string, creatorType: string }[]
  getNotes: () => number[]
  getCollections: () => number[]
  getAttachments: () => number[]
  getTags: () => { tag: string, type: number }[]
  toJSON: () => import('../gen/typings/serialized-item').Item

  loadAllData: () => Promise<void>
}

type GlobalBBT = {
  // https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
  BetterBibTeX: import('../content/better-bibtex').BetterBibTeX
}
type ZoteroObject = GlobalBBT & Omit<Record<string, any>, keyof GlobalBBT>
declare const Zotero: ZoteroObject

declare const Components: any
declare const rootURI: string
declare const ChromeUtils: any
declare const Services: any
declare const PathUtils: any
declare const IOUtils: any
