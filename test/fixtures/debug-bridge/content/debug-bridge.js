Zotero.debug('debug-bridge load attempt');
if (!Zotero.DebugBridge) {
  Zotero.debug('Installing debug-bridge');

  (async () => {
    await Zotero.Schema.schemaUpdatePromise;

    var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    Zotero.DebugBridge = {};

    Zotero.DebugBridge.Execute = function() {};
    Zotero.Server.Endpoints["/debug-bridge/execute"] = Zotero.DebugBridge.Execute;
    Zotero.DebugBridge.Execute.prototype = {
      supportedMethods: ["POST"],
      supportedDataTypes: '*',
      permitBookmarklet: false,
  
      init: async function (options) {
        const password = {
          expected: Zotero.Prefs.get('debug-bridge.password') || '',
          found: (options.query || {}).password || '',
        }

        Zotero.debug(`debug-bridge: password=${JSON.stringify(password)}`)

        if (password.expected !== password.found) {
          return [401, "text/plain", 'wrong password'];
        }

        Zotero.debug("debug-bridge: executing\n" + options.data);
        let start = new Date()
        let response;
        try {
          let action = new AsyncFunction('query', options.data);
          response = await action(options.query);
          if (typeof response === 'undefined') response = null;
          response = JSON.stringify(response);
        } catch (err) {
          Zotero.debug('debug-bridge failed (' + ((new Date()) - start) + 'ms): ' + err);
          return [500, "application/text", 'debug-bridge failed: ' + err + "\n" + err.stack];
        }
        Zotero.debug('debug-bridge succeeded (' + ((new Date()) - start) + 'ms)');
        return [201, "application/json", response];
      }
    };

    Zotero.DebugBridge.Form = function() {};
    Zotero.Server.Endpoints["/debug-bridge"] = Zotero.DebugBridge.Form;
    Zotero.DebugBridge.Form.prototype = {
      supportedMethods: ["GET"],
      supportedDataTypes: '*',
      permitBookmarklet: false,
  
      init: function (options) {
        return [200, "text/html", Zotero.File.getContentsFromURL('resource://zotero-debug-bridge/index.html')];
      }
    };

    Zotero.debug('debug-bridge: endpoint installed');
  })();
}
