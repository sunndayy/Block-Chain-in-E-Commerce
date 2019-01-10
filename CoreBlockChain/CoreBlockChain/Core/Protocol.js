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
const VALIDATION_RESULT = "validate_result";
const FOLLOW = "follow";
const RECENT_TX = "recent_tx";
const ERROR = "error";
// Module
const Crypto = require("./Crypto");
const Const = require("./Const");
const Transaction = require("./Core").Transaction;
const BlockHeader = require("./Core").BlockHeader;
const BlockData = require("./Core").BlockData;
const BlockChain = require("./Core").BlockChain;
// My info
var myPrivKey = null;
var myPubKeyHash = null;
var myUrl = null;
// State variable
const trustedPeers = [];
var nodes = {};
var myBlockChain = new BlockChain();
var tmpBlocks = []; // Đọc từ file json lên
var nextBlock = tmpBlocks[0];
var state = 1;
var tmpHeaders = [];
var txPool = [];
var timeout1 = null;
var timeout2 = null;
var unCompletedBlock = null;

function Connect(url) {
	// Gui goi tin version
}

function CollectNewBlock() {
	var nextBlockData = new BlockData(txPool.slice(0, Const.nTx));
	nextBlockData.AddCreatorReWard(myPubKeyHash);
	var nextBlockHeader = new BlockHeader({
		index: nextBlock.blockHeader.index + 1,
		preBlockHash: Crypto.Sha256(JSON.stringify(nextBlock.blockHeader)),
		merkleRoot: nextBlockData.MerkleRoot(),
		validatorSigns: []
	});
	unCompletedBlock = {
		blockHeader: nextBlockHeader,
		blockData: nextBlockData
	};
	myBlockChain.GetTopWallets().forEach(pubKeyHash => {
		var node = nodes[pubKeyHash];
		if (node) {
			node.Write({
				header: NEED_VALIDATING,
				index: nextBlockHeader.index,
				preBlockHash: nextBlockHeader.preBlockHash,
				merkleRoot: nextBlockHeader.merkleRoot
			});
		}
	});
}

class Node {
	constructor(connection) {
		this.connection = connection;
	}
	Write(message) {

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
					if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
						this.Write({
							header: GET_HEADER,
							index: myBlockChain.GetLength()
						});
					}
				}
				break;
			}
			case GET_HEADER: {
				this.Write({
					header: HEADER,
					blockHeader: myBlockChain.GetHeader(message.index)
				});
				break;
			}
			case HEADER: {
				var preBlockHeader = null;
				var blockHeader = message.blockHeader;
				if (blockHeader.index == myBlockChain.GetLength() + 1) {
					preBlockHeader = tmpBlocks.find(block => {
						return Crypto.Sha256(JSON.stringify(block.blockHeader)) == blockHeader.preBlockHash;
					});
				} else if (blockHeader.index == myBlockChain.GetLength()) {
					preBlockHeader = myBlockChain.headers[myBlockChain.GetLength() - 1];
				}
				if (preBlockHeader) {
					if (myBlockChain.ValidateBlockHeader(blockHeader, preBlockHeader)) {
						tmpHeaders.push(blockHeader);
						this.Write({
							header: GET_DATA,
							blockHeaderHash: Crypto.Sha256(JSON.stringify(blockHeader))
						});
					}
				}
				break;
			}
			case GET_DATA: {
				var blockData = myBlockChain.GetData(message.blockHeaderHash);
				if (!blockData) {
					var block = tmpBlocks.find(block => {
						return Crypto.Sha256(JSON.stringify(block.blockHeader)) == message.blockHeaderHash;
					});
					if (block) {
						blockData = block.blockData;
					}
				}
				this.Write({
					header: DATA,
					blockHeaderHash: message.blockHeaderHash,
					blockData: blockData,
					signature: Crypto.Sign(myPrivKey, message.blockHeaderHash)
				});
				break;
			}
			case DATA: {
				var blockHeader = tmpHeaders.find(blockHeader => {
					return Crypto.Sha256(JSON.stringify(blockHeader)) == message.blockHeaderHash;
				});
				var blockData = new BlockData(message.blockData);
				if (blockHeader) {
					if (myBlockChain.ValidateBlockData(blockData, blockHeader)) {
						tmpHeaders.splice(tmpHeaders.indexOf(blockHeader), 1);
						var newBlock = {
							blockHeader: blockHeader,
							blockData: blockData
						};
						tmpBlocks.push(newBlock);
						if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
							this.Write({
								header: GET_HEADER,
								index: blockHeader.index + 1
							});
						}
						if (blockHeader.index == myBlockChain.GetLength() + 1) {
							var preBlock = tmpBlocks.find(block => {
								return Crypto.Sha256(JSON.stringify(block.blockHeader)) == blockHeader.preBlockHash;
							});
							myBlockChain.AddBlock(preBlock.blockHeader, preBlock.blockData);
							tmpBlocks = tmpBlocks.filter(block => {
								return block.blockHeader.index > preBlock.blockHeader.index;
							});
							txPool = txPool.filter(tx1 => {
								return blockData.transactions.find(tx2 => {
									JSON.stringify(tx2) == JSON.stringify(tx1);
								}) == null;
							});
							// Thong bao cho cac node follow
							nextBlock = newBlock;
							state = 2;
							try {
								clearTimeout(timeout1);
							} catch (err) {
								console.log(err);
							}
							timeout1 = setTimeout(() => {
								state = 3;
								if (myBlockChain.IsOnTop(myPubKeyHash)) {
									var newMessage = {
										header: HEADER,
										blockHeader: nextBlock.blockHeader
									};
									myBlockChain.GetTopWallets().forEach(pubKeyHash => {
										var node = nodes[pubKeyHash];
										if (node) {
											node.Write(newMessage);
										}
									});
								}
								timeout1 = setTimeout(() => {
									state = 1;
									try {
										clearTimeout(timeout2);
									} catch (err) {
										console.log();
									}
									if (!myBlockChain.IsOnTop(myPubKeyHash)) {
										timeout2 = setTimeout(() => {
											if (txPool.length >= Const.nTx) {
												CollectNewBlock();
											}
										}, myBlockChain.GetTimeMustWait(myPubKeyHash));
									}
								}, Const.consensusDuration);
							}, Const.blockDuration - Const.consensusDuration);
						} else if (state == 2) {
							if (blockHeader.GetTimeStamp() < nextBlock.blockHeader.GetTimeStamp()) {
								nextBlock = newBlock;
							}
						} else if (state == 3) {
							if (Crypto.Verify(message.signature)
								&& message.signature.message == Crypto.Sha256(JSON.stringify(blockHeader))
								&& myBlockChain.IsOnTop(Crypto.Sha256(message.signature.pubKey))
								&& blockHeader.GetTimeStamp() < nextBlock.GetTimeStamp()) {
								nextBlock = newBlock;
							}
						}
					}
				}
				break;
			}
			case GET_UNSPENTOUTPUTS: {
				this.Write({
					header: UNSPENTOUTPUTS,
					pubKeyHash: message.pubKeyHash,
					unSpentOutputs: myBlockChain.GetUnSpentOutputs(message.pubKeyHash)
				})
				break;
			}
			case TX: {
				var transaction = new Transaction(message.transaction);
				if (myBlockChain.ValidateTransaction(transaction)) {
					txPool.push(transaction);
					if (state == 1 && myBlockChain.GetTimeMustWait(myPubKeyHash) == 0 && txPool.length == Const.nTx) {
						CollectNewBlock();
					}
				}
				break;
			}
			case NEED_VALIDATING: {
				if (state == 1) {
					var isAgreed = false;
					if (message.preBlockHash == Crypto.Sha256(JSON.stringify(nextBlock.blockHeader))
						&& message.index == nextBlock.blockHeader.index + 1) {
						isAgreed = true;
					}
					var signature = Crypto.Sign(myPrivKey, JSON.stringify({
						preBlockHash: Crypto.Sha256(JSON.stringify(nextBlock.blockHeader)),
						index: nextBlock.blockHeader.index + 1,
						merkleRoot: message.merkleRoot,
						timeStamp: (new Date()).getTime(),
						isAgreed: isAgreed
					}));
					this.Write({
						header: VALIDATION_RESULT,
						signature: signature
					});
				}
				break;
			}
			case VALIDATION_RESULT: {
				if (state == 1) {
					if (Crypto.Verify(message.signature)) {
						var validateMessage = JSON.parse(message.signature.message);
						if (validateMessage.preBlockHash == unCompletedBlock.blockHeader.preBlockHash
							&& validateMessage.index == unCompletedBlock.blockHeader.index
							&& validateMessage.merkleRoot == unCompletedBlock.blockHeader.merkleRoot
							&& validateMessage.isAgreed) {
							if (myBlockChain.GetTopWallets().indexOf(Crypto.Sha256(message.signature.pubKey))) {
								if (!nextBlock.blockHeader.validatorSigns.find(signature => {
									return signature.pubKey == message.signature.pubKey
								})) {
									if (!unCompletedBlock.blockHeader.validatorSigns.find(signature => {
										return signature.pubKey == message.signature.pubKey;
									})) {
										unCompletedBlock.blockHeader.AddSignature(message.signature);
										if (unCompletedBlock.blockHeader.validatorSigns.length == Const.n) {
											var validatorPubKeyHashes = unCompletedBlock.blockHeader.validatorSigns.map(signature => {
												return Crypto.Sha256(signature.pubKey);
											});
											unCompletedBlock.blockData.AddValidatorRewards(validatorPubKeyHashes);
											unCompletedBlock.blockHeader.Sign(myPrivKey);
											var newMessage = {
												header: HEADER,
												blockHeader: unCompletedBlock.blockHeader
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
					}
				}
				break;
			}
			case FOLLOW: {
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
