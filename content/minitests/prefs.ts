export let Preferences = { // tslint:disable-line:variable-name
  get(key) {
    switch (key) {
      case 'suppresTitleCase': return false
      case 'csquotes': return ''
    }
  },
}
