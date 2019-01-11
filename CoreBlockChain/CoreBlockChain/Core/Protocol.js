// Module
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
const GET_UNSPENTOUTPUTS = "get_unspentoutputs";
const UNSPENTOUTPUTS = "unspentoutputs";
const TX = "tx";
const NEED_VALIDATING = "need_validating";
const VALIDATE_RESULT = "validate_result";
const FOLLOW = "follow";
const RECENT_TX = "recent_tx";
const ERROR = "error";

// Constant
const trustedPeers = Const.trustedPeers;
const dnsServer = Const.dnsServer;
const peersFile = Const.peersFile;
const nextBlockFile = Const.nextBlockFile;

// State variable
var myPrivKey = fs.readFileSync(Const.privKeyFile);
var myPubKeyHash = Crypto.GetPubKeyHash(myPrivKey);
var myUrl = fs.readFileSync(Const.urlFile).toString();

// Dictionary các node trong hệ thống
var nodes = {};

//// Dictionary các node theo dõi, mỗi giá trị trong dictionaty gồm 1 mảng các node đăng ký
//var followers = {};

// Khởi tạo lại chuỗi blockChain từ CSDL
var myBlockChain = new BlockChain();

//// Khởi tạo lại nextBlock từ file
//var tmpBlocks = [];
//var nextBlock = JSON.parse(fs.readFileSync(nextBlockFile));
//tmpBlocks.push({
//	blockHeader: new BlockHeader(nextBlock.blockHeader),
//	blockData: new BlockData(nextBlock.blockData)
//});
//nextBlock = tmpBlocks[0];

//// Biến trạng thái của chuỗi blockChain
//var state = 1;

//// Mảng tạm các header chưa có data
//var tmpHeaders = [];

//// Mảng chứa các tx chưa được thực hiện
//var txPool = [];

//// Timeout chờ chuyển trạng thái
//var timeout1 = null;

//// Timeout chờ đủ điểm thu thập
//var timeout2 = null;

//// Block tạm, đang thu thập chữ ký
//var unCompletedBlock = null;

//// Đặt timeout để bắt đầu đi thu thập
//if (!myBlockChain.IsOnTop(myPubKeyHash)) {
//	timeout2 = setTimeout(() => {
//		if (txPool.length >= Const.nTx) {
//			CollectNewBlock();
//		}
//	}, myBlockChain.GetTimeMustWait(myPubKeyHash));
//}

/**
 * Tạo socket đến url chỉ định, gửi gói tin VERSION
 * @param {string} url: url muốn kết nối
 */
function Connect(url) {
	var client = new WebSocketClient();

	client.on("connectFailed", err => {
		console.log("Connect Error: " + err);
	});

	client.on("connect", connection => {
		var node = new Node(connection);
		node.Write({
			header: VERSION,
			url: myUrl,
			pubKeyHash: myPubKeyHash,
			wantConnect: true
		});
	});

	client.connect("ws://" + url, "echo-protocol");
}

/**
 * Tạo block mới và tiến hành thu thập
 * */
function CollectNewBlock() {
	// Tạo blockData mới từ các giao dịch trong txPool
	var newBlockData = new BlockData(txPool.slice(0, Const.nTx));
	// Thêm phần thưởng cho node thu thập
	newBlockData.AddCreatorReWard(myPubKeyHash);

	// Tạo blockHeader mới
	var newBlockHeader = new BlockHeader({
		index: nextBlock.blockHeader.index + 1,
		preBlockHash: nextBlock.blockHeader.GetHash(),
		merkleRoot: newBlockData.MerkleRoot(),
		validatorSigns: []
	});

	// Tạo block mới từ blockData và blockHeader
	unCompletedBlock = {
		blockHeader: newBlockHeader,
		blockData: newBlockData
	};

	// Gửi yêu cầu đến các node xác nhận
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

class Node {
	/**
	 * Hàm khởi tạo 1 node từ 1 connection
	 * @param {Connection} connection
	 */
	constructor(connection) {
		this.connection = connection;
		this.followList = []; // Danh sách những ví mà node này muốn theo dõi
		this.connection.on("message", message => {
			console.log(message.utf8Data);
			try {
				this.HandleMessage(JSON.parse(message.utf8Data));
			} catch (err) {
				console.log(err);
			}
		});

		this.connection.on("error", err => {
			console.log("Connection error: " + err);
		});

		this.connection.on("close", (reasonCode, description) => {
			if (nodes[this.pubKeyHash]) {
				delete nodes[this.pubKeyHash];
			}
			this.followList.forEach(followee => {
				followers[followee].splice(followers[followee].indexOf(this), 1);
			});
		});
	}

	/**
	 * Gửi 1 thông điệp đến 1 node
	 * @param {JSON} message: thông điệp cần gửi
	 */
	Write(message) {
		this.connection.sendUTF(JSON.stringify(message));
	}

	/**
	 * Xử lý các thông điệp được gửi đến
	 * @param {JSON} message: thông điệp được gửi đến
	 */
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
					if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
						this.Write({
							header: GET_HEADER,
							index: myBlockChain.GetLength()
						});
					}
				}
				break;
			}

			//case GET_HEADER: {
			//	this.Write({
			//		header: HEADER,
			//		blockHeader: myBlockChain.GetHeader(message.index)
			//	});
			//	break;
			//}

			//case HEADER: {
			//	var blockHeader = message.blockHeader;
			//	if (blockHeader) {
			//		var preBlockHeader = null;

			//		// Tìm preBlockHeader
			//		if (blockHeader.index == myBlockChain.GetLength() + 1) {
			//			var preBlock = tmpBlocks.find(block => {
			//				return block.blockHeader.GetHash() == blockHeader.preBlockHash;
			//			});
			//			if (preBlock) {
			//				preBlockHeader = preBlock.blockHeader;
			//			}
			//		} else if (blockHeader.index == myBlockChain.GetLength()) {
			//			preBlockHeader = myBlockChain.headers[myBlockChain.GetLength() - 1];
			//		}

			//		if (preBlockHeader) {
			//			if (myBlockChain.ValidateBlockHeader(blockHeader, preBlockHeader)) {
			//				tmpHeaders.push(blockHeader);
			//				this.Write({
			//					header: GET_DATA,
			//					blockHeaderHash: blockHeader.GetHash()
			//				});
			//			}
			//		}
			//	}
			//	break;
			//}

			//case GET_DATA: {
			//	// Tìm blockData
			//	var blockData = myBlockChain.GetData(message.blockHeaderHash);
			//	if (!blockData) {
			//		var block = tmpBlocks.find(block => {
			//			return block.blockHeader.GetHash() == message.blockHeaderHash;
			//		});
			//		if (block) {
			//			blockData = block.blockData;
			//		}
			//	}

			//	this.Write({
			//		header: DATA,
			//		blockHeaderHash: message.blockHeaderHash,
			//		blockData: blockData,
			//		signature: Crypto.Sign(myPrivKey, message.blockHeaderHash)
			//	});
			//	break;
			//}

			//case DATA: {
			//	if (message.blockData) {
			//		// Tìm blockHeader tương ứng với blockData
			//		var blockHeader = tmpHeaders.find(blockHeader => {
			//			return blockHeader.GetHash() == message.blockHeaderHash;
			//		});
			//		if (blockHeader) {
			//			var blockData = new BlockData(message.blockData);
			//			if (myBlockChain.ValidateBlockData(blockData, blockHeader)) {
			//				// Xóa blockHeader trong mảng tmpHeaders
			//				tmpHeaders.splice(tmpHeaders.indexOf(blockHeader), 1);

			//				// Tạo block mới và thêm vào mảng tmpBlocks
			//				var newBlock = {
			//					blockHeader: blockHeader,
			//					blockData: blockData
			//				};
			//				tmpBlocks.push(newBlock);

			//				// Nếu node gửi là node tin tưởng thì gửi yêu cầu lấy block tiếp theo
			//				if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
			//					this.Write({
			//						header: GET_HEADER,
			//						index: blockHeader.index + 1
			//					});
			//				}

			//				// Nếu block mới cách 2 block so với block cuối cùng trong chuỗi blockChain
			//				if (blockHeader.index == myBlockChain.GetLength() + 1) {
			//					// Thêm block liền trước vào chuỗi blockChain
			//					var preBlock = tmpBlocks.find(block => {
			//						return block.blockHeader.GetHash() == blockHeader.preBlockHash;
			//					});
			//					myBlockChain.AddBlock(preBlock.blockHeader, preBlock.blockData);

			//					// Xóa các block có cùng index với block mới thêm khỏi mảng tmpBlocks
			//					tmpBlocks = tmpBlocks.filter(block => {
			//						return block.blockHeader.index > preBlock.blockHeader.index;
			//					});

			//					// Xóa các tx đã thực hiện trong txPool
			//					txPool = txPool.filter(tx1 => {
			//						return blockData.txs.find(tx2 => {
			//							JSON.stringify(tx2) == JSON.stringify(tx1);
			//						}) == null;
			//					});

			//					// Thông báo kết quả cho các node theo dõi
			//					blockData.txs.forEach(tx => {
			//						var concerners = [];
			//						if (tx.senderSign) {
			//							concerners.push(Crypto.Sha256(tx.senderSign.pubKey));
			//						}
			//						for (var i = 0; i < tx.txOuts.length; i++) {
			//							var receiver = tx.txOuts[i].pubKeyHash;
			//							if (concerners.indexOf(receiver) < 0) {
			//								concerners.push(receiver);
			//							}
			//						}
			//						concerners.forEach(pubKeyHash => {
			//							if (followers[pubKeyHash]) {
			//								followers[pubKeyHash].forEach(node => {
			//									node.Write({
			//										header: RECENT_TX,
			//										pubKeyHash: pubKeyHash,
			//										tx: tx
			//									});
			//								});
			//							}
			//						});
			//					});

			//					// Cập nhật block dự định chọn
			//					nextBlock = newBlock;

			//					// Chuyển trạng thái sang 2
			//					state = 2;

			//					// Đặt timeout để chờ các node thông báo block mới cho nhau
			//					try {
			//						clearTimeout(timeout1);
			//					} catch (err) {
			//						console.log(err);
			//					}
			//					timeout1 = setTimeout(() => {
			//						// Chuyển trạng thái sang 3
			//						state = 3;

			//						// Nếu node đang chạy nằm trong top hệ thống thì trao đổi block mới với các node xác nhận khác
			//						if (myBlockChain.IsOnTop(myPubKeyHash)) {
			//							var newMessage = {
			//								header: HEADER,
			//								blockHeader: nextBlock.blockHeader
			//							};
			//							myBlockChain.GetTopWallets().forEach(pubKeyHash => {
			//								var node = nodes[pubKeyHash];
			//								if (node) {
			//									node.Write(newMessage);
			//								}
			//							});
			//						}

			//						// Đặt timeout mới
			//						timeout1 = setTimeout(() => {
			//							// Chuyển trạng thái sang 1
			//							state = 1;

			//							// Đặt timeout để chờ đủ điểm
			//							try {
			//								clearTimeout(timeout2);
			//							} catch (err) {
			//								console.log();
			//							}
			//							if (!myBlockChain.IsOnTop(myPubKeyHash)) {
			//								timeout2 = setTimeout(() => {
			//									if (txPool.length >= Const.nTx) {
			//										CollectNewBlock();
			//									}
			//								}, myBlockChain.GetTimeMustWait(myPubKeyHash));
			//							}
			//						}, Const.consensusDuration);
			//					}, Const.blockDuration - Const.consensusDuration);
			//				} else if (state == 2) {
			//					if (blockHeader.GetTimeStamp() < nextBlock.blockHeader.GetTimeStamp()) {
			//						nextBlock = newBlock;
			//					}
			//				} else if (state == 3) {
			//					if (Crypto.Verify(message.signature)
			//						&& message.signature.message == blockHeader.GetHash()
			//						&& myBlockChain.IsOnTop(Crypto.Sha256(message.signature.pubKey))
			//						&& blockHeader.GetTimeStamp() < nextBlock.GetTimeStamp()) {
			//						nextBlock = newBlock;
			//					}
			//				}
			//			}
			//		}
			//	}
			//	break;
			//}

			//case GET_UNSPENTOUTPUTS: {
			//	this.Write({
			//		header: UNSPENTOUTPUTS,
			//		pubKeyHash: message.pubKeyHash,
			//		unSpentOutputs: myBlockChain.GetUnSpentOutputs(message.pubKeyHash)
			//	})
			//	break;
			//}

			//case TX: {
			//	var tx = new Tx(message.tx);
			//	if (myBlockChain.ValidateTx(tx)) {
			//		txPool.push(tx);
			//		if (state == 1 && myBlockChain.GetTimeMustWait(myPubKeyHash) == 0 && txPool.length == Const.nTx) {
			//			CollectNewBlock();
			//		}
			//	}
			//	break;
			//}

			//case NEED_VALIDATING: {
			//	// Nếu trạng thái hiện tại là 1 thì kiểm tra
			//	if (state == 1) {
			//		var isAgreed = false;
			//		if (message.preBlockHash == nextBlock.blockHeader.GetHash()
			//			&& message.index == nextBlock.blockHeader.index + 1) {
			//			isAgreed = true;
			//		}
			//		var signature = Crypto.Sign(myPrivKey, JSON.stringify({
			//			preBlockHash: nextBlock.blockHeader.GetHash(),
			//			index: nextBlock.blockHeader.index + 1,
			//			merkleRoot: message.merkleRoot,
			//			timeStamp: (new Date()).getTime(),
			//			isAgreed: isAgreed
			//		}));
			//		this.Write({
			//			header: VALIDATE_RESULT,
			//			signature: signature
			//		});
			//	}
			//	break;
			//}

			//case VALIDATE_RESULT: {
			//	// Nếu trạng thái hiện tại là 1 thì kiểm tra chữ ký
			//	if (state == 1) {
			//		// Nếu chữ ký hợp lệ
			//		if (Crypto.Verify(message.signature)) {
			//			// Nếu các thông tin đúng
			//			var validateMessage = JSON.parse(message.signature.message);
			//			if (validateMessage.preBlockHash == unCompletedBlock.blockHeader.preBlockHash
			//				&& validateMessage.index == unCompletedBlock.blockHeader.index
			//				&& validateMessage.merkleRoot == unCompletedBlock.blockHeader.merkleRoot
			//				&& validateMessage.isAgreed) {
			//				// Nếu node ký tên là node xác nhận
			//				if (myBlockChain.GetTopWallets().indexOf(Crypto.Sha256(message.signature.pubKey)) >= 0) {
			//					// Nếu node ký tên chưa ký
			//					if (!nextBlock.blockHeader.validatorSigns.find(signature => {
			//						return signature.pubKey == message.signature.pubKey
			//					})) {
			//						// Nếu node ký tên không ký 2 block liên tiếp
			//						if (!unCompletedBlock.blockHeader.validatorSigns.find(signature => {
			//							return signature.pubKey == message.signature.pubKey;
			//						})) {
			//							// Thêm chữ ký vào blockHeader
			//							unCompletedBlock.blockHeader.AddSignature(message.signature);

			//							// Nếu đủ số lượng chữ ký yêu cầu
			//							if (unCompletedBlock.blockHeader.validatorSigns.length == Const.n) {
			//								// Lấy danh sách các node đã ký tên
			//								var validatorPubKeyHashes = unCompletedBlock.blockHeader.validatorSigns.map(signature => {
			//									return Crypto.Sha256(signature.pubKey);
			//								});

			//								// Thêm phần thưởng cho các node xác nhận
			//								unCompletedBlock.blockData.AddValidatorRewards(validatorPubKeyHashes);

			//								// Node thu thập ký tên xác nhận
			//								unCompletedBlock.blockHeader.Sign(myPrivKey);

			//								// Broadcast block mới tạo
			//								var newMessage = {
			//									header: HEADER,
			//									blockHeader: unCompletedBlock.blockHeader
			//								};
			//								var allNodes = Object.values(nodes);
			//								allNodes.forEach(node => {
			//									node.Write(newMessage);
			//								});
			//							}
			//						}
			//					}
			//				}
			//			}
			//		}
			//	}
			//	break;
			//}

			//case FOLLOW: {
			//	if (!followers[message.pubKeyHash]) {
			//		followers[message.pubKeyHash] = [];
			//	}
			//	if (followers[message.pubKeyHash].indexOf(this) < 0) {
			//		followers[message.pubKeyHash].push(this);
			//	}
			//	this.followList.push(message.pubKeyHash);
			//	break;
			//}

			case ERROR: {
				break;
			}

			default: {
				this.Write({
					header: ERROR
				});
				break;
			}
		}
	}
}

/**
 * Kết nối đến dnsServer, lấy địa chỉ các node khác và kết nối
 * */
function ConnectDNSServer() {
	http.get("http://" + dnsServer, res => {
		try {
			var rawData = "";
			res.on("data", chunk => {
				rawData += chunk;
			});
			res.on("end", () => {
				var parsedData = JSON.parse(rawData);
				if (parsedData.header == ADDRS) {
					parsedData.urls.forEach(url => {
						Connect(url);
					});
				}

				// Đăng ký thông tin với dnsServer
				var client = new WebSocketClient();

				client.on("connectFailed", err => {
					console.log("Connect Error: " + err);
				});

				client.on("connect", connection => {
					connection.sendUTF(JSON.stringify({
						header: "addr",
						addr: myUrl
					}));
				});

				client.connect("ws://" + dnsServer, "echo-protocol");
			});
		} catch (err) {
			console.log(err);
		}
	});
}

/**
 * Đọc danh sách các node tin tưởng từ file và kết nối đến
 * */
function ConnectTrustedPeers() {
	trustedPeers.forEach(url => {
		Connect(url);
	});
}

/**
 * Đọc danh sách các node đã kết nối lần trước và kết nối lại
 * */
function ReadPeersFile() {
	fs.readFile(peersFile, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			try {
				var urls = JSON.parse(data);
				urls.forEach(url => {
					Connect(url);
				});
			} catch (err) {
				console.log(err);
			}
		}
	});
}

function main() {
	// Kết nối dnsServer, lấy danh sách các node khác trong hệ thống và kết nối
	ConnectDNSServer();

	////// Đọc file, lấy danh sách các node đã kết nối lần trước và kết nối lại
	////ReadPeersFile();

	////// Đọc file, lấy danh sách các node tin tưởng và kết nối
	////ConnectTrustedPeers();

	// Tạo socket để lắng nghe kết nối
	var server = http.createServer((req, res) => {
	});
	server.listen(Const.systemPort, () => {
		console.log("Socket is running on port " + Const.systemPort);
	});

	var wsServer = new WebSocketServer({
		httpServer: server,
		autoAcceptConnections: false
	});
	wsServer.on("request", req => {
		new Node(req.accept("echo-protocol", req.origin));
	});

	process.on("SIGINT", code => {
		fs.writeFileSync(Const.nextBlockFile, JSON.stringify(nextBlock));
		process.exit();
	});
}

module.exports = main;