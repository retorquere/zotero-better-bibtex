export = source => {
  // this.cacheable()

  const src = this.resourcePath.substring(process.cwd().length + 1)

  const loading = `Zotero.debug('BBT: loading ${src}')`
  const loaded = `Zotero.debug('BBT: loaded ${src}')`
  const errvar = '$wrap_loader_catcher_' + src.replace(/[^a-zA-Z0-9]/g, '_')
  const failed = `Zotero.debug('Error: BBT: load of ${src} failed:' + ${errvar} + '::' + ${errvar}.stack)`

  switch (src.split('.').pop()) {
    case 'ts':
      return `${loading}; try { ${source}; ${loaded}; } catch (${errvar}) { ${failed} };`

    default:
      throw new Error(`Unexpected extension on ${src}`)
  }
}
