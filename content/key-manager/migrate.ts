import { log } from '../logger'

function prompt(total: number, pinned: number) {
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

  const choice = { action: null, overwrite: false }

  Zotero.getMainWindow().openDialog(
    `data:application/vnd.mozilla.xul+xml;charset=utf-8,${encodeURIComponent(xhtml)}`,
    'migration-dialog',
    'chrome,modal,centerscreen,resizable=no',
    choice
  );

  if (choice.action) {
    Zotero.debug(`Migration Choice: ${choice.action} (Overwrite: ${choice.overwrite})`);
    return choice
  }

  return { action: 'postpone', overwrite: false };
}

export async function migrate() {
  const db = PathUtils.join(Zotero.DataDirectory.dir, 'better-bibtex.sqlite')
  if (!(await File.exists(path))) return

  let migrate: { action: 'forget' | 'all' | 'pinned' | 'postpone'; overwrite: boolean } = { action: 'postpone', overwrite: false }

  try {
    await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtex', [ db ])
    const q =  `
      SELECT bbt.itemID, bbt.itemKey, bbt.libraryID, bbt.citationKey, bbt.pinned
      FROM betterbibtex.citationkey bbt
      WHERE bbt.itemID NOT IN (SELECT itemID FROM deletedItems)
        AND item.itemID NOT IN (SELECT itemID FROM feedItems)
        AND item.itemTypeID NOT IN (
          SELECT itemTypeID
          FROM itemTypes
          WHERE typeName IN ('attachment', 'note', 'annotation')
    `.replace(/\n/g, ' ')

    await Zotero.DB.executeTransaction(async () => {
      let keys: { citationKey: string, itemID: number, pinned: boolean }[] = []
      for (const { citationKey, itemID, pinned } of (await Zotero.DB.queryAsync(q))) {
        keys.push({ citationKey, itemID, pinned: !!pinned })
      }

      migrate = keys.length ? prompt(keys.length, keys.filter(k => k.pinned).length) : { action: 'forget', overwrite: false }
      switch (migrate.action) {
        case 'postpone': return
        case 'forget':
          keys = []
          break
        case 'all':
          break
        case 'pinned':
          keys = keys.filter(k => k.pinned)
          break
      }

      for (const { itemID, citationKey } of keys) {
        const item = await Zotero.Items.getAsync(itemID)
        if (choice.overwrite || !item.getField('citationKey')) {
          item.setField('citationKey', citationKey)
          await item.save()
        }
      }
    })
  }
  catch (err) {
    log.error('migration error:', err)
    migrate.action = 'postpone'
  }
  finally {
    try {
      await Zotero.DB.queryAsync("DETACH DATABASE 'betterbibtex'")
      if (migrate.action !== 'postpone') await Zotero.File.rename(db, 'better-bibtex.migrated')
    }
    catch {}
  }
}
