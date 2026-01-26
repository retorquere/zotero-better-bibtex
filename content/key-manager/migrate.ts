async function prompt(total: number, pinned: number) {
  const pinnedOption = pinned
    ? `<html:label><html:input type="radio" name="mig" value="pinned" onchange="toggle(this)"/> Migrate only pinned Better BibTeX citation keys (${pinned}), discarding non-pinned keys</html:label>` 
    : ''

  const xhtml = `
    <window xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
            xmlns:html="http://www.w3.org/1999/xhtml"
            title="Better BibTeX citation key migration"
            width="450" height="320"
            onload="init()">
      <html:style>
        body { font: message-box; padding: 20px; background-color: Dialog; color: DialogText; line-height: 1.4; }
        .option-container { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
        .footer { margin-top: 25px; display: flex; justify-content: flex-end; gap: 10px; }
        .divider { border-top: 1px solid #ccc; margin: 15px 0; }
        button[disabled] { opacity: 0.5; }
        input[type="radio"], input[type="checkbox"] { margin-right: 8px; vertical-align: middle; }
      </html:style>
      
      <html:body>
        <html:div style="font-weight: bold; margin-bottom: 10px;">You have ${total} Better BibTeX stored citation keys</html:div>
        
        <html:div class="option-container">
          <html:label><html:input type="radio" name="mig" value="all" onchange="toggle(this)"/> Migrate all Better BibTeX citation keys</html:label>
          ${pinnedOption}
          <html:label><html:input type="radio" name="mig" value="forget" onchange="toggle(this)"/> Discard all Better BibTeX citation keys</html:label>
        </html:div>

        <html:div class="divider"></html:div>

        <html:div>
          <html:label>
            <html:input type="checkbox" id="overwriteKeys"/> Overwrite existing native keys
          </html:label>
        </html:div>

        <html:div class="footer">
          <html:button id="postponeBtn" onclick="finish('postpone')">Ask me again at next start</html:button>
          <html:button id="okBtn" disabled="true" style="font-weight: bold;" onclick="finish()">Migrate</html:button>
        </html:div>
      </html:body>

      <script type="application/javascript"><![CDATA[
        var selection = null
        function toggle(el) {
          selection = el.value
          document.getElementById('okBtn').disabled = false
        }
        function finish(val) {
          // Use the provided value (for postpone) or the radio selection
          window.arguments[0].action = val || selection
          window.arguments[0].overwrite = document.getElementById('overwriteKeys').checked
          window.close()
        }
        function init() {
          window.sizeToContent()
        }
      ]]></script>
    </window>
  `

  const dataUri = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURIComponent(xhtml)
  let resultObj = { action: null, overwrite: false }

  let win = Zotero.getZoteroWindow();
  win.openDialog(
    dataUri,
    "migration-dialog",
    "chrome,modal,centerscreen,resizable=no",
    resultObj
  );

  // Return the result object or 'postpone' if they closed the window via 'X'
  if (resultObj.action) {
    Zotero.debug(`Migration Choice: ${resultObj.action} (Overwrite: ${resultObj.overwrite})`);
    return resultObj;
  }
  
  return { action: 'postpone', overwrite: false };
}
