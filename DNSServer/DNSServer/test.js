var WebSocketClient = require("websocket").client;
var client = new WebSocketClient();
client.on("connectFailed", error => {
	console.log("Connect Error: " + error.toString());
});

client.on("connect", connection => {
	connection.on("error", error => {
		console.log("Connection Error: " + error.toString());
	});
	connection.sendUTF(JSON.stringify({
		header: "addr",
		addr: "phamhuyhoang2109@gmail.com"
	}));
});

client.connect("ws://localhost:1337", "echo-protocol");