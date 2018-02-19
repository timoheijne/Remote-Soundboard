var WebSocketServer = require('websocket').server;
var http = require('http');

var users = [];
export class User {
    client = "";
    remote = "";
}

var server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(1337, function () { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    console.log("Connection")

    let clientInfo = {

    }
    connection.send(JSON.stringify({ dataType: 'ConnectionAccepted', payload: 'Test'}))

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            console.log(message);
        }
    });

    connection.on('close', function (connection) {
        // close user connection
        console.log("Disconnect")
    });
});