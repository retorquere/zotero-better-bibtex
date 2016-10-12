# Components.utils.importGlobalProperties(['Blob'])
Components.utils.import('resource://zotero/config.js')

Zotero_BetterBibTeX_ErrorReport =
  submit: (filename, data) ->
    return new Promise((resolve, reject) =>
      fd = new FormData()
      for own name, value of @form.fields
        fd.append(name, value)

      file = new Blob([data], { type: 'text/plain'})
      fd.append('file', file, "#{@timestamp}-#{@key}-#{filename}")

      request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance()
      request.open('POST', @form.action, true)

      request.onload = =>

        switch
          when !request.status || request.status > 1000
            reject(Zotero.getString('errorReport.noNetworkConnection') + ': ' + request.status)
          when request.status != parseInt(@form.fields.success_action_status)
            reject(Zotero.getString('errorReport.invalidResponseRepository') + ": #{request.status}, expected #{@form.fields.success_action_status}\n#{request.responseText}")
          else
            resolve()

      request.onerror = ->
        reject(Zotero.getString('errorReport.noNetworkConnection') + ': ' + request.statusText)

      request.send(fd)
    )

  getSystemInfo: ->
    return new Promise((resolve, reject) =>
      Zotero.getSystemInfo((info) =>
        try
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

          resolve()
        catch err
          reject(err)
      )
    )

  init: ->
    @form = JSON.parse(Zotero.File.getContentsFromURL('https://github.com/retorquere/zotero-better-bibtex/releases/download/update.rdf/error-report.json'))
    @key = Zotero.Utilities.generateObjectKey()
    @timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    @params = window.arguments[0].wrappedJSObject
    if @params.references
      document.getElementById('betterbibtex.errorReport.references').hidden = false
      document.getElementById('zotero-error-references').value = @params.references.substring(0, 5000)
    else
      document.getElementById('betterbibtex.errorReport.references').hidden = true
      document.getElementById("zotero-error-include-references").checked = false

    @getSystemInfo().then(=>
      document.getElementById('zotero-error-context').value = @errorlog.info
      document.getElementById('zotero-error-errors').value = @errorlog.errors
      document.getElementById('zotero-error-log').value = @errorlog.truncated

      continueButton.disabled = false
      continueButton.focus()
      return
    )

  config: ->
    enabled = false
    for part in ['context', 'errors', 'log', 'references']
      continue unless document.getElementById("zotero-error-include-#{part}").checked
      enabled = part
      break
    Zotero.BetterBibTeX.debug('selectReportPart:', enabled)
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = !enabled

  sendErrorReport: ->
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    if document.getElementById("zotero-error-include-context").checked
      errorlog = @errorlog.info
    else
      errorlog = "Zotero: #{ZOTERO_CONFIG.VERSION}, Better BibTeX: #{Zotero.BetterBibTeX.release}"

    if document.getElementById("zotero-error-include-errors").checked
      errorlog += "\n\n" + @errorlog.errors

    if document.getElementById("zotero-error-include-log").checked
      errorlog += "\n\n" + @errorlog.full

    @submit('errorlog.txt', errorlog).then(=>
      if @params.references
        return @submit('references.json', @params.references)
      else
        return Promise.resolve()
    ).then(=>
      wizard.advance()
      wizard.getButton('cancel').disabled = true
      wizard.canRewind = false

      document.getElementById('zotero-report-id').setAttribute('value', @key)
      document.getElementById('zotero-report-result').hidden = false
    ).catch((e) ->
      ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)
      ps.alert(null, Zotero.getString('general.error'), e)
      wizard.rewind() if wizard.rewind
    )
