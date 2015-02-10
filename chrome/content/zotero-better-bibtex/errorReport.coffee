Zotero_Error_Report = new class
  init: ->
    wizard = document.getElementById("zotero-error-report")
    continueButton = wizard.getButton("next")
    continueButton.disabled = true
    return

  sendErrorReport: ->
    wizard = document.getElementById("zotero-error-report")
    continueButton = wizard.getButton("next")
    continueButton.disabled = true

    errorData = {
      public: false
      files: {'errorlog.txt': {content: Zotero.getErrors(true).join("\n") } }
    }
    Zotero.HTTP.promise('POST', 'https://api.github.com/gists',
      body: JSON.stringify(errorData)
      successCodes: false
      foreground: true
    ).then(@sendErrorReportCallback).done()
    return

  sendErrorReportCallback = (xmlhttp) ->
    wizard = document.getElementById("zotero-error-report")
    return  unless wizard

    ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService)

    if !xmlhttp.responseText
      try
        if xmlhttp.status > 1000
          ps.alert null, Zotero.getString("general.error"), Zotero.getString("errorReport.noNetworkConnection")
        else
          ps.alert null, Zotero.getString("general.error"), Zotero.getString("errorReport.invalidResponseRepository")
      catch e
        ps.alert null, Zotero.getString("general.error"), Zotero.getString("errorReport.repoCannotBeContacted")
      wizard.rewind()
      return

    try
      report = JSON.parse(xmlhttp.responseText).html_url
    catch
      ps.alert null, Zotero.getString("general.error"), Zotero.getString("errorReport.invalidResponseRepository")
      wizard.rewind()
      return

    wizard.advance()
    wizard.getButton("cancel").disabled = true
    wizard.canRewind = false

    encrypt = new JSEncrypt()
    encrypt.setPublicKey(Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/error-reporting.pub.pem'))
    encrypted = encrypt.encrypt(report)
    document.getElementById("zotero-report-id").setAttribute "value", encrypted
    document.getElementById("zotero-report-result").hidden = false
    return
