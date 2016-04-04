# Components.utils.importGlobalProperties(['Blob'])
Components.utils.import('resource://zotero/config.js')

Zotero_BetterBibTeX_ErrorReport = new class
  constructor: ->
    @form = JSON.parse(Zotero.File.getContentsFromURL('https://github.com/retorquere/zotero-better-bibtex/releases/download/update.rdf/error-report.json'))

  submit: (filename, data, callback) ->
    fd = new FormData()
    for own name, value of @form.fields
      fd.append(name, value)

    file = new Blob([data], { type: 'text/plain'})
    fd.append('file', file, "#{@timestamp}-#{@key}-#{filename}")

    request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance()
    request.open('POST', @form.action, true)

    request.onload = (e) ->
      return unless request.readystate == 4
        callback(request)
    request.onerror = (e) ->
      callback(request)
    request.send(fd)

  init: ->
    @key = Zotero.Utilities.generateObjectKey()
    @timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true
    document.getElementById('betterbibtex.errorReport.references').hidden = true

    Zotero.getSystemInfo((info) =>
      @errorlog = {
        info: info
        errors: Zotero.getErrors(true).join('\n')
        full: Zotero.Debug.get()
      }

      debug = @errorlog.full.split("\n")
      debug = debug.slice(0, 5000) # max 5k lines
      debug = (Zotero.Utilities.ellipsize(line, 80, true) for line in debug) # trim lines
      debug = debug.join("\n")
      @errorlog.truncated = debug

      params = window.arguments[0].wrappedJSObject
      if params.references
        document.getElementById('betterbibtex.errorReport.references').hidden = false
        document.getElementById('zotero-error-references').value = params.references.substring(0, 5000)
      else
        document.getElementById("zotero-error-include-references").checked = false

      document.getElementById('zotero-error-context').value = info
      document.getElementById('zotero-error-errors').value = @errorlog.errors
      document.getElementById('zotero-error-log').value = @errorlog.truncated

      continueButton.disabled = false
      continueButton.focus()
    )

  selectReportPart: ->
    enabled = false
    for part in ['context', 'errors', 'log', 'references']
      continue unless document.getElementById("zotero-error-include-#{part}").checked
      enabled = part
      break
    Zotero.BetterBibTeX.debug('selectReportPart:', enabled)
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = !enabled

  finished: ->
    wizard = document.getElementById('zotero-error-report')
    wizard.advance()
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    document.getElementById('zotero-report-id').setAttribute('value', @key)
    document.getElementById('zotero-report-result').hidden = false

  verify: (request) ->
    wizard = document.getElementById('zotero-error-report')
    ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

    switch
      when !request || !request.status || request.status > 1000
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.noNetworkConnection') + ': ' + request?.status)
      when request.status != parseInt(@form.fields.success_action_status)
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository') + ": #{request.status}, expected #{@form.fields.success_action_status}\n#{request.responseText}")
      else
        return true

    wizard.rewind() if wizard?.rewind
    return false

  sendErrorReport: ->
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    if !document.getElementById("zotero-error-include-context").checked
      @errorlog.info = "Zotero: #{ZOTERO_CONFIG.VERSION}, Better BibTeX: #{Zotero.BetterBibTeX.release}"

    if !document.getElementById("zotero-error-include-errors").checked
      @errorlog.errors = null

    if !document.getElementById("zotero-error-include-log").checked
      @errorlog.full = null

    errorlog = (part for part in [@errorlog.info, @errorlog.errors, @errorlog.full] when part).join("\n\n")

    params = window.arguments[0].wrappedJSObject

    @submit('errorlog.txt', errorlog, (request) =>
      return unless @verify(request)

      return @finished() unless params.references && document.getElementById("zotero-error-include-references").checked

      @submit('references.json', params.references, (request) =>
        return unless @verify(request)

        @finished()
      )
    )
