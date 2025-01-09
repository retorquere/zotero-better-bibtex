declare namespace Zotero {
  let BetterBibTeX: import('../content/better-bibtex').BetterBibTeX
  let write: (body: string) => void // needed in translators
  let hiDPI: boolean

  let ItemFields: any
  let Translators: any
  let Translate: any
  let Debug: any
  let Schema: any
  let QuickCopy: any
  let SearchConditions: any

  namespace OpenPDF {
    async function openToPage(attachment: Zotero.Item, page?: number)
  }

  namespace Date {
    function strToDate(string: string): any // object does not allow accessing .day on return value
  }

  interface Item {
    isFeedItem: boolean
  }

  interface Group {
    groupID: number
  }

  namespace Libraries {
    let userLibraryID: number
    function get(libraryID: number): Library
    function exists(libraryID: number): boolean
    function getAll(): Zotero.Library[]
  }

  namespace Collections {
    function get(collectionID: number): Collection
    function getByParent(parentCollectionID: number, recursive?: boolean): Zotero.Collection[]
    function getByLibrary(libraryID: number, recursive?: boolean): Zotero.Collection[]
    function getByLibraryAndKey(libraryID: number, key: string): Zotero.Collection
    function getByLibraryAndKeyAsync(libraryID: number, key: string): Zotero.Collection
  }

  namespace Tags {
    function purge(tagIDs?: number[]): Promise<void>
  }

  namespace DB {
    function queryAsync(sql: string, params?: Zotero.DB.QueryParams, options?: { // 2ns parameter optional
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any[] | undefined> // any instead of object, or const { fileName, metadataJSON } of (await Zotero.DB.queryAsync... does not work
    function queryTx(sql: string, params?: Zotero.DB.QueryParams, options?: { // 2ns parameter optional
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any[] | undefined> // any instead of object, or const { fileName, metadataJSON } of (await Zotero.DB.queryAsync... does not work

    function executeTransaction(func: any, options?: any): Promise<any>
  }

  interface LibraryTree {
    selectLibrary(id: number): void
  }

  namespace Utilities {
    let XRegExp: any
    let Internal: any
    function generateObjectKey(): string
  }
}

declare namespace Zotero_File_Interface {
  function importFile(options: { file: any, createNewCollection?: boolean }): Promise<void>
}

declare function importScripts(url: string): void
type DedicatedWorkerGlobalScope = any
