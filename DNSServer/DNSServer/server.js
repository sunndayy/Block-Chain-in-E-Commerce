'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var WebSocketServer = require("websocket").server;

var urls = [];

var httpServer = http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(JSON.stringify({
		header: "addrs",
		urls: urls
	}));
});
httpServer.listen(port);

var wsServer = new WebSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false
});

wsServer.on("request", req => {
	var connection = req.accept("echo-protocol", req.origin);
	var url = null;
	connection.on("message", message => {
		try {
			message = JSON.parse(message.utf8Data);
			if (message.header == "addr") {
				url = message.addr;
				if (urls.indexOf(url) < 0) {
					urls.push(url);
				}
			}
		} catch (err) {
			console.log(err);
		}
	});
	connection.on("error", error => {
		console.log("Connection Error: " + error.toString());
	});
	connection.on("close", (reasonCode, description) => {
		var i = urls.indexOf(url);
		if (i >= 0) {
			urls.splice(i, 1);
		}
	});
});