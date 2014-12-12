detectImport = ->
  aux = ''
  while (str = Zotero.read(0x100000)) != false
    aux += str

  return aux.match(/\\citation{/)

doImport = ->
  aux = ''
  while (str = Zotero.read(0x100000)) != false
    aux += str

  re = /\\citation{([^}]+)}/g
  while m = re.exec(aux)
    console.log(m[1])
