if (!Zotero.DebugBridge) {
  Zotero.Promise.coroutine(function* () {
    yield Zotero.initializationPromise;

    var GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;

    Zotero.DebugBridge = {};
    Zotero.DebugBridge.Execute = function() {};
    Zotero.DebugBridge.prototype = {
      supportedMethods: ["POST"],
      supportedDataTypes: '*',
      permitBookmarklet: false,
  
      init: Zotero.Promise.coroutine(function* (options) {
        let action = Zotero.Promise.coroutine(new GeneratorFunction(options.data));
        let response;
        try {
          response = yield action();
        } catch (err) {
          return [500, "application/text", '' + err];
        }
        return [201, "application/json", JSON.stringify(response)];
      })
    };
    Zotero.Server.Endpoints["/debug-bridge/execute"] = Zotero.Server.Connector.Import;
  })();
}
