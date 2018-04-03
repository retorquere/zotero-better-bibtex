
if (Zotero.platform.toLowerCase().startsWith('win')) {
  export let platform = {
    dirsep: '\\',
    shell: 'cmd',
    cd: 'cd /d',
    quote: (str) => str.replace(/([^a-zA-Z0-9])/g, '^\1'),
  }
} else {
  export let platform = {
    dirsep: '/',
    shell: 'bash',
    cd: 'cd',
    quote: (str) => `'${str.replace(/'/g, "\\'")}'`,
  }
}
