'use strict';
const WebSocketClient = require("websocket").client;
const sha256 = require('sha256');

var i = 0;
var block = {};

var client = new WebSocketClient();

client.on("connect", connection => {
	connection.on("message", message => {
		message = JSON.parse(message.utf8Data);

		if (message.header == "header") {
			if (message.blockHeader != null) {
				block.blockHeader = message.blockHeader
				connection.sendUTF(JSON.stringify({
					header: "get_data",
					blockHeaderHash: sha256(JSON.stringify(block.blockHeader))
				}));
			}
		}

		if (message.header == "data") {
			block.blockData = message.blockData;
			console.log(JSON.stringify(block, null, 4));
			i = i + 1;
			block = {};
			connection.sendUTF(JSON.stringify({
				header: "get_header",
				index: i
			}));
		}
	});

	connection.send(JSON.stringify({
		header: "get_header",
		index: i
	}));
});
client.connect("ws://eblockchain5.herokuapp.com");