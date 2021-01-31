export let Preferences = { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  get(key) {
    switch (key) {
      case 'suppresTitleCase': return false
      case 'csquotes': return ''
    }
  },
}
