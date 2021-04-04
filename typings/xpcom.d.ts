declare interface DirectoryIterator {
  forEach: (handler: any) => Promise<void>
}
declare interface DirectoryIteratorConstructable {
  new(path: string): DirectoryIterator
}

export declare const OS: {
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
