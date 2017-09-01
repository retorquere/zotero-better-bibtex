Zotero.debug('debug-bridge load attempt');
if (!Zotero.DebugBridge) {
  Zotero.debug('Installing debug-bridge');
  Zotero.Promise.coroutine(function* () {
    yield Zotero.initializationPromise;

    var GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;

    Zotero.DebugBridge = {};
    Zotero.DebugBridge.Execute = function() {};
    Zotero.Server.Endpoints["/debug-bridge/execute"] = Zotero.DebugBridge.Execute;
    Zotero.DebugBridge.Execute.prototype = {
      supportedMethods: ["POST"],
      supportedDataTypes: '*',
      permitBookmarklet: false,
  
      init: Zotero.Promise.coroutine(function* (options) {
        Zotero.debug("debug-bridge: executing\n" + options.data);
        let action = Zotero.Promise.coroutine(new GeneratorFunction(options.data));
        let response;
        let start = new Date()
        try {
          response = yield action(options.query);
          if (typeof response === 'undefined') response = null;
          response = JSON.stringify(response);
        } catch (err) {
          Zotero.debug('debug-bridge failed (' + ((new Date()) - start) + 'ms): ' + err);
          return [500, "application/text", 'debug-bridge failed: ' + err + "\n" + err.stack];
        }
        Zotero.debug('debug-bridge succeeded (' + ((new Date()) - start) + 'ms)');
        return [201, "application/json", response];
      })
    };
    Zotero.debug('debug-bridge: endpoint installed');
  })();
}
