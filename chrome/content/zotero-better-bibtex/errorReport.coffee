require('jsencrypt.min.js')

Zotero_BetterBibTeX_ErrorReport = new class
  init: ->
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
      if details.items || details.collection
        translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase')
        references = Zotero.BetterBibTeX.translate(translator, details, { exportCollections: false, exportNotes: true, exportFileData: false })
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
      return
    )
    return

  sendErrorReport: ->
    wizard = document.getElementById('zotero-error-report')
    continueButton = wizard.getButton('next')
    continueButton.disabled = true

    errorData = {
      public: false
      files: {'errorlog.txt': {content: document.getElementById('zotero-error-message').value } }
    }

    details = window.arguments[0].wrappedJSObject
    errorData.files['references.json'] = {content: document.getElementById('zotero-references').value } if details.items || details.collection

    Zotero.HTTP.doPost('https://api.github.com/gists', JSON.stringify(errorData), (xmlhttp) ->
      wizard = document.getElementById('zotero-error-report')
      return  unless wizard

      ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

      if !xmlhttp.responseText
        try
          if xmlhttp.status > 1000
            ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.noNetworkConnection'))
          else
            ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository'))
        catch e
          ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.repoCannotBeContacted'))
        wizard.rewind()
        return

      try
        report = JSON.parse(xmlhttp.responseText).html_url
      catch
        ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository'))
        wizard.rewind()
        return

      encrypt = new JSEncrypt()
      encrypt.setPublicKey(Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/error-reporting.pub.pem'))
      encrypted = encrypt.encrypt(report)

      Zotero.HTTP.doPost('https://www.googleapis.com/urlshortener/v1/url', JSON.stringify({longUrl: "http://zotplus.github.io/report.html##{encrypted}"}), ((xmlhttp) ->
        wizard = document.getElementById('zotero-error-report')
        return  unless wizard

        if !xmlhttp.responseText || xmlhttp.status != 200
          #ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.repoCannotBeContacted'))
          ps.alert(null, Zotero.getString('general.error'), "Status: #{xmlhttp.status}")
          wizard.rewind()
          return

        try
          report = JSON.parse(xmlhttp.responseText).id
        catch
          ps.alert(null, Zotero.getString('general.error'), Zotero.getString('errorReport.invalidResponseRepository'))
          wizard.rewind()
          return

        wizard.advance()
        wizard.getButton('cancel').disabled = true
        wizard.canRewind = false

        document.getElementById('zotero-report-id').setAttribute('value', report)
        document.getElementById('zotero-report-result').hidden = false
        return
        ), {'Content-Type': 'application/json'})

      return
    )
    return
