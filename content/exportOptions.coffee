debug = require('./debug.coffee')

DOMobserver = null
reset = true

mutex = (e) ->
  debug('clicked', e.target.id)
  exportFileData = document.getElementById('export-option-exportFileData')
  keepUpdated = document.getElementById('export-option-Keep updated')

  return unless exportFileData && keepUpdated

  keepUpdated.disabled = exportFileData.checked

  if e.target.id == exportFileData.id and exportFileData.checked
    keepUpdated.checked = false
  else if e.target.id == keepUpdated.id and keepUpdated.checked
    exportFileData.checked = false
  return

addEventHandlers = ->
  for id in [ 'export-option-exportFileData', 'export-option-Keep updated' ]
    node = document.getElementById(id)
    break unless node

    if reset and id == 'export-option-Keep updated'
      node.checked = false
      reset = false

    return if node.getAttribute('better-bibtex')

    debug('export-options add event handler for ', id)
    node.setAttribute('better-bibtex', 'true')
    node.addEventListener('command', mutex)
  return

window.addEventListener('load', (->
  DOMobserver = new MutationObserver(addEventHandlers)
  DOMobserver.observe(document.getElementById('translator-options'), { attributes: true, subtree: true, childList: true })
  return
), false)

window.addEventListener('unload', (->
  DOMobserver.disconnect()
  return
), false)

# otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
