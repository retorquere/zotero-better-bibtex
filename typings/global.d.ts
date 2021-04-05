interface DirectoryIterator {
  forEach(handler: any): Promise<void>
}
interface DirectoryIteratorConstructable {
  new(path: string): DirectoryIterator // eslint-disable-line @typescript-eslint/prefer-function-type
}

interface PromiseConstructable {
  new(resolver: (resolve: any, reject: any) => void): Promise // eslint-disable-line @typescript-eslint/prefer-function-type
}

declare const OS: {
  File: {
    exists: (path: string) => Promise<boolean>
    read: (path: string, options: { encoding: string } ) => Promise<string>
    move: (from: string, to: string) => Promise<void>
    remove: (path: string, options?: { ignoreAbsent: boolean }) => Promise<void>
    writeAtomic: (path: string, data: string, options: { tmpPath: string, encoding: string }) => Promise<void>
    makeDir: (path: string, options: { ignoreExisting: boolean }) => Promise<void>
    stat: (path: string) => { isDir: boolean, size: number, unixMode?: number }

    DirectoryIterator: DirectoryIteratorConstructable
  }

  Path: {
    join: (...args: string[]) => string
    dirname: (path: string) => string
    basename: (path: string) => string
  }
}

// https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
declare const Zotero: {
  [attr: string]: any
  BetterBibTeX: import('../content/better-bibtex').CBetterBibTeX
}
