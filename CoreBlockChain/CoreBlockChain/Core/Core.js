const Crypto = require('./Crypto.js');
const Const = require('./Const.js');
var level = require('level');
var BlockHeaderDB = level('./BlockHeaderDB', { valueEncoding: 'json' });
var BlockDataDB = level('./BlockDataDB', { valueEncoding: 'json' });
var WalletDB = level('./WalletDB', { valueEncoding: 'json' });


class Wallet {
	/**
	 * Hàm khởi tạo wallet
	 * @param {string} pubKeyHash: public key hash của wallet
	 */
	constructor(pubKeyHash) {
		this.pubKeyHash = pubKeyHash;
		this.unSpentOutputs = []; // Mảng chứa các input chưa sử dụng của wallet
		this.depositBlockIndex = -1; // Index của block gần nhất mà wallet có thực hiện đặt cọc, rút cọc, hay thu thập block mới
	}

	GetUnSpentOutputs() {
		return this.unSpentOutputs;
	}
}

class TxIn {
	/**
	 * Hàm khởi tạo txIn
	 * @param {JSON} obj: đối tượng JSON chứa thông tin của txIn bao gồm preHashTx và outputIndex
	 */
	constructor(obj) {
		this.preHashTx = obj.preHashTx;
		this.outputIndex = obj.outputIndex;
	}
}

class TxOut {
	/**
	 * Hàm khởi tạo txOut
	 * @param {JSON} obj: đối tượng JSON chứa thông tin của txOut bao gồm pubKeyHash của wallet có thể sử dụng txOut này, money, isLocked (true/false, nếu true có nghĩa là input này dùng để đặt cọc và không thể giao dịch)
	 */
	constructor(obj) {
		this.pubKeyHash = obj.pubKeyHash;
		this.money = obj.money;
		this.isLocked = obj.isLocked;
	}
}

class Transaction {
	/**
	 * Hàm khởi tạo transaction
	 * @param {JSON} obj: đối tượng JSON chứa thông tin của transaction bao gồm mảng txIn, mảng txOut, 
	 * chữ ký của node thực hiện (không ký trên txIn nữa, chỉ ký 1 lần trên transaction) 
	 */
	constructor(obj) {
		this.txIns = obj.txIns;
		this.txOuts = obj.txOuts;
		this.senderSign = obj.senderSign;
	}

	/**
	 * Ký tên lên giao dịch (gán giá trị cho thành phần senderSign)
	 * @param {string} privKey: private key của node gửi
	 */
    Sign(privKey) {
        var message = JSON.stringify(this.txIns) + JSON.stringify(this.txOuts);
        this.senderSign = Crypto.Sign(privKey, message);
	}

	/**
	 * Kiểm tra chữ ký có hợp lệ không (không cần kiểm tra các txIn có tồn tại không)
	 * @returns {boolean}: kết quả kiểm tra
	 * */
    Verify() {
        return Crypto.Verify(this.senderSign);
	}
}

class BlockHeader {
	/**
	 * Hàm khởi tạo blockHeader
	 * @param {JSON} obj: đối tượng JSON chứa các thông tin của blockHeader bao gồm index, preBlockHash, 
	 * merkleRoot, validatorSigns (mảng các chữ ký của các node xác nhận, thông tin cần ký bao gồm preBlockHash, 
	 * merkleRoot, timeStamp (thời gian lúc ký, tính bằng milisecond), isAgreed (true/false, có đồng ý hay không)),
	 * creatorSign (chữ ký của node thu thập, nội dung ký là danh sách các node xác nhận đã ký tên)
	 */
	constructor(obj) {
		this.index = obj.index;
		this.preBlockHash = obj.preBlockHash;
		this.merkleRoot = obj.merkleRoot;
		this.validatorSigns = obj.validatorSigns;
		this.creatorSign = obj.creatorSign;
	}

	/**
	 * Kiểm tra các chữ ký của node xác nhận có được sắp xếp tăng dần theo thời gian ký không
	 * Kiểm tra chữ ký và nội dung ký của các node xác nhận có đúng và hợp lệ không
	 * Kiểm tra chữ ký và nội dung ký của node thu thập có đúng và hợp lệ không
	 * @returns {boolean}: kết quả kiểm tra
	 * */
    Verify() {
        var flag = true;

        for (var i = 0; i < this.validatorSigns.length - 1; i++) {
            var msg1 = JSON.parse(this.validatorSigns[i].message);
            var msg2 = JSON.parse(this.validatorSigns[i + 1].message);
            if (msg1.timeStamp > msg2.timeStamp) {
                flag = false;
                break;
            }
        }

        for (var i = 0; i < this.validatorSigns.length; i++) {
            if (!Crypto.Verify(this.validatorSigns[i])) {
                flag = false;
                break;
            }
            if (JSON.parse(this.validatorSigns[i].message).isAgreed == false) {
                flag = false;
                break;
            }
        }

        if (!Crypto.Verify(this.creatorSign)) {
            flag = false;
        }

        return flag;
	}

	/**
	 * Trả về thời gian tạo của block này (thời gian ký trễ nhất trong những node xác nhận)
	 * @returns {number}: thời gian ký trễ nhất tính theo milisecond
	 * */
    GetTimeStamp() {
        var message = JSON.parse(this.validatorSigns[this.validatorSigns.length - 1].message);
        return message.timeStamp;
	}

	/**
	 * Thêm chữ ký của node xác nhận vào danh sách validatorSigns (thêm theo kiểu insertion sort, sắp xếp tăng dần theo thời gian ký)
	 * @param {JSON} signature: chữ ký của node xác nhận
	 */
    AddSignature(signature) {
        if (this.validatorSigns.length == 0) {
            this.validatorSigns.push(signature);
            return;
        }

        var timeStamp = JSON.parse(signature.message).timeStamp;

        if (timeStamp <= JSON.parse(this.validatorSigns[0].message).timeStamp) {
            this.validatorSigns.unshift(signature);
            return;
        }

        if (timeStamp >= JSON.parse(this.validatorSigns[this.validatorSigns.length - 1].message).timeStamp) {
            this.validatorSigns.push(signature);
            return;
        }

        for (var i = 0; i < this.validatorSigns.length - 1; i++) {
            if (timeStamp >= JSON.parse(this.validatorSigns[i].message).timeStamp
                && timeStamp <= JSON.parse(this.validatorSigns[i + 1].message).timeStamp) {
                this.validatorSigns.splice(i + 1, 0, signature);
            }
        }

	}

	/**
	 * node thu thập ký tên thưởng cho những node xác nhận 
	 * (nội dung ký: mảng các pubKeyHash của những node xác nhận đã ký tên)
	 * gán chữ ký cho biến creatorSign
	 * @param {string} privKey: private key của node thu thập
	 */
	Sign(privKey) {
        var pubKeyHashs = [];
        for (var i = 0; i < this.validatorSigns.length; i++) {
            var pubKey = this.validatorSigns[i].pubKey;
            pubKeyHashs.push(Crypto.Sha256(pubKey));
        }
        this.creatorSign = Crypto.Sign(privKey, JSON.stringify(pubKeyHashs));
	}
}

class BlockData {
	/**
	 * Hàm khởi tạo blockData
	 * @param {Array} transactions: mảng các transaction trong blockData
	 */
	constructor(transactions) {
		this.transactions = transactions;
	}

	/**
	 * Tạo 1 giao dịch và thêm vào danh sách transactions để thưởng cho node thu thập
	 * Giá trị thưởng bằng chênh lệch giữa tổng các input và output của tất cả transaction trong blockData
	 * @param {string} pubKeyHash: pubKeyHash của node thu thập
     * 0 input, 1 output
	 */
    AddCreatorReWard(pubKeyHash) {
        var reward = 0;
        var totalInput = 0, totalOutput = 0;
        for (var i = 0; i < this.transactions.length; i++) {
            for (var j = 0; j < this.transactions[i].txOuts; j++) {
                totalOutput += this.transactions[i].txOuts[j].money;
            }
        }

        reward = totalInput - totalOutput;

        var txOut = new TxOut({ pubKeyHash: pubKeyHash, money: reward, isLocked: false });
        var tx = new Transaction({ txIns: [], txOuts: [txOut], senderSign: null });
        this.transactions.push(tx);
	}

	/**
	 * Tạo 1 giao dịch và thêm vào danh sách transactions để thưởng cho tất cả node xác nhận đã ký tên
	 * 0 input, nhiều output
     * Giá trị thưởng là hằng số
	 * @param {Array} validatorPubKeyHashes: mảng pubKeyHash của các node xác nhận
	 */
	AddValidatorRewards(validatorPubKeyHashes) {
        var txOuts = [];
        for (var i = 0; i < validatorPubKeyHashes.length; i++) {
            var txOut = new TxOut({ pubKeyHash: validatorPubKeyHashes[i], money: Const.reward, isLocked: false });
            txOuts.push(txOut);
        }
        var tx = new Transaction({ txIns: [], txOuts: txOuts, senderSign: null });
        this.transactions.push(tx);
	}

    MerkleRoot() {
        if (this.transactions.length == 0) {
            return '';
        }

        var tmp1 = [];
        for (var i = 0; i < Const.nTx + 1; i++) {
            tmp1.push(Crypto.Sha256(JSON.stringify(this.transactions[i])));
        }

        while (tmp1.length > 1) {
            var tmp2 = [];
            for (var i = 0; i < tmp1.length; i = i + 2) {
                var h1 = tmp[i];
                var h2;
                if (i == tmp1.length - 1) {
                    h2 = h1;
                }
                else {
                    h2 = tmp1[i + 1];
                }
                var h = Crypto.Sha256(h1 + h2);
                tmp2.push(h);
            }
            tmp1 = tmp2;
        }

		return tmp1[0];
	}
}

class BlockChain {
	/**
	 * Hàm khởi tạo blockChain
	 * */
	constructor() {
		this.headers = []; // mảng các header của các block
		this.walletArray = []; // mảng pubKeyHash của các wallet sắp xếp theo tiền đặt cọc giảm dần (wallet đầu tiên đặt cọc nhiều nhất)
		this.walletDictionary = {}; // dictionary với key là pubKeyHash của một wallet, value là đối tượng wallet tương ứng
        // Đọc dữ liệu từ levelDB, dựng lại mảng các header, cập nhật các wallet
        BlockHeaderDB.createReadStream().on('data', function (data) {
            this.headers.push(data.value);
        }).on('error', function (err) {
            console.log(err);
            });

        WalletDB.createReadStream().on('data', function (data) {
            this.walletArray.push(data.key);
            this.walletDictionary[data.key] = data.value;
        });

        this.walletArray.sort(function (a, b) {
            var totalDepositA = 0; totalDepositB = 0;

            var walletA = this.walletDictionary[a];
            var walletB = this.walletDictionary[b];

            for (var i = 0; i < walletA.unSpentOutputs.length; i++) {
                if (walletA.unSpentOutputs[i].isLocked) {
                    totalDepositA += walletA.unSpentOutputs[i].money;
                }
            }

            for (var i = 0; i < walletB.unSpentOutputs.length; i++) {
                if (walletB.unSpentOutputs[i].isLocked) {
                    totalDepositB += walletB.unSpentOutputs[i].money;
                }
            }

            if (totalDepositA > totalDepositB) {
                return -1;
            }
            if (totalDepositA < totalDepositB) {
                return 1;
            }
            if (totalDepositA = totalDepositB) {
                return 0;
            }
        });

	}

	GetHeader(index) {
		if (index < this.headers.length) {
			return this.headers[index];
		}
		return null;
	}

	/**
	 * Kiểm tra blockHeader có hợp lệ không
	 * @param {BlockHeader} blockHeader: blockHeader cần kiểm tra
	 * @param {BlockHeader} preBlockHeader: blockHeader của block liền trước
	 * @returns {boolean}: kết quả kiểm tra
	 */
	ValidateBlockHeader(blockHeader, preBlockHeader) {
		if (!blockHeader.Verify()) {
			return false;
		}
        // Kiểm tra index, preBlockHash của blockHeader có phải của preBlockHeader không
        if (blockHeader.index != preBlockHeader.index - 1) {
            return false;
        }
        if (blockHeader.preBlockHash != Crypto.Sha256(preBlockHeader.index + preBlockHeader.preBlockHash + preBlockHeader.merkleRoot)) {
            return false;
        }
		// Kiểm tra thời gian ký trễ nhất của preBlockHeader
        // và thời gian ký nhanh nhất của blockHeader cách nhau một khoảng thời gian t
        var msg1 = JSON.parse(preBlockHeader.validatorSigns[preBlockHeader.validatorSigns.length - 1]).message;
        var msg2 = JSON.parse(blockHeader.validatorSigns[0]).message;
        if (msg2.timeStamp - msg1.timeStamp < Const.blockDuration) {
            return false;
        }
        // Kiểm tra node thu thập (creator) đã tích lũy đủ điểm chưa
        var pubKeyCreator = JSON.parse(blockHeader.creatorSign.message).pubKey;
        var walletCreator = this.walletDictionary[pubKeyCreator];
        var total = 0;
        for (var i = 0; i < walletB.unSpentOutputs.length; i++) {
            if (walletB.unSpentOutputs[i].isLocked) {
                total += walletCreator.unSpentOutputs[i].money;
            }
        }
        if (this.CalculatePoint(walletCreator.depositBlockIndex, total) < Const.needPoint) {
            return false;
        }       
        // Kiểm tra node thu thập không nằm trong top đặt cọc (không phải node xác nhận)
        var msg3 = JSON.parse(blockHeader.creatorSign).message;
        if (this.walletArray.indexOf(Crypto.Sha256(msg3.pubKey)) != -1) {
            return false;
        }
        // Kiểm tra thời gian ký trễ nhất của blockHeader có sớm hơn thời gian hiện tại không
        var msg4 = JSON.parse(blockHeader.validatorSigns[blockHeader.validatorSigns.length - 1]).message;
        if (Date.now() - msg4.timeStamp < 0) {
            return false;
        }
        // Kiểm tra tất cả những node ký tên của blockHeader nằm trong top 100 đặt cọc của hệ thống
        var flag = true;
        for (var i = 0; i < blockHeader.validatorSigns.length; i++) {
            var msg = JSON.parse(blockHeader.validatorSigns[i].message);
            if (!this.IsOnTop(Crypto.Sha256(msg.pubKey))) {
                flag = false;
                break;
            }
        }
        // Kiểm tra những node ký tên preBlockHeader có ký tên blockHeader không (ký 2 block liên tiếp)
        for (var i = 0; i < preBlockHeader.validatorSigns.length; i++) {
            if (!flag) {
                break;
            }
            var msg1 = JSON.parse(preBlockHeader.validatorSigns[i].message);
            for (var j = 0; j < blockHeader.validatorSigns.length; j++) {
                var msg2 = JSON.parse(blockHeader.validatorSigns[i].message);
                if (msg1.pubKey == msg2.pubKey) {
                    flag = false;
                    break;
                }
            }
        }

        return flag;
	}

	/**
	 * Lấy dữ liệu của blockData theo blockHeaderHash từ levelDB
	 * @param {string} blockHeaderHash: blockHeaderHash của block cần lấy data
	 * @returns {BlockData}: blockData tương ứng với blockHeaderHash, nếu không có thì trả về null
	 */
    GetData(blockHeaderHash) {
        var blockData = null;
        BlockDataDB.get(blockHeaderHash, function (err, value) {
            if (err) {
                if (err.notFound) {
                    return;
                }
            }

            blockData = value;
        });
        return blockData;
	}

	/**
	 * Kiểm tra transaction có hợp lệ không
	 * @param {Transaction} transaction: transaction cần kiểm tra
	 * @returns {boolean}: kết quả kiểm tra
	 */
	ValidateTransaction(transaction) {
		// Kiểm tra tất cả input tồn tại
		// Kiểm tra tất cả input không bị khóa (nếu bị khóa thì chỉ có thể gửi lại cho chính mình (rút cọc))
		// Kiểm tra totalInput = k*totalOutput (k > 1, bao gồm cả tiền thưởng cho các node thu thập)
		return true;
	}

	/**
	 * Kiểm tra blockData có hợp lệ và đúng với blockHeader không
	 * @param {BlockData} blockData: blockData cần kiểm tra
	 * @param {BlockHeader} blockHeader: blockHeader của blockData
	 * @returns {boolean}: kết quả kiểm tra
	 */
	ValidateBlockData(blockData, blockHeader) {
		// Ghi chú: thứ tự trong các giao dịch trong blockData là 
		// transactions - 
		// phần thưởng cho node thu thập(bằng phần dư ra trong các transaction) - 
		// phần thưởng cho các node xác nhận đã ký tên(1 giao dịch, nhiều output)
		// Kiểm tra merkleRoot của blockData (không gồm phần thưởng cho các node xác nhận đã ký tên)
		// và merkleRoot của blockHeader có đúng không
		// Kiểm tra blockData có hợp lệ không
		// Kiểm tra số tiền thưởng của node thu thập có bằng phần dư ra của các transaction không
		// Kiểm tra trong blockData có thưởng cho các node xác nhận đã ký tên không
		return true;
	}

	GetUnSpentOutputs(pubKeyHash) {
		var wallet = this.walletDictionary[pubKeyHash];
		if (wallet) {
			return wallet.unSpentOutputs;
		}
		return null;
	}

	/**
	 * Cập nhật lại index của wallet trong mảng wallet
	 * @param {string} pubKeyHash: pubKeyHash của wallet cần cập nhật
	 */
	UpdateWallet(pubKeyHash) {
        // Xóa pubKeyHash khỏi mảng walletArray
        var i = this.walletArray.indexOf(pubKeyHash);
        if (i != -1) {
            this.walletArray.splice(i, 1);
        }
		// Thêm pubKeyHash vào lại mảng walletArray (làm tương tự như insertion sort, giá trị so sánh là tổng số tiền mà wallet đã đặt cọc (truy xuất thông qua walletDictionary))
	}

	/**
	 * Thêm 1 block vào chuỗi blockChain
	 * @param {BlockHeader} blockHeader: blockHeader của block cần thêm
	 * @param {BlockData} blockData: blockData của block cần thêm
	 */
	AddBlock(blockHeader, blockData) {
        // Thêm blockHeader vào mảng headers
        this.headers.push(blockHeader);
        // Ghi blockHeader, blockData vào cơ sở dữ liệu
        BlockHeaderDB.put(blockHeader.index, blockHeader);
        BlockDataDB.put(Crypto.Sha256(blockHeader.index + blockHeader.merkleRoot + blockHeader.preBlockHash), blockData);
		// Cập nhật lại unSpentOutputs của các wallet
		// Nếu trong các giao dịch có thông điệp đặt cọc, thông điệp rút cọc hoặc thông điệp được thưởng của node thu thập thì cập nhật lại depositBlockIndex của wallet đó
		// Cập nhật lại index của các wallet trong mảng walletArray
	}

	/**
	 * Lấy ra mảng pubKeyHash của các wallet có đặt cọc nhiều nhất
	 * @returns {Array}: mảng pubKeyHash của các wallet có đặt cọc nhiều nhất
	 * */
    GetTopWallets() {
        var top = this.walletArray.slice(0, Const.N);
        return top;
	}

	/**
	 * Kiểm tra một node có nằm trong top của hệ thống không
	 * @param {string} pubKeyHash: pubKeyHash của node cần kiểm tra
	 * @returns {boolean}: kết quả kiểm tra
	 */
    IsOnTop(pubKeyHash) {
        var top = this.walletArray.slice(0, Const.N);
        if (top.indexOf(pubKeyHash) != -1) {
            return true;
        }
        else {
            return false;
        }
	}

	/**
	 * Tính điểm cho một wallet
	 * @param {number} depositBlockIndex: index của block gần nhất mà wallet đã đặt cọc
	 * @param {number} totalDeposit: tổng số tiền đặt cọc
	 * @returns {number}: số điểm đã tích cóp được của wallet
	 */
	CalculatePoint(depositBlockIndex, totalDeposit) {
        // Lấy blockHeader của block gần nhất đã đặt cọc
        var blockHeader;
        for (var i = 0; i < this.headers.length; i++) {
            if (this.headers[i].index == depositBlockIndex) {
                blockHeader = this.headers[i];
                break;
            }
        }
        // Lấy thời gian hiện tại trừ cho thời gian của block mới lấy
        var time = Date.now() - blockHeader.GetTimeStamp();
        // Lấy kết quả nhân với số tiền đã đặt cọc
        return time * totalDeposit;
	}

	/**
	 * Tính thời gian phải chờ của 1 wallet
	 * @param {string} pubKeyHash
	 * @returns {number}: thời gian phải chờ thêm, nếu không có đặt cọc thì trả về -1
	 */
	GetTimeMustWait(pubKeyHash) {
        // Tính tổng số tiền mà wallet này đã đặt cọc
        var wallet = this.walletDictionary[pubKeyHash];
        var total = 0;
        for (var i = 0; i < wallet.unSpentOutputs.length; i++) {
            if (wallet.unSpentOutputs[i].isLocked) {
                total += wallet.unSpentOutputs[i].money;
            }
        }
		// Lấy thời gian hiện tại trừ cho thời gian của block khi wallet này đặt cọc
        var blockHeader;
        for (var i = 0; i < this.headers.length; i++) {
            if (this.headers[i].index == wallet.depositBlockIndex) {
                blockHeader = this.headers[i];
                break;
            }
        }
        var time = Date.now() - blockHeader.GetTimeStamp();

        // Lấy kết quả nhân với số tiền đã đặt cọc
        var temp = total * time;
        // Lấy số điểm cần thiết trừ cho kết quả vừa tính, sau đó đem chia cho số tiền đã đặt cọc
        var result = (Const.needPoint - temp) / total;
        // Trả về kết quả vừa tính, nếu < 0  thì trả về 0
        if (result < 0) {
            return 0;
        }
        else {
            return result;
        }
	}

	/**
	 * Lấy độ dài chuỗi blockChain
	 * @returns {number}: độ dài chuỗi blockChain
	 * */
	GetLength() {
		return this.headers.length;
	}
}

module.exports = { Transaction, BlockHeader, BlockData, BlockChain };