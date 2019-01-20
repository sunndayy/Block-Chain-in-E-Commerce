const http = require("http");
const WebSocketServer = require("websocket").server;
const WebSocketClient = require("websocket").client;
const fs = require("fs");
const Crypto = require("./Crypto");
const Const = require("./Const");
const Tx = require("./Core").Tx;
const BlockHeader = require("./Core").BlockHeader;
const BlockData = require("./Core").BlockData;
const BlockChain = require("./Core").BlockChain;

// Message header
const GET_ADDRS = "get_addrs";
const ADDRS = "addrs";
const VERSION = "version";
const VERACK = "verack";
const GET_HEADER = "get_header";
const HEADER = "header";
const GET_DATA = "get_data";
const DATA = "data";
const GET_UTXOS = "get_utxos";
const UTXOS = "utxos";
const GET_BALANCE = "get_balance";
const BALANCE = "balance";
const TX = "tx";
const NEED_VALIDATING = "need_validating";
const VALIDATE_RESULT = "validate_result";
const FOLLOW = "follow";
const FOLLOW_SUCCESS = "follow_success";
const TX_RESULT = "tx_result";
const ERROR = "error";

// My info
var myPrivKey = fs.readFileSync(Const.privKeyFile).toString();
var myPubKeyHash = Crypto.GetPubKeyHash(myPrivKey);
var myUrl = fs.readFileSync(Const.urlFile).toString();

var nodes = {};
var myBlockChain = new BlockChain();
var tmpBlocks = [];
var nextBlock = JSON.parse(fs.readFileSync(Const.nextBlockFile).toString());
nextBlock.blockHeader = new BlockHeader(nextBlock.blockHeader);
if (nextBlock.blockData) {
	nextBlock.blockData = new BlockData(nextBlock.blockData.txs);
}
tmpBlocks.push(nextBlock);
var state = 1;
var tmpHeaders = [];
var txPool = [];
var timeout1 = null;
var timeout2 = null;
var unCompletedBlock = null;
var followers = {};

function CollectNewBlock() {
	var usedUtxos = [];
	for (var i = 0; i < nextBlock.blockData.txs.length; i++) {
		if (nextBlock.blockData.txs[i].txIns) {
			for (var j = 0; j < nextBlock.blockData.txs[i].txIns.length; j++) {
				usedUtxos.push(nextBlock.blockData.txs[i].txIns[j]);
			}
		}
	}
	var validTxs = txPool.filter(tx => {
		for (var i = 0; i < tx.txIns.length; i++) {
			if (usedUtxos.find(utxo => {
				return utxo.preHashTx == tx.txIns[i].preHashTx
					&& utxo.outputIndex == tx.txIns[i].outputIndex
			})) {
				return false;
			}
		}
		return true;
	});
	if (validTxs.length >= Const.nTx) {
		var newBlockData = new BlockData(validTxs.slice(0, Const.nTx));
		newBlockData.AddCreatorReWard(myPubKeyHash);
		var newBlockHeader = new BlockHeader({
			index: nextBlock.blockHeader.index + 1,
			preBlockHash: nextBlock.blockHeader.GetHash(),
			merkleRoot: newBlockData.MerkleRoot(),
			validatorSigns: []
		});
		unCompletedBlock = {
			blockHeader: newBlockHeader,
			blockData: newBlockData
		};
		myBlockChain.GetTopWallets().forEach(pubKeyHash => {
			var node = nodes[pubKeyHash];
			if (node) {
				node.Write({
					header: NEED_VALIDATING,
					index: newBlockHeader.index,
					preBlockHash: newBlockHeader.preBlockHash,
					merkleRoot: newBlockHeader.merkleRoot
				});
			}
		});
	}
}

function Connect(url) {
	var client = new WebSocketClient();
	client.on("connectFailed", error => { });
	client.on("connect", connection => {
		var node = new Node(connection);
		node.Write({
			header: VERSION,
			url: myUrl,
			pubKeyHash: myPubKeyHash,
			wantConnect: true
		});
	});
	client.connect("ws://" + url);
}

function AddBlock(newBlock, preBlock) {
	myBlockChain.AddBlock(preBlock.blockHeader, preBlock.blockData);
	unCompletedBlock = null;
	tmpHeaders = tmpHeaders.filter(blockHeader => {
		return blockHeader.index > preBlock.blockHeader.index;
	});
	tmpBlocks = tmpBlocks.filter(block => {
		return block.blockHeader.index > preBlock.blockHeader.index;
	});
	txPool = txPool.filter(tx => {
		return myBlockChain.ValidateTx(tx);
	});
	preBlock.blockData.txs.forEach(tx => {
		var concerners = [];
		if (tx.senderSign) {
			concerners.push(Crypto.Sha256(tx.senderSign.pubKey));
		}
		for (var i = 0; i < tx.txOuts.length; i++) {
			var receiver = tx.txOuts[i].pubKeyHash;
			if (concerners.indexOf(receiver) < 0) {
				concerners.push(receiver);
			}
		}
		concerners.forEach(pubKeyHash => {
			if (followers[pubKeyHash]) {
				followers[pubKeyHash].forEach(node => {
					node.Write({
						header: TX_RESULT,
						hashTx: Crypto.Sha256(JSON.stringify(tx)),
						message: tx.message,
						result: "Thanh cong"
					});
				});
			}
		});
	});
	nextBlock = newBlock;
	state = 2;
	try {
		clearTimeout(timeout1);
	} catch (err) {
		console.log(err.toString());
	}
	timeout1 = setTimeout(() => {
		state = 3;
		if (myBlockChain.IsOnTop(myPubKeyHash)) {
			var message = {
				header: HEADER,
				blockHeader: nextBlock.blockHeader
			};
			myBlockChain.GetTopWallets().forEach(pubKeyHash => {
				var node = nodes[pubKeyHash];
				if (node) {
					node.Write(message);
				}
			});
		}
		timeout1 = setTimeout(() => {
			state = 1;
			try {
				clearTimeout(timeout2);
			} catch (err) {
				console.log(err.toString());
			}
			if (!myBlockChain.IsOnTop(myPubKeyHash)) {
				timeout2 = setTimeout(() => {
					CollectNewBlock();
				}, myBlockChain.GetTimeMustWait(myPubKeyHash));
			}
		}, Const.consensusDuration);
	}, Const.blockDuration - Const.consensusDuration);
}

class Node {
	constructor(connection) {
		this.connection = connection;
		this.followees = [];
		this.connection.on("error", err => {
			console.log(err.toString());
		});
		this.connection.on("message", message => {
			try {
				message = JSON.parse(message.utf8Data);
				this.HandleMessage(message);
			} catch (err) {
				this.Write(JSON.stringify({
					header: ERROR,
					error: err.toString()
				}));
			}
		});
		this.connection.on("close", () => {
			if (this.pubKeyHash) {
				if (nodes[this.pubKeyHash]) {
					delete nodes[this.pubKeyHash];
				}
				Connect(this.url);
			}
			this.followees.forEach(followee => {
				var index = followers[followee].indexOf(this);
				if (index >= 0) {
					followers[followee].splice(index, 1);
				}
			});
		});
	}

	Write(message) {
		this.connection.sendUTF(JSON.stringify(message));
	}

	HandleMessage(message) {
		switch (message.header) {
			case GET_ADDRS: {
				var allNodes = Object.values(nodes);
				var allUrls = allNodes.map(node => {
					return node.url;
				});
				this.Write({
					header: ADDRS,
					urls: allUrls
				});
				break;
			}

			case ADDRS: {
				var allNodes = Object.values(nodes);
				var allUrls = allNodes.map(node => {
					return node.url;
				});
				message.urls.forEach(url => {
					if (allUrls.indexOf(url) < 0) {
						Connect(url);
					}
				});
				break;
			}

			case VERSION: {
				this.url = message.url;
				this.pubKeyHash = message.pubKeyHash;
				if (message.wantConnect) {
					this.Write({
						header: VERSION,
						url: myUrl,
						pubKeyHash: myPubKeyHash
					});
				} else {
					this.Write({
						header: VERACK,
						wantConnect: true
					});
				}
				break;
			}

			case VERACK: {
				if (!nodes[this.pubKeyHash]) {
					nodes[this.pubKeyHash] = this;
				}
				if (message.wantConnect) {
					this.Write({
						header: VERACK
					});
				} else {
					var nextBlockIndex = null;
					if (myBlockChain.GetLength() == 1) {
						nextBlockIndex = 2;
					} else {
						nextBlockIndex = myBlockChain.GetLength();
					}
					this.Write({
						header: GET_HEADER,
						index: nextBlockIndex
					});
				}
				break;
			}

			case GET_HEADER: {
				var blockHeader = null;
				if (message.index == myBlockChain.GetLength()) {
					blockHeader = nextBlock.blockHeader;
				} else {
					blockHeader = myBlockChain.GetHeader(message.index);
				}
				this.Write({
					header: HEADER,
					blockHeader: blockHeader
				});
				break;
			}

			case HEADER: {
				if (message.blockHeader) {
					var blockHeader = new BlockHeader(message.blockHeader);
					var preBlockHeader = null;
					if (blockHeader.index == myBlockChain.GetLength() + 1) {
						var preBlock = tmpBlocks.find(block => {
							return block.blockHeader.GetHash() == blockHeader.preBlockHash;
						});
						if (preBlock) {
							preBlockHeader = preBlock.blockHeader;
						}
					} else if (blockHeader.index == myBlockChain.GetLength()) {
						preBlockHeader = myBlockChain.GetHeader(blockHeader.index - 1);
					}
					if (preBlockHeader) {
						if (myBlockChain.ValidateBlockHeader(blockHeader, preBlockHeader)) {
							tmpHeaders.push(blockHeader);
							this.Write({
								header: GET_DATA,
								blockHeaderHash: blockHeader.GetHash()
							});
						}
					}
				}
				break;
			}

			case GET_DATA: {
				myBlockChain.GetData(message.blockHeaderHash, blockData => {
					if (!blockData) {
						if (message.blockHeaderHash == nextBlock.blockHeader.GetHash()) {
							blockData = nextBlock.blockData;
						}
					}
					this.Write({
						header: DATA,
						blockHeaderHash: message.blockHeaderHash,
						blockData: blockData,
						sign: Crypto.Sign(myPrivKey, message.blockHeaderHash)
					});
				});
				break;
			}

			case DATA: {
				if (message.blockData) {
					var blockHeader = tmpHeaders.find(blockHeader => {
						return blockHeader.GetHash() == message.blockHeaderHash;
					});
					if (blockHeader) {
						var blockData = new BlockData(message.blockData.txs);
						if (myBlockChain.ValidateBlockData(blockData, blockHeader)) {
							tmpHeaders.splice(tmpHeaders.indexOf(blockHeader), 1);
							var newBlock = {
								blockHeader: blockHeader,
								blockData: blockData
							};
							tmpBlocks.push(newBlock);
							this.Write({
								header: GET_HEADER,
								index: blockHeader.index + 1
							});
							if (blockHeader.index == myBlockChain.GetLength() + 1) {
								var preBlock = tmpBlocks.find(block => {
									return block.blockHeader.GetHash() == blockHeader.preBlockHash;
								});
								AddBlock(newBlock, preBlock);
							} else if (blockHeader.index == myBlockChain.GetLength()) {
								if (state == 2) {
									if (blockHeader.GetTimeStamp() < nextBlock.blockHeader.GetTimeStamp()) {
										nextBlock = newBlock;
									}
								} else if (state == 3) {
									if (Crypto.Verify(message.sign)
										&& message.sign.message == blockHeader.GetHash()
										&& myBlockChain.IsOnTop(Crypto.Sha256(message.sign.pubKey))
										&& blockHeader.GetTimeStamp() < nextBlock.blockHeader.GetTimeStamp()
									) {
										nextBlock = newBlock;
									}
								}
							}
						}
					}
				}
				break;
			}

			case GET_UTXOS: {
				var usedUtxos = [];
				for (var i = 0; i < nextBlock.blockData.txs.length; i++) {
					if (nextBlock.blockData.txs[i].txIns) {
						for (var j = 0; j < nextBlock.blockData.txs[i].txIns.length; j++) {
							usedUtxos.push(nextBlock.blockData.txs[i].txIns[j]);
						}
					}
				}
				var utxos = myBlockChain.GetUtxos(message.pubKeyHash);
				utxos = utxos.filter(utxo => {
					return usedUtxos.find(_utxo => {
						return _utxo.preHashTx == utxo.preHashTx
							&& _utxo.outputIndex == utxo.outputIndex;
					}) == null;
				});
				this.Write({
					header: UTXOS,
					pubKeyHash: message.pubKeyHash,
					utxos: utxos
				});
				break;
			}

			case GET_BALANCE: {
				this.Write({
					header: BALANCE,
					pubKeyHash: message.pubKeyHash,
					balance: myBlockChain.GetTotalMoney(message.pubKeyHash)
				});
				break;
			}

			case TX: {
				var tx = new Tx(message.tx);
				if (message.needBroadcasting) {
					var allNodes = Object.values(nodes);
					allNodes.forEach(node => {
						node.Write({
							header: TX,
							tx: tx
						});
					});
				}
				var result = myBlockChain.ValidateTx(tx);
				if (result == "Dang xu ly") {
					txPool.push(tx);
					if (state == 1
						&& myBlockChain.GetTimeMustWait(myPubKeyHash) <= 0
						&& unCompletedBlock == null
						&& !myBlockChain.IsOnTop(myPubKeyHash)) {
						CollectNewBlock();
					}
				}
				this.Write({
					header: TX_RESULT,
					hashTx: Crypto.Sha256(JSON.stringify(tx)),
					result: result
				});
				break;
			}

			case NEED_VALIDATING: {
				if (state == 1) {
					var isAgreed = false;
					if (message.index == nextBlock.blockHeader.index + 1
						&& message.preBlockHash == nextBlock.blockHeader.GetHash()) {
						isAgreed = true;
					}
					var sign = Crypto.Sign(myPrivKey, JSON.stringify({
						index: nextBlock.blockHeader.index + 1,
						preBlockHash: nextBlock.blockHeader.GetHash(),
						merkleRoot: message.merkleRoot,
						timeStamp: (new Date()).getTime(),
						isAgreed: isAgreed
					}));
					this.Write({
						header: VALIDATE_RESULT,
						sign: sign
					});
				}
				break;
			}

			case VALIDATE_RESULT: {
				if (state == 1) {
					if (unCompletedBlock.blockHeader.ValidateSign(message.sign)) {
						if (myBlockChain.IsOnTop(Crypto.Sha256(message.sign.pubKey))) {
							if (!unCompletedBlock.blockHeader.validatorSigns.find(sign => {
								return sign.pubKey == message.sign.pubKey
							})) {
								if (nextBlock.blockHeader.validatorSigns) {
									if (nextBlock.blockHeader.validatorSigns.find(sign => {
										return sign.pubKey == message.sign.pubKey;
									}) != null) {
										break;
									}
								}
								unCompletedBlock.blockHeader.validatorSigns.push(message.sign);
								if (unCompletedBlock.blockHeader.validatorSigns.length == Const.n) {
									unCompletedBlock.blockHeader.validatorSigns.sort((sign1, sign2) => {
										var timeStamp1 = JSON.parse(sign1.message).timeStamp;
										var timeStamp2 = JSON.parse(sign2.message).timeStamp;
										return timeStamp1 - timeStamp2;
									});
									var validatorPubKeyHashes = unCompletedBlock.blockHeader.validatorSigns.map(sign => {
										return Crypto.Sha256(sign.pubKey);
									});
									unCompletedBlock.blockData.AddValidatorRewards(validatorPubKeyHashes);
									unCompletedBlock.blockHeader.Sign(myPrivKey);
									AddBlock(unCompletedBlock, nextBlock);
									var newMessage = {
										header: HEADER,
										blockHeader: nextBlock.blockHeader
									};
									var allNodes = Object.values(nodes);
									allNodes.forEach(node => {
										node.Write(newMessage);
									});
								}
							}
						}
					}
				}
				break;
			}

			case FOLLOW: {
				if (!followers[message.pubKeyHash]) {
					followers[message.pubKeyHash] = [];
				}
				if (followers[message.pubKeyHash].indexOf(this) < 0) {
					followers[message.pubKeyHash].push(this);
				}
				this.followees.push(message.pubKeyHash);
				this.Write(JSON.stringify({
					header: FOLLOW_SUCCESS,
					pubKeyHash: message.pubKeyHash
				}));
				break;
			}

			case ERROR: {
				break;
			}

			default: {
				this.Write({
					header: ERROR,
					error: "Invalid header"
				});
				break;
			}
		}
	}
}

function ConnectDNSServer() {
	http.get("http://" + Const.dnsServer, res => {
		try {
			var rawData = "";
			res.on("data", chunk => {
				rawData += chunk;
			});
			res.on("end", () => {
				var parsedData = JSON.parse(rawData);
				if (parsedData.header == ADDRS) {
					var allNodes = Object.values(nodes);
					var allUrls = allNodes.map(node => {
						return node.url;
					});
					parsedData.urls.forEach(url => {
						if (allUrls.indexOf(url) < 0) {
							Connect(url);
						}
					});
				}
				var client = new WebSocketClient();
				client.on("connect", connection => {
					connection.on("error", err => {
						console.log(err.toString());
					});
					connection.on("close", () => { });
					connection.on("message", message => {
						console.log(message.utf8Data);
					});
					connection.sendUTF(JSON.stringify({
						header: "addr",
						addr: myUrl
					}));
				});
				client.connect("ws://" + Const.dnsServer);
			});
		} catch (err) {
			console.log(err.toString());
		}
	});
}

function ConnectTrustedPeers() {
	var allNodes = Object.values(nodes);
	var allUrls = allNodes.map(node => {
		return node.url;
	});
	Const.trustedPeers.forEach(url => {
		if (allUrls.indexOf(url) < 0 && url != myUrl) {
			Connect(url);
		}
	});
}

function main() {
	myBlockChain.Initiate(() => {
		if (!myBlockChain.IsOnTop(myPubKeyHash) && state == 1) {
			timeout2 = setTimeout(() => {
				CollectNewBlock();
			}, myBlockChain.GetTimeMustWait(myPubKeyHash));
		}
	});
	ConnectDNSServer();
	ConnectTrustedPeers();
	var server = http.createServer((req, res) => {
	});
	server.listen(Const.systemPort, () => {
	});
	var wsServer = new WebSocketServer({ httpServer: server });
	wsServer.on("request", req => {
		var connection = req.accept(null, req.origin);
		new Node(connection);
	});
	process.on("SIGHUP", code => {
		fs.writeFileSync(Const.nextBlockFile, JSON.stringify(nextBlock));
		process.exit();
	});
}
module.exports = main;