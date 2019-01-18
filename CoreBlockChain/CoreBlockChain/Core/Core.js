const Crypto = require("./Crypto");
const Const = require("./Const");
const level = require("level");
const db = level(Const.db, { valueEncoding: "json" });
class Wallet {
	constructor(pubKeyHash) {
		this.pubKeyHash = pubKeyHash;
		this.utxos = [];
		this.depositBlockIndex = -1;
	}
	GetUtxos() {
		return this.utxos;
	}
	GetTotalDeposit() {
		var totalDeposit = 0;
		for (var i = 0; i < this.utxos.length; i++) {
			if (this.utxos[i].isLocked) {
				totalDeposit += this.utxos[i].money;
			}
		}
		return totalDeposit;
	}
	GetTotalMoney() {
		var totalMoney = 0;
		for (var i = 0; i < this.utxos.length; i++) {
			totalMoney += this.utxos[i].money;
		}
		return totalMoney;
	}
}
class TxIn {
	constructor(obj) {
		this.preHashTx = obj.preHashTx;
		this.outputIndex = obj.outputIndex;
	}
}
class TxOut {
	constructor(obj) {
		this.pubKeyHash = obj.pubKeyHash;
		this.money = obj.money;
		this.isLocked = obj.isLocked;
	}
}
class Tx {
	constructor(obj) {
		this.txIns = obj.txIns;
		this.txOuts = obj.txOuts;
		this.message = obj.message;
		this.senderSign = obj.senderSign;
	}
	CalculateFee() {
		var totalMoney = 0;
		var senderPubKeyHash = Crypto.Sha256(this.senderSign.pubKey);
		for (var i = 0; i < this.txOuts.length; i++) {
			if (this.txOuts[i].pubKeyHash != senderPubKeyHash) {
				totalMoney += this.txOuts[i].money;
			}
		}
		return totalMoney * Const.k;
	}
	Sign(privKey) {
		var message = {
			txIns: this.txIns,
			txOuts: this.txOuts,
			message: this.message
		};
		this.senderSign = Crypto.Sign(privKey, JSON.stringify(message));
	}
	Verify() {
		var message = {
			txIns: this.txIns,
			txOuts: this.txOuts,
			message: this.message
		};
		return Crypto.Verify(this.senderSign)
			&& this.senderSign.message == JSON.stringify(message);
	}
	IsDepositTx() {
		return this.txOuts.length == 1 && this.txOuts[0].pubKeyHash == Crypto.Sha256(this.senderSign.pubKey);
	}
}
class BlockHeader {
	constructor(obj) {
		this.index = obj.index;
		this.merkleRoot = obj.merkleRoot;
		this.preBlockHash = obj.preBlockHash;
		this.validatorSigns = obj.validatorSigns;
		this.creatorSign = obj.creatorSign;
	}
	ValidateSign(sign) {
		if (Crypto.Verify(sign)) {
			var message = JSON.parse(sign.message);
			return message.isAgreed
				&& message.index == this.index
				&& message.merkleRoot == this.merkleRoot
				&& message.preBlockHash == this.preBlockHash;
		}
		return false;
	}
	Verify() {
		for (var i = 0; i < this.validatorSigns.length; i++) {
			if (!this.ValidateSign(this.validatorSigns[i])) {
				return false;
			}
		}
		var validatorPubKeyHashes = this.validatorSigns.map(sign => {
			return Crypto.Sha256(sign.pubKey);
		});
		if (!Crypto.Verify(this.creatorSign)
			|| this.creatorSign.message != JSON.stringify(validatorPubKeyHashes)) {
			return false;
		}
		return true;
	}
	GetTimeStamp() {
		if (this.index <= 1) {
			return 0;
		}
		var message = JSON.parse(this.validatorSigns[Const.n - 1].message);
		return message.timeStamp;
	}
	Sign(privKey) {
		var validatorPubKeyHashes = this.validatorSigns.map(sign => {
			return Crypto.Sha256(sign.pubKey);
		});
		this.creatorSign = Crypto.Sign(privKey, JSON.stringify(validatorPubKeyHashes));
	}
	GetHash() {
		return Crypto.Sha256(JSON.stringify(this));
	}
}
class BlockData {
	constructor(txs) {
		this.txs = [];
		for (var i = 0; i < txs.length; i++) {
			this.txs.push(new Tx(txs[i]));
		}
	}
	AddCreatorReWard(pubKeyHash) {
		var reward = 0;
		for (var i = 0; i < Const.nTx; i++) {
			reward += this.txs[i].CalculateFee();
		}
		var tx = new Tx({
			txOuts: [{
				pubKeyHash: pubKeyHash,
				money: reward
			}]
		});
		this.txs.push(tx);
	}
	AddValidatorRewards(validatorPubKeyHashes) {
		var txOuts = [];
		for (var i = 0; i < validatorPubKeyHashes.length; i++) {
			var txOut = new TxOut({
				pubKeyHash: validatorPubKeyHashes[i],
				money: Const.reward
			});
			txOuts.push(txOut);
		}
		var tx = new Tx({ txOuts: txOuts });
		this.txs.push(tx);
	}
	MerkleRoot() {
		if (this.txs.length == 0) {
			return '';
		}
		var tmp1 = [];
		for (var i = 0; i < Const.nTx + 1 && i < this.txs.length; i++) {
			tmp1.push(Crypto.Sha256(JSON.stringify(this.txs[i])));
		}
		while (tmp1.length > 1) {
			var tmp2 = [];
			for (var i = 0; i < tmp1.length; i = i + 2) {
				var h1 = tmp1[i];
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
	constructor() {
		this.headers = [];
		this.walletArray = [];
		this.walletDictionary = {};
	}
	Initiate(cb) {
		var tmpArray = [];
		var blockChain = this;
		db.createReadStream().
			on("data", data => {
				tmpArray.push(data.value);
			})
			.on("end", () => {
				tmpArray.sort((a, b) => {
					return a.blockHeader.index - b.blockHeader.index;
				});
				for (var i = 0; i < tmpArray.length; i++) {
					var blockHeader = new BlockHeader(tmpArray[i].blockHeader);
					var blockData = new BlockData(tmpArray[i].blockData.txs);
					blockChain.AddBlock(blockHeader, blockData);
				}
				cb();
			});
	}
	GetHeader(index) {
		if (index < this.headers.length) {
			return this.headers[index];
		}
		return null;
	}
	ValidateBlockHeader(blockHeader, preBlockHeader) {
		if (!blockHeader.Verify()) {
			return false;
		}
		if (blockHeader.validatorSigns.length != Const.n) {
			return false;
		}
		for (var i = 0; i < Const.n - 1; i++) {
			var message1 = JSON.parse(blockHeader.validatorSigns[i].message);
			var message2 = JSON.parse(blockHeader.validatorSigns[i + 1].message);
			if (message1.timeStamp > message2.timeStamp) {
				return false;
			}
		}
		if (blockHeader.index != preBlockHeader.index + 1) {
			return false;
		}
		if (blockHeader.preBlockHash != preBlockHeader.GetHash()) {
			return false;
		}
		if (preBlockHeader.validatorSigns) {
			var msg = JSON.parse(blockHeader.validatorSigns[0].message);
			if (msg.timeStamp - preBlockHeader.GetTimeStamp() < Const.blockDuration) {
				return false;
			}
			for (var i = 0; i < Const.n; i++) {
				for (var j = 0; j < Const.n; j++) {
					if (preBlockHeader.validatorSigns[i].pubKey == blockHeader.validatorSigns[j].pubKey) {
						return false;
					}
				}
			}
		}
		var creatorPubKeyHash = Crypto.Sha256(blockHeader.creatorSign.pubKey);
		var creatorWallet = this.walletDictionary[creatorPubKeyHash];
		if (creatorWallet) {
			if (this.CalculatePoint(creatorWallet.depositBlockIndex, blockHeader.GetTimeStamp(), creatorWallet.GetTotalDeposit()) < Const.needPoint) {
				return false;
			}
		} else {
			return false;
		}
		// if (this.IsOnTop(creatorPubKeyHash)) {
		// 	return false;
		// }
		for (var i = 0; i < Const.n; i++) {
			var pubKey = blockHeader.validatorSigns[i].pubKey;
			if (!this.IsOnTop(Crypto.Sha256(pubKey))) {
				return false;
			}
		}
		return true;
	}
	GetData(blockHeaderHash, cb) {
		db.get(blockHeaderHash, (err, value) => {
			if (err) {
				console.log(err);
				cb(null);
			} else {
				cb(value.blockData);
			}
		});
	}
	ValidateTx(tx) {
		if (!tx.Verify()) {
			return "Chu ky khong hop le";
		};
		var wallet = this.walletDictionary[Crypto.Sha256(tx.senderSign.pubKey)];
		if (wallet) {
			var isDepositTx = tx.IsDepositTx();
			var totalInput = 0;
			for (var i = 0; i < tx.txIns.length; i++) {
				var utxo = wallet.utxos.find(utxo => {
					return utxo.preHashTx == tx.txIns[i].preHashTx
						&& utxo.outputIndex == tx.txIns[i].outputIndex;
				});
				if (utxo) {
					if (utxo.isLocked && !isDepositTx) {
						return "So tien su dung da bi lock";
					}
					totalInput += utxo.money;
				} else {
					return "TxIn khong ton tai";
				}
			}
			var totalOutput = 0;
			for (var i = 0; i < tx.txOuts.length; i++) {
				totalOutput += tx.txOuts[i].money;
			}
			if (Math.abs(totalInput - totalOutput - tx.CalculateFee()) > 0.0000000001) {
				return "Khong du tien";
			}
			return "Thanh cong";
		}
		return "Tai khoan khong ton tai";
	}
	ValidateBlockData(blockData, blockHeader) {
		if (blockData.MerkleRoot() != blockHeader.merkleRoot) {
			return false;
		}
		if (blockData.txs.length != Const.nTx + 2) {
			return false;
		}
		var reward = 0;
		for (var i = 0; i < Const.nTx; i++) {
			if (!this.ValidateTx(blockData.txs[i])) {
				return false;
			}
			reward += blockData.txs[i].CalculateFee();
		}
		if (Math.abs(reward - blockData.txs[Const.nTx].txOuts[0].money) > 0.0000000001) {
			return false;
		}
		var tmp1 = blockHeader.validatorSigns.map(sign => {
			return Crypto.Sha256(sign.pubKey);
		});
		var tmp2 = blockData.txs[Const.nTx + 1].txOuts.map(txOut => {
			return txOut.pubKeyHash;
		});
		if (tmp1.length != tmp2.length) {
			return false;
		}
		for (var i = 0; i < tmp1.length; i++) {
			if (tmp2.indexOf(tmp1[i]) < 0) {
				return false;
			}
		}
		return true;
	}
	GetUtxos(pubKeyHash) {
		var wallet = this.walletDictionary[pubKeyHash];
		if (wallet) {
			return wallet.utxos;
		}
		return [];
	}
	GetTotalMoney(pubKeyHash) {
		var wallet = this.walletDictionary[pubKeyHash];
		if (wallet) {
			return wallet.GetTotalMoney();
		}
		return 0;
	}
	AddBlock(blockHeader, blockData) {
		this.headers.push(blockHeader);
		db.get(blockHeader.GetHash(), (err, value) => {
			if (err) {
				db.put(blockHeader.GetHash(), {
					blockHeader: blockHeader,
					blockData: blockData
				});
			}
		});
		for (var i = 0; i < blockData.txs.length; i++) {
			if (blockData.txs[i].txIns) {
				var wallet = this.walletDictionary[Crypto.Sha256(blockData.txs[i].senderSign.pubKey)];
				for (var j = 0; j < blockData.txs[i].txIns.length; j++) {
					var utxo = wallet.utxos.find(utxo => {
						return utxo.preHashTx == blockData.txs[i].txIns[j].preHashTx
							&& utxo.outputIndex == blockData.txs[i].txIns[j].outputIndex;
					});
					wallet.utxos.splice(wallet.utxos.indexOf(utxo), 1);
				}
				if (blockData.txs[i].IsDepositTx()) {
					wallet.depositBlockIndex = blockHeader.index;
				}
			}
			for (var j = 0; j < blockData.txs[i].txOuts.length; j++) {
				var recvPubKeyHash = blockData.txs[i].txOuts[j].pubKeyHash;
				if (!this.walletDictionary[recvPubKeyHash]) {
					this.walletDictionary[recvPubKeyHash] = new Wallet(recvPubKeyHash);
					this.walletArray.push(recvPubKeyHash);
				}
				var walletRecv = this.walletDictionary[recvPubKeyHash];
				var obj = {
					preHashTx: Crypto.Sha256(JSON.stringify(blockData.txs[i])),
					outputIndex: j,
					money: blockData.txs[i].txOuts[j].money,
					isLocked: blockData.txs[i].txOuts[j].isLocked
				};
				walletRecv.utxos.push(obj);
				if (obj.isLocked) {
					walletRecv.depositBlockIndex = blockHeader.index;
				}
			}
		}
		if (blockHeader.creatorSign) {
			var creatorWallet = this.walletDictionary[Crypto.Sha256(blockHeader.creatorSign.pubKey)];
			creatorWallet.depositBlockIndex = blockHeader.index;
		}
		var blockChain = this;
		this.walletArray.sort(function (a, b) {
			return blockChain.walletDictionary[b].GetTotalDeposit() - blockChain.walletDictionary[a].GetTotalDeposit();
		});
		console.log(blockHeader.index + "/");
		var allKeys = Object.keys(this.walletDictionary);
		for (var i = 0; i < allKeys.length; i++) {
			console.log(allKeys[i] + ": " + this.walletDictionary[allKeys[i]].GetTotalMoney());
		}
		console.log();
	}
	GetTopWallets() {
		return this.walletArray.slice(0, Const.N);
	}
	IsOnTop(pubKeyHash) {
		return this.GetTopWallets().indexOf(pubKeyHash) >= 0;
	}
	CalculatePoint(depositBlockIndex, currentTime, totalDeposit) {
		var blockHeader = this.headers[depositBlockIndex];
		var time = currentTime - blockHeader.GetTimeStamp();
		return time * totalDeposit;
	}
	GetTimeMustWait(pubKeyHash) {
		var wallet = this.walletDictionary[pubKeyHash];
		if (wallet) {
			var totalDeposit = wallet.GetTotalDeposit();
			if (totalDeposit > 0) {
				var depositBlockIndex = this.walletDictionary[pubKeyHash].depositBlockIndex;
				var totalPoint = this.CalculatePoint(depositBlockIndex, (new Date()).getTime(), totalDeposit);
				return (Const.needPoint - totalPoint) / totalDeposit;
			}
		}
		return 3600000;
	}
	GetLength() {
		return this.headers.length;
	}
}
module.exports = { Tx, BlockHeader, BlockData, BlockChain };