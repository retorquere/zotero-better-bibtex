export async function busyWait(test: () => boolean, msecs = 5000): Promise<void> {
  const start = Date.now()
  const delay = 10
  while (!test()) {
    await Zotero.Promise.delay(delay)
    if (Date.now() - start > msecs) throw new Error(`timeout after ${msecs}ms`)
  }
}
