BBTCoherentExportOptions = (e) ->
  for node in document.getElementById('translator-options').children
    switch node.id
      when 'export-option-exportFileData', 'export-option-Export collections'
        if e.target.id == node.id && node.checked
          document.getElementById('export-option-Keep updated').checked = false

      when 'export-option-Keep updated'
        if e.target.id == node.id && node.checked
          document.getElementById('export-option-Export collections').checked = false
          document.getElementById('export-option-exportFileData').checked = false
  return

Zotero_File_Interface_Export.init = ((original) ->
  return ->
    r = original.apply(@, arguments)

    for node in document.getElementById('translator-options').children
      continue unless node.id.indexOf('export-option-') == 0
      switch node.id
        when 'export-option-exportFileData', 'export-option-Keep updated', 'export-option-Export collections'
          if !node.getAttribute('better-bibtex')
            node.setAttribute('better-bibtex', 'true')
            node.addEventListener('command', BBTCoherentExportOptions)
          node.checked = false if node.id == 'export-option-Keep updated'

    return r
  )(Zotero_File_Interface_Export.init)
