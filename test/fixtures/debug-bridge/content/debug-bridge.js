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
        Zotero.debug('debug-bridge: executing ' + JSON.stringify(options.data));
        let action = Zotero.Promise.coroutine(new GeneratorFunction(options.data));
        let response;
        try {
          response = yield action(options.query);
          if (typeof response === 'undefined') response = null;
          response = JSON.stringify(response);
        } catch (err) {
          Zotero.debug('debug-bridge failed: ' + err);
          return [500, "application/text", 'debug-bridge failed: ' + err];
        }
        Zotero.debug('debug-bridge succeeded: ' + response);
        return [201, "application/json", response];
      })
    };
    Zotero.debug('debug-bridge: endpoint installed');
  })();
}
