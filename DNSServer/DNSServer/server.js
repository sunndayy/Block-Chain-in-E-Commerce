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

var wsServer = new WebSocketServer({ httpServer: httpServer });
wsServer.on("request", req => {
	var url = null;
	var connection = req.accept(null, req.origin);
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
	connection.on("close", () => {
		var i = urls.indexOf(url);
		if (i >= 0) {
			urls.splice(i, 1);
		}
	});
	connection.on("error", err => { });
});