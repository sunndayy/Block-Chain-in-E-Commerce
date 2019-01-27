'use strict';
const WebSocketClient = require("websocket").client;
const sha256 = require('sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function Sha256(s) {
	return sha256(s);
}

function Sign(privKey, message) {
	var key = ec.keyFromPrivate(privKey, 'hex');
	var messageHash = sha256(message, { asBytes: true });
	return { message: message, pubKey: key.getPublic('hex'), signature: key.sign(messageHash) };
}

function Verify(signature) {
	var key = ec.keyFromPublic(signature.pubKey, 'hex');
	var messageHash = sha256(signature.message, { asBytes: true });
	return key.verify(messageHash, signature.signature);
}

function GetKey() {
	return ec.genKeyPair().getPrivate('hex');
}

function GetPubKeyHash(privKey) {
	return sha256(ec.keyFromPrivate(privKey).getPublic('hex'));
}

var client = new WebSocketClient();

client.on("connect", connection => {
	connection.on("message", message => {
		message = JSON.parse(message.utf8Data);

		if (message.header == "utxos") {
			//var txIns = [{
			//	preHashTx: message.utxos[1].preHashTx,
			//	outputIndex: message.utxos[1].outputIndex
			//}];
			//var txOuts = [
			//	{
			//		pubKeyHash: "99c8ca5ba6196b7eed7b41cc5d5de535896410b9317f3d4850e669c5cfcf8ec9",
			//		money: 5
			//	},
			//	{
			//		pubKeyHash: "6112f84148e751207ab588ddc7a3ee232d47d66713955393fdcd2b1f11d6ae78",
			//		money: 5
			//	},
			//	{
			//		pubKeyHash: "10bfd7752d0776e4ac9e4e64adba1b5dc285a721c164dadcbc150eddfb2e3aa4",
			//		money: 5
			//	},
			//	{
			//		pubKeyHash: "570c9ed430be8fab70bc46a88deb3842804a796fb8a4ee057bf52c302bf2919b",
			//		money: 4.85
			//	}
			//];
			//var tx = {
			//	txIns: txIns,
			//	txOuts: txOuts
			//};
			//tx.senderSign = Sign("c9220be2aa065de85129acb3f3e1644236f90b31fc164c622e7d97e264cec5c4", JSON.stringify(tx));
			//message = {
			//	header: "tx",
			//	tx: tx
			//};
			//connection.send(JSON.stringify(message));
		}

		if (message.header == "balance") {
			console.log(message.pubKeyHash + ": " + message.balance);
		}
	});

	//connection.send(JSON.stringify({
	//	header: "get_header",
	//	index: 3
	//}));
	//connection.send(JSON.stringify({
	//	header: "get_header",
	//	index: 7
	//}));
	//connection.send(JSON.stringify({
	//	header: "get_header",
	//	index: 8
	//}));

	//connection.send(JSON.stringify({
	//	header: "get_utxos",
	//	pubKeyHash: "10bfd7752d0776e4ac9e4e64adba1b5dc285a721c164dadcbc150eddfb2e3aa4"
	//}));

	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "1e095aff6eef007cb07577f0646e31b3756e6fe8d505462b477cdd273bc2243a"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "2dedf231bb53757027f475dc6a37259348004875cc9882df46b8e1ce3a36c773"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "98f6c0a37f90e594536eb6b2dc5b45c609f35493c40a749ffc2c1a024903e76b"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "368a5b069220e0919d2481f07161c5625ee4167e0a886a9c5c01be81d7b7db12"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "645e939a236c2a4e89ae4c5cdcca7c7f11e98e9567b8f1cbedc5d252ea374432"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "570c9ed430be8fab70bc46a88deb3842804a796fb8a4ee057bf52c302bf2919b"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "99c8ca5ba6196b7eed7b41cc5d5de535896410b9317f3d4850e669c5cfcf8ec9"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "6112f84148e751207ab588ddc7a3ee232d47d66713955393fdcd2b1f11d6ae78"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "10bfd7752d0776e4ac9e4e64adba1b5dc285a721c164dadcbc150eddfb2e3aa4"
	}));
	connection.send(JSON.stringify({
		header: "get_balance",
		pubKeyHash: "28038b422bcfeb9392fe5eebbb57e652d0507cf122a8c77833c32a3766a996a8"
	}));

	// connection.send(JSON.stringify({
	// 	header: "get_utxos",
	// 	pubKeyHash: "98f6c0a37f90e594536eb6b2dc5b45c609f35493c40a749ffc2c1a024903e76b"
	// }));
});
client.connect("ws://eblockchain5.herokuapp.com", "echo-protocol");