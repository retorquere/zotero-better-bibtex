var Exporter = new function() {
};

onmessage = function(event) {
  postMessage(Exporter[req.method].apply(null, req.params));
};
