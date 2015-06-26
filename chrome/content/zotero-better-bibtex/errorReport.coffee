Zotero_BetterBibTeX_ErrorReport = new class
  constructor: ->
    @form = JSON.parse(Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/logs/s3.json"))
    Zotero.debug("BBT.error.form: #{JSON.stringify(@form)}")

  submit: (filename, data, callback) ->
    Zotero.debug("BBT.error.submit(#{filename}) (#{data.length}) to #{@form.action}")

    params = []
    for own k, v of @form.fields
      params.push(@param(k, v))

    params.push(@file('file', filename, 'text/plain', data))

    boundary = Zotero.Utilities.randomString(32)
    body = ("--#{boundary}\r\n#{p}" for p in params).join('') + "--#{boundary}--\r\n"

    Zotero.HTTP.doPost(@form.action, body, callback, {'Content-type': "multipart/form-data; boundary=#{boundary}"})

  param: (key, value) ->
    return "Content-Disposition: form-data; name=\"#{encodeURIComponent(key)}\"\r\n\r\n#{value}\r\n"

  file: (key, filename, mimetype, content) ->
    return [
      "Content-Disposition: form-data; name=\"#{encodeURIComponent(key)}\"; filename=\"#{encodeURIComponent(filename)}\"\r\n"
      "Content-Transfer-Encoding: binary\r\n"
      "Content-Type: #{mime_type}\r\n"
      "\r\n"
      "#{content}\r\n"
    ].join('')

  errorLog: (limit) ->
    @errors ||= Zotero.getErrors(true).join('\n')

    log = @errors + "\n\n"
    log += @info + "\n\n" if @info
    if limit
      log += Zotero.Debug.get(5000, 80)
    else
      log += Zotero.Debug.get()
    return log

  init: ->
    Zotero.debug('BBT.error.init')
    @key = "#{Zotero.Utilities.generateObjectKey()}-#{Zotero.Utilities.generateObjectKey()}"
    Zotero.debug("BBT.error.init: #{@key}")

    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true
    document.getElementById('zotero-references').hidden = true

    Zotero.debug("BBT.error.init: here we go")

    Zotero.getSystemInfo((info) =>
      @info = info

      if document.getElementById('zotero-failure-message').hasChildNodes()
        textNode = document.getElementById('zotero-failure-message').firstChild
        document.getElementById('zotero-failure-message').removeChild(textNode)
      document.getElementById('zotero-failure-message').appendChild(document.createTextNode(Zotero.getString('errorReport.followingReportWillBeSubmitted')))
      Zotero.debug("BBT.error.init: message set")

      params = window.arguments[0].wrappedJSObject
      if params.references
        document.getElementById('zotero-references').hidden = false
        document.getElementById('zotero-references').value = params.references.substring(0, 5000)
        Zotero.debug("BBT.error.init: references set")

      document.getElementById('zotero-error-message').value = @errorLog(true)
      Zotero.debug("BBT.error.init: error log set")

      continueButton.disabled = false
      continueButton.focus()
      str = Zotero.getString('errorReport.advanceMessage', continueButton.getAttribute('label')).replace('Zotero', 'ZotPlus')
      document.getElementById('zotero-advance-message').setAttribute('value', str)
      Zotero.debug("BBT.error.init: proceed")
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
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.noNetworkConnection') + ': ' + request?.status)
      when request.status != parseInt(@form.fields.success_action_status)
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository'))
      else
        return true

    wizard.rewind() if wizard?.rewind
    return false

  sendErrorReport: ->
    Zotero.debug("BBT.error.send")
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    params = window.arguments[0].wrappedJSObject

    @submit('errorlog.txt', @errorLog(), (request) =>
      Zotero.debug("BBT.error.send done: errorlog.txt")
      return unless @verify(request)

      return @finished() unless params.references

      @submit('references.json', params.references, (request) =>
        Zotero.debug("BBT.error.send done: references.json")
        return unless @verify(request)

        @finished()
      )
    )
