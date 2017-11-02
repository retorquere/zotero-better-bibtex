net = require('net');
util = require('util');

net.createServer(function (socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort 
  socket.write("> Welcome " + socket.name + "\n");

  // Handle incoming messages from clients.
  socket.on('data', function(data) {
    data = data.toString('utf8');

    console.log(`< ${util.inspect(data)}`)
		socket.write(`> ${data}`);

    if (data.trim() == 'bye!') {
      console.log('>>!');
      socket.destroy();
    }
  });

  socket.on('error', (err) => {
    console.log('error:', err);
    socket.destroy();
  })

  socket.on('end', () => {
    console.log('client gone');
  })
}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");
