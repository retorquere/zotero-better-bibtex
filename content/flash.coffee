debug = require('./debug.ts')

module.exports = (title, body, timeout = 8) ->
  try
    debug('flash:', {title, body})
    pw = new Zotero.ProgressWindow()
    pw.changeHeadline('Better BibTeX: ' + title)
    body ||= title
    body = body.join("\n") if Array.isArray(body)
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(timeout * 1000)
  catch err
    debug('@flash failed:', {title, body}, err)
  return
