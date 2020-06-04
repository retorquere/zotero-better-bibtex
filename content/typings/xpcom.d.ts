namespace OS {
  namespace File {
    function exists(path: string): Promise<boolean>
    function read(path: string, options: { encoding: string } ): Promise<string>
    function move(from: string, to: string): Promise<void>
    function remove(path: string, options?: { ignoreAbsent: boolean }): Promise<void>
    function writeAtomic(path: string, data: string, options: { tmpPath: string, encoding: string }): Promise<void>
    function makeDir(path: string, options: { ignoreExisting: boolean }): Promise<void>
    function stat(path: string): { isDir: boolean, size: number, unixMode?: number }

    class DirectoryIterator {
      constructor(path: string)
      forEach(handler: any): Promise<void>
    }
  }

  namespace Path {
    function join(...args: string[]): string
    function dirname(path: string): string
    function basename(path: string): string
  }
}
