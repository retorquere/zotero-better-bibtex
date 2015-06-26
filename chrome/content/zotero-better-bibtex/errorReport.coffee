Zotero_BetterBibTeX_ErrorReport = new class
  constructor: ->
    @form = JSON.parse(Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/logs/s3.json"))
    Zotero.debug("BBT.error.form: #{JSON.stringify(@form)}")

  submit: (filename, data, callback) ->
    Zotero.debug("BBT.error.submit(#{filename})")
    try
      fd = new FormData()
      for own name, value of @form.fields
        fd.append(name, value)

      data = new Blob([data], { type: 'text/plain'})
      fd.append('file', data, "#{@key}/#{filename}")

      request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance()
      request.open('POST', @form.action, true)

      request.onreadystatechange = (e) ->
        Zotero.debug("BBT.error.submit.onreadystatechange: #{request.readystate}")
        return unless request.readystate == 4
        callback(request)
      request.onerror = (e) ->
        callback(request)

      request.setRequestHeader('Content-Type', 'multipart/form-data')
      request.send(fd)

    catch err
      Zotero.debug("BBT.error.submit: #{err.message}")
      Zotero.debug("BBT.error.submit: #{err.stack}")
      callback(false)

  init: ->
    Zotero.debug('BBT.error.init')
    date = (new Date()).toISOString().replace(/T.*/, '').replace(/-/g, '')
    @key = "#{date}-#{Zotero.Utilities.generateObjectKey()}"

    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true
    document.getElementById('zotero-references').hidden = true

    Zotero.getSystemInfo((info) ->
      if document.getElementById('zotero-failure-message').hasChildNodes()
        textNode = document.getElementById('zotero-failure-message').firstChild
        document.getElementById('zotero-failure-message').removeChild(textNode)
      document.getElementById('zotero-failure-message').appendChild(document.createTextNode(Zotero.getString('errorReport.followingReportWillBeSubmitted')))

      details = window.arguments[0].wrappedJSObject
      if details.data
        translator = Zotero.BetterBibTeX.getTranslator('BetterBibTeX JSON')
        references = Zotero.BetterBibTeX.translate(translator, details, { exportNotes: true, exportFileData: false })
        document.getElementById('zotero-references').hidden = false
        document.getElementById('zotero-references').value = references

      errorLog = Zotero.File.getContentsFromURL('zotero://debug/').trim()
      errorLog = Zotero.getErrors(true).join('\n').trim() if errorLog == ''
      errorLog = Zotero.getString('errorReport.noErrorsLogged', Zotero.appName) if errorLog == ''
      document.getElementById('zotero-error-message').value = errorLog + "\n\n" + info

      continueButton.disabled = false
      continueButton.focus()
      str = Zotero.getString('errorReport.advanceMessage', continueButton.getAttribute('label')).replace('Zotero', 'ZotPlus')
      document.getElementById('zotero-advance-message').setAttribute('value', str)
    )

  finished: ->
    Zotero.debug("BBT.error.finished")
    wizard = document.getElementById('zotero-error-report')
    wizard.advance()
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    document.getElementById('zotero-report-id').setAttribute('value', @key)
    document.getElementById('zotero-report-result').hidden = false

  verify: (request) ->
    Zotero.debug("BBT.error.verify: #{request.status}")
    wizard = document.getElementById('zotero-error-report')
    ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

    switch
      when !request || !request.status || request.status > 1000
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.noNetworkConnection'))
      when request.status != parseInt(@form.fields.success_action_status)
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository'))
      else
        return true

    wizard.rewind()
    return false

  sendErrorReport: ->
    Zotero.debug("BBT.error.send")
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    details = window.arguments[0].wrappedJSObject

    @submit('errorlog.txt', document.getElementById('zotero-error-message').value, (request) =>
      Zotero.debug("BBT.error.send done: errorlog.txt")
      return unless @verify(request)

      return @finished() unless details.data

      @submit('references.json', document.getElementById('zotero-references').value, (request) =>
        Zotero.debug("BBT.error.send done: references.json")
        return unless @verify(request)

        @finished()
      )
    )
