#EventEmitter = require('eventemitter4')
#Expect = require('node-expect')
#
#class Stream extends EventEmitter
#  constructor: (host, port) ->
#    transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService)
#    transport = transportService.createTransport(null,0,host,port,null)
#    @out = transport.openOutputStream(0,0,0)
#
#    stream = transport.openInputStream(0,0,0)
#    @in = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream)
#    @in.init(stream)
#
#    @_ready = Zotero.Promise.defer()
#    @ready = @_ready.promise
#
#    listener = {
#      onStartRequest: (request, context) ->
#
#      onStopRequest: (request, context, status) => @close()
#
#      onDataAvailable: (request, context, inputStream, offset, count) => @emit('data', @in.read(count))
#    }
#
#    pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump)
#    pump.init(stream, -1, -1, 0, 0, true)
#    pump.asyncRead(listener, null)
#
#  write: (data) ->
#    @out.write(data, data.length)
#
#  close: ->
#    @in.close()
#    @out.close()
#    @_ready.resolve(true)
#    return
#
#addCitation = ->
#  cayw = new Expect()
#
#  cayw.conversation('addCitation')
#    .expect(
#
#module.exports = addCitation
