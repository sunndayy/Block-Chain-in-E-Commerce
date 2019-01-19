'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var WebSocket = require("ws");

var urls = [];

var httpServer = http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(JSON.stringify({
		header: "addrs",
		urls: urls
	}));
});
httpServer.listen(port);

var wsServer = new WebSocket.Server({ server: httpServer });

wsServer.on("connection", ws => {
	var url = null;
	ws.on("message", message => {
		try {
			message = JSON.parse(message);
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
	ws.on("close", (code, reason) => {
		var i = urls.indexOf(url);
		if (i >= 0) {
			urls.splice(i, 1);
		}
	});
	ws.on("error", err => { });
});