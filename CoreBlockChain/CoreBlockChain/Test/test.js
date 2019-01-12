//const GET_ADDRS = "get_addrs";
//const ADDRS = "addrs";
//const VERSION = "version";
//const VERACK = "verack";
//const GET_HEADER = "get_header";
//const HEADER = "header";
//const GET_DATA = "get_data";
//const DATA = "data";
//const GET_UNSPENTOUTPUTS = "get_unspentoutputs";
//const UNSPENTOUTPUTS = "unspentoutputs";
//const TX = "tx";
//const NEED_VALIDATING = "need_validating";
//const VALIDATION_RESULT = "validate_result";
//const FOLLOW = "follow";
//const RECENT_TX = "recent_tx";
//const Const = require("./Const");
//const Crypto = require("./Crypto");
//const BlockChain = require("./Core");
//const trustedPeers = [];
//var myUrl, myPrivKey, myPubKeyHash;
//var myBlockChain = new BlockChain();
//var nodes = {}; // dictionary có key là pubKeyHash, value là node
//var tmpHeaders = [];
//var tmpBlocks = [];
//var state = 1;
//var txPool = [];
//var nextBlock = null;
//var newBlock = null;
//function Connect(url) {

//}
//class Node {
//	constructor(connection) {
//		this.connection = connection;
//	}
//	Write(message) {

//	}
//	HandleMessage(message) {
//		switch (message.header) {
//			case GET_ADDRS: {
//				// Trả về url của các node đang kết nối từ nodes dictionary
//				var allNodes = Object.values(nodes);
//				var allUrls = allNodes.map((node) => {
//					return node.url;
//				});
//				this.Write({
//					header: ADDRS,
//					urls: allUrls
//				});
//				break;
//			}
//			case ADDRS: {
//				// Gửi gói tin VERSION đến các url
//				var allNodes = Object.values(nodes);
//				var allUrls = allNodes.map((node) => {
//					return node.url;
//				});
//				message.urls.forEach(url => {
//					if (allUrls.indexOf(url) < 0) {
//						Connect(url);
//					}
//				});
//				break;
//			}
//			case VERSION: {
//				// Cập nhật url, pubKeyHash cho các node
//				this.url = message.url;
//				this.pubKeyHash = message.pubKeyHash;
//				// Nếu node kia muốn kết nối thì gửi lại gói VERSION, ngược lại gửi gói VERACK để xác nhận
//				if (message.wantConnect) {
//					this.Write({
//						header: VERSION,
//						url: myUrl,
//						pubKeyHash: myPubKeyHash
//					});
//				} else {
//					this.Write({
//						header: VERACK,
//						wantConnect: true
//					});
//				}
//				break;
//			}
//			case VERACK: {
//				// Thêm node này vào dictionary (nếu chưa có)
//				if (!nodes[this.pubKeyHash]) {
//					nodes[this.pubKeyHash] = this;
//				}
//				// Nếu node kia muốn kết nối thì gửi lại gói VERACK
//				if (message.wantConnect) {
//					this.Write({
//						header: VERACK
//					});
//				} else {
//					// Ngược lại, nếu node kia là node tin cậy thì gửi yêu cầu lấy blockHeader tiếp theo trong chuỗi blockChain
//					if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
//						this.Write({
//							header: GET_HEADER,
//							index: myBlockChain.GetLength()
//						});
//					}
//				}
//				break;
//			}
//			case GET_HEADER: {
//				// Trả về header theo index được yêu cầu
//				this.Write({
//					header: HEADER,
//					blockHeader: myBlockChain.GetHeader(message.index);
//				});
//				break;
//			}
//			case HEADER: {
//				// Kiểm tra header có hợp lệ không
//				var preBlockHeader = null;
//				if (message.blockHeader.index == myBlockChain.GetLength() + 1) {
//					// Kiểm tra trong mảng tạm
//					preBlockHeader = tmpBlocks.find(block => {
//						return Crypto.Sha256(JSON.stringify(block.blockHeader)) == message.blockHeader.preBlockHash;
//					});
//				} else if (message.blockHeader.index == myBlockChain.GetLength()) {
//					// Kiểm tra trong chuỗi blockchain
//					preBlockHeader = myBlockChain.headers[myBlockChain.GetLength() - 1];
//				}
//				if (preBlockHeader) {
//					if (myBlockChain.ValidateBlockHeader(message.blockHeader, preBlockHeader)) {
//						// Thêm header vào mảng tmpHeaders
//						tmpHeaders.push(message.blockHeader);
//						// Yêu cầu lấy data
//						this.Write({
//							header: GET_DATA,
//							blockHeaderHash: Crypto.Sha256(JSON.stringify(message.blockHeader))
//						});
//					}
//				}
//				break;
//			}
//			case GET_DATA: {
//				// Trả về data theo blockHash, data được yêu cầu có thể nằm trong blockChain hoặc tmpBlocks
//				var blockData = myBlockChain.GetData(message.blockHeaderHash);
//				if (!blockData) {
//					var block = tmpBlocks.find(block => {
//						return Crypto.Sha256(JSON.stringify(block.blockHeader)) == message.blockHeaderHash;
//					});
//					if (block) {
//						blockData = block.blockData;
//					}
//				}
//				this.Write({
//					header: DATA,
//					blockHeaderHash: message.blockHeaderHash,
//					blockData: blockData,
//					signature: Crypto.Sign(myPrivKey, message.blockHeaderHash)
//				});
//				break;
//			}
//			case DATA: {
//				// Tìm blockHeader cần gắn vào
//				var blockHeader = tmpHeaders.find(blockHeader => {
//					return Crypto.Sha256(JSON.stringify(blockHeader)) == message.blockHeaderHash;
//				});
//				if (blockHeader) {
//					// Kiểm tra data và header trong mảng tmpHeaders có hợp lệ không
//					if (myBlockChain.ValidateBlockData(message.blockData, blockHeader)) {
//						// Xóa header trong mảng tmpHeaders
//						tmpHeaders.splice(tmpHeaders.indexOf(blockHeader), 1);
//						// Tạo block mới và thêm vào mảng tmpBlocks
//						var newBlock = {
//							blockHeader: blockHeader,
//							blockData: blockData
//						};
//						tmpBlocks.push(newBlock);
//						// Nếu node gửi là node tin cậy
//						if (trustedPeers.indexOf(this.pubKeyHash) >= 0) {
//							// Yêu cầu lấy blockHeader liền sau
//							this.Write({
//								header: GET_HEADER,
//								index: blockHeader.index + 1
//							});
//						}
//						// Nếu block mới tạo cách 2 block so với block cuối cùng trong blockchain
//						if (blockHeader.index == myBlockChain.GetLength() + 1) {
//							// Thêm block liền trước vào blockchain
//							var preBlock = tmpBlocks.find(block => {
//								return Crypto.Sha256(JSON.stringify(block.blockHeader)) == blockHeader.preBlockHash;
//							});
//							myBlockChain.AddBlock(preBlock.blockHeader, preBlock.blockData);
//							// Xóa các block có cùng index với block vừa ghi trong mảng tmpBlocks
//							tmpBlocks = tmpBlocks.filter(block => {
//								return block.blockHeader.index > preBlock.blockHeader.index;
//							});
//							// Xóa các transaction đã được thực hiện trong mảng txPool

//							// Thông báo cho các node follow

//							// Cập nhật block dự định chọn
//							nextBlock = tmpBlocks[0];
//							// Chuyển qua trạng thái 2
//							state = 2;
//							// Nếu node đang chạy là node xác nhận
//							if (myBlockChain.IsOnTop(myPubKeyHash)) {
//								// setTimeOut, hết timeout, chuyển qua trạng thái 3, đồng thuận giữa các node xác nhận
//								setTimeout(() => {
//									if (state == 2) {
//										state = 3;
//										var message = {
//											header: HEADER,
//											blockHeader: nextBlock.blockHeader
//										};
//										myBlockChain.GetTopWallets().forEach(pubKeyHash => {
//											var node = nodes[pubKeyHash];
//											if (node) {
//												node.Write(message);
//											}
//										});
//										setTimeout(() => {
//											if (state == 3) {
//												state = 1;
//											}
//										}, Const.consensusDuration);
//									}
//								}, Const.blockDuration - Const.consensusDuration);
//							} else {
//								// setTimeOut, hết timeout, chuyển qua trạng thái 1
//								setTimeout(() => {
//									if (state == 2) {
//										state = 1;
//										// Đặt timeout cho việc chờ đủ điểm
//										setTimeout(() => {
//											if (state == 1 && myBlockChain.GetTimeMustWait(myPubKeyHash) == 0 && !myBlockChain.IsOnTop(myPubKeyHash)) {
//												if (txPool.length >= Const.nTx) {
//													// Tạo blockHeader và blockData mới
//													// Sau đó gửi đi ký tên
//												}
//											}
//										}, myBlockChain.GetTimeMustWait(myPubKeyHash));
//									}
//								}, Const.blockDuration);
//							}
//						} else {
//							// Nếu state là 2 và block mới có thời gian thu thập so với nextBlock
//							if (state == 2 && blockHeader.GetTimeStamp() < nextBlock.blockHeader.GetTimeStamp()) {
//								// Chọn block mới tạo làm nextBlock
//								nextBlock = newBlock;
//							}
//							// Nếu state là 3
//							else if (state == 3) {
//								// Kiểm tra chữ ký trong gói tin, nếu người ký tên là node xác nhận và block mới có thời gian thu thập nhanh hơn nextBlock
//								if (Crypto.Verify(message.signature) && myBlockChain.IsOnTop(Crypto.Sha256(message.signature.pubKey)) && blockHeader.GetTimeStamp() < nextBlock.GetTimeStamp()) {
//									nextBlock = newBlock;
//								}
//							}
//						}
//					}
//				}
//				break;
//			}


//			case GET_UNSPENTOUTPUTS: {
//				// Trả về unSpentOutputs của wallet được yêu cầu
//				this.Write({
//					header: UNSPENTOUTPUTS,
//					unSpentOutputs: myBlockChain.GetUnSpentOutputs(message.pubKeyHash)
//				});
//				break;
//			}
//			case UNSPENTOUTPUTS: {
//				// Cài đặt phía client
//				break;
//			}
//			case TX: {
//				// Kiểm tra transaction có hợp lệ không
//				if (myBlockChain.ValidateTransaction(message.transaction)) {
//					// Thêm transaction vào mảng txPool
//					txPool.push(message.transaction);
//					// Nếu trạng thái hiện tại là 1 và đủ điểm tích lũy thì tạo block mới và gửi đi ký tên và node đang chạy là node thu thập
//					if (state == 1 && myBlockChain.GetTimeMustWait(myPubKeyHash) == 0 && txPool.length == Const.nTx) {
//						// Tạo blockHeader và blockData mới
//						// Sau đó gửi đi ký tên
//						// Node đang chạy là node thu thập

//					}
//				}
//				break;
//			}
//			case NEED_VALIDATING: {
//				// Nếu trạng thái hiện tại là 1 thì kiểm tra và ký tên xác nhận
//				if (state == 1) {
//					var signature = null;
//					if (message.preBlockHash == Crypto.Sha256(JSON.stringify(nextBlock.blockHeader))) {
//						signature = Crypto.Sign(myPrivKey, JSON.stringify({
//							preBlockHash: message.preBlockHash,
//							merkleRoot: message.merkleRoot,
//							timeStamp: (new Date()).getTime(),
//							isAgreed: true
//						}));
//					} else {
//						signature = Crypto.Sign(myPrivKey, JSON.stringify({
//							preBlockHash: Crypto.Sha256(JSON.stringify(nextBlock.blockHeader)),
//							merkleRoot: message.merkleRoot,
//							timeStamp: (new Date()).getTime(),
//							isAgreed: false
//						}));
//					}
//					this.Write({
//						header: VALIDATE_RESULT,
//						signature: signature
//					});
//				}
//				break;
//			}
//			case VALIDATE_RESULT: {
//				// Kiểm tra trạng thái hiện tại có phải là 1 không
//				if (state == 1) {
//					// Kiểm tra chữ ký có đúng và đồng ý ko
//					if (Crypto.Verify(message.signature)) {
//						var validateMessage = JSON.parse(message.signature).message;
//						if (validateMessage.preBlockHash == newBlock.blockHeader.preBlockHash &&
//							validateMessage.merkleRoot == newBlock.blockHeader.merkleRoot &&
//							validateMessage.isAgreed) {
//							// Kiểm tra người ký tên có nằm trong top 100 không
//							if (myBlockChain.GetTopWallets().indexOf(Crypto.Sha256(message.signature.pubKey))) {
//								// Kiểm tra người ký tên có ký 2 lần không
//								if (!nextBlock.blockHeader.validatorSigns.find(signature => {
//									return signature.pubKey == message.signature.pubKey;
//								})) {
//									// Thêm chữ ký vào blockHeader của block tiếp theo thứ tự tăng dần
//									var flag = false;
//									for (var i = 0; i < newBlock.blockHeader.validatorSigns.length; i++) {
//										var preTimeStamp = JSON.parse(newBlock.blockHeader.validatorSigns[i]).message.timeStamp;
//										if (preTimeStamp > validateMessage.timeStamp) {






//											flag = true;
//											break;
//										}
//									}
//									if (!flag) {
//										newBlock.blockHeader.validatorSigns.push(message.signature);
//									}
//									if (newBlock.blockHeader.validatorSigns.length == Const.n) {
//										// Nếu đủ số lượng chữ ký thì ký xác nhận thưởng cho các node ký tên và broadcast






//									}
//								}
//							}

//						}
//					}
//				}
//				break;
//			}
//			case FOLLOW: {
//				// Thêm node này vào danh sách các node theo dõi các giao dịch liên quan pubKeyHash
//				break;
//			}
//			case RECENT_TX: {
//				// Cài đặt bên ứng dụng cửa hàng
//				break;
//			}
//			default: {
//				// Gửi về thông báo lỗi
//				break;
//			}
//		}
//	}
//}

///*
// * 0. Dựng server để xử lý các yêu cầu
// * 1. Kết nối đến dnsserver, lấy danh sách các node khác, gửi yêu cầu kết nối. Cập nhật lại dnsserver
// * 2. Đọc file lastPeers, lấy danh sách đã kết nối lần trước, yêu cầu node đó gửi lại danh sách các peer khác, sau đó kết nối đến lastPeer và các peer khác
// * 3. Kết nối đến các trustedPeers, yêu cầu node đó gửi lại danh sách các peer khác, sau đó kết nối đến trustedPeer và các peer khác
// * 4. Đóng kết nối, ghi các nodes xuống file lastPeers
// */


// var Core = require('../Core/Core.js');
// var Crypto = require('../Core/Crypto.js');
// const level = require('level');
// var BlockHeaderDB = level('../Data/BlockHeaderDB', { valueEncoding: 'json' });
// var BlockDataDB = level('../Data/BlockDataDB', { valueEncoding: 'json' });
// var WalletDB = level('../Data/WalletDB', { valueEncoding: 'json' });


// var txOut1 = {
//    pubKeyHash: 'e39bf5e92e5a35a62cf72f64bc12fab226e6eca8daa58747fa0af3ee0773d455',
//    money: 5000,
//    isLocked: false
// }

// var txOut2 = {
//    pubKeyHash: '781407c9eccbb2ffb51de7e8421696b998bbe14c0414bfbb8c590d791d62d0c0',
//    money: 5000,
//    isLocked: false
// }

// var tx = {
//    txIns: [],
//    txOuts: [txOut1, txOut2]
// }

// var genesisHeader = {
//    index: 0,
//    preBlockHash: '',
//    merkleRoot: '',
//    validatorSigns: [],
//    creatorSigns: []
// };

// var genesisData = {
//    transactions: [tx]
// }

// BlockHeaderDB.put(genesisHeader.index, genesisHeader);
// BlockDataDB.put(Crypto.Sha256(genesisHeader.index + genesisHeader.preBlockHash + genesisHeader.merkleRoot), genesisData);

// var BobPri = '7b98d8cfd3b458dd30520ada1b1ffb7bb8314f8eeb395905d62beb42f6911a99'
// var AlicePri = '27f7d394f58de4ef0bc189506f94d58ed3d656a86824207d63e63785a498ac1e'

// var BobPub = '04dc3ecf42b0fb67c5f7d571848e9013be8d4fee8f5c8c67c60bb55c8afbd2d6afe892b10179e074175f988db2bcb9e6eeb1b6fd7fc1535ec1b91ac5ef24b1438f'
// var AlicePub = '042fcdd4286ce5b5d66e6aab39ad7ae130e78242e2377f151586a9f1e70caaa3a7b1a277c8178a88f4ae048737cc8fb12d6ca444e8cfadceaa652e1990226b0414'

// console.log(Crypto.Sha256(BobPub));
// console.log(Crypto.Sha256(AlicePub));


