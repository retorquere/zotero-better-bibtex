declare namespace Zotero {
  let BetterBibTeX: import('../content/better-bibtex').BetterBibTeX

  let version: string
  let clientName: string
  let write: (body: string) => void // needed in translators
  let hiDPI: boolean
  let getActiveZoteroPane: function(): any
  let getTranslatorsDirectory: function(): any
  let debug: (msg: string) => void
  let getString: (name: string, params?: string | string[], num?: number) => string
  let getMainWindow: () => Window
  let getInstalledExtensions: () => Promise<any[]>
  let getTempDirectory: () => { path: string }
  let isWin: boolean
  let initializationPromise: Promise<void>
  let proxyAuthComplete: Promise<void>
  let getErrors: (asStrings?: boolean) => string[]
  let locale: string

  let API: any
  let Annotations: any
  let Attachments: any
  let Cite: any
  let DataObjects: any
  let Debug: any
  let Feeds: any
  let File: any
  let Groups: any
  let HTTP: any
  let Integration: any
  let ItemFields: any
  let ItemPaneManager: any
  let ItemTreeManager: any
  let ItemTypes: any
  let Items: any
  let Notifier: any
  let PDFRenderer: any
  let PreferencePanes: any
  let Prefs: any
  let ProgressWindow: any
  let Promise: any
  let QuickCopy: any
  let Schema: any
  let Search: any
  let SearchConditions: any
  let Server: any
  let Styles: any
  let Sync: any
  let Translate: any
  let Translators: any
  let URI: any

  interface Search {
    addCondition(
      condition: _ZoteroTypes.Search.Conditions,
      operator: _ZoteroTypes.Search.Operator,
      value: number,
      required?: boolean,
    ): number

    addCondition(condition: 'blockStart' | 'blockEnd'): number
  }

  namespace DataDirectory {
    let dir: string
  }

  namespace OpenPDF {
    async function openToPage(attachment: Zotero.Item, page?: number)
  }

  namespace Date {
    function strToDate(string: string): any // object does not allow accessing .day on return value
    function dateToSQL(date: Date, toUTC?: boolean): string
  }

  interface Item {
    id: number
    parentID: number
    key: string
    deleted: boolean
    itemTypeID: number
    libraryID: number
    isFeedItem: boolean
    isRegularItem(): boolean
    isNote(): boolean
    isAnnotation(): boolean
    isAttachment(): boolean
    getTags(): { tag: string, type?: number }[]
    getNotes(): number[]
    getAttachments(includeTrashed?: boolean): number[]
    getField(field: string, unformatted?: boolean, includeBaseMapped?: boolean): string
    setField(field: string | number, value: string, loadIn?: boolean): void
    getCreatorsJSON(): { firstName?: string, lastName?: string, name?: string, creatorType: string }[]
    toJSON(): any
    loadAllData(reload?: boolean): Promise<void>
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

  interface Collection {
    id: number
    name: string
    parentID: number
    libraryID: number

    getChildCollections(asIDs?: boolean, includeTrashed?: boolean): Collection[] | number[]
    getChildItems(asIDs?: boolean, includeTrashed?: boolean): Item[] | number[]

    toJSON(options?: object): {
      key: string
      name: string
      version: 68
      parentCollection: string | false
      relations: _ZoteroTypes.ObjectRelations
    }
  }

  namespace Collections {
    function get(collectionID: number): Collection
    function getByParent(parentCollectionID: number, recursive?: boolean): Zotero.Collection[]
    function getByLibrary(libraryID: number, recursive?: boolean): Zotero.Collection[]
    function getByLibraryAndKey(libraryID: number, key: string): Zotero.Collection
    function getByLibraryAndKeyAsync(libraryID: number, key: string): Zotero.Collection
    function getAsync(id: number | number[], options?: any): Promise<Collection>
  }

  namespace Tags {
    function purge(tagIDs?: number[]): Promise<void>
  }

  namespace DB {
    function queryAsync(sql: string, params?: Zotero.DB.QueryParams, options?: { // 2nd parameter optional
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any[] | undefined> // any instead of object, or const { fileName, metadataJSON } of (await Zotero.DB.queryAsync... does not work

    function queryTx(sql: string, params?: Zotero.DB.QueryParams, options?: {
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any[] | undefined>

    function columnQueryAsync(sql: string, params?: Zotero.DB.QueryParams, options?: {
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any[] | undefined>

    function valueQueryAsync(sql: string, params?: Zotero.DB.QueryParams, options?: {
        inBackup?: boolean
        noParseParams?: boolean
        onRow?: (row: unknown, cancel: unknown) => void
        noCache?: boolean
      },
    ): Promise<any>

    function executeTransaction(func: any, options?: any): Promise<any>

    function tableExists(table: string, schema?: string): Promise<boolean>
  }

  interface LibraryTree {
    selectLibrary(id: number): void
  }

  namespace Utilities {
    let XRegExp: any
    let Internal: any
    let Item: any
    function generateObjectKey(): string
    function randomString(len?: number, chars?: string): string
  }
}

declare namespace Zotero_File_Interface {
  function importFile(options: { file: any, createNewCollection?: boolean }): Promise<void>
}

declare function importScripts(url: string): void
type DedicatedWorkerGlobalScope = any
declare const FileUtils: any
declare const PathUtils: any
declare const Components: any
declare const IOUtils: any
declare const Services: any
declare const rootURI: string
