var Exporter = new function() {
};

onmessage = function(event) {
  postMessage(Exporter[req.method].apply(null, req.params));
};

// remember to drop cache on *any* preference change
// https://developer.mozilla.org/en/docs/Storage
// openDatabaseSync
// https://developer.mozilla.org/en-US/docs/Web/API/ChromeWorker
var db=openDatabase('myDB', '', 'my first database', 2 * 1024 * 1024);
db.transaction(function(tx){
   tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)',[],function(tx,results){
      self.postMessage("passed");
   },function(_trans,_error){self.postMessage(_error.message)});
   tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "synergies")',[],function(tx,results){
      self.postMessage("passed");
   },function(_trans,_error){self.postMessage(_error.message)});
});
