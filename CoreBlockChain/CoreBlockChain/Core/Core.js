var Crypto = require('./Crypto.js');

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

	}

	/**
	 * Kiểm tra chữ ký có hợp lệ không (không cần kiểm tra các txIn có tồn tại không)
	 * @returns {boolean}: kết quả kiểm tra
	 * */
	Verify() {
		return true;
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
		return true;
	}

	/**
	 * Trả về thời gian tạo của block này (thời gian ký trễ nhất trong những node xác nhận)
	 * @returns {number}: thời gian ký trễ nhất tính theo milisecond
	 * */
	GetTimeStamp() {
		return 0;
	}

	/**
	 * Thêm chữ ký của node xác nhận vào danh sách validatorSigns (thêm theo kiểu insertion sort, sắp xếp tăng dần theo thời gian ký)
	 * @param {JSON} signature: chữ ký của node xác nhận
	 */
	AddSignature(signature) {

	}

	/**
	 * node thu thập ký tên thưởng cho những node xác nhận 
	 * (nội dung ký: mảng các pubKeyHash của những node xác nhận đã ký tên)
	 * gán chữ ký cho biến creatorSign
	 * @param {string} privKey: private key của node thu thập
	 */
	Sign(privKey) {

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
	 */
	AddCreatorReWard(pubKeyHash) {

	}

	/**
	 * Tạo 1 giao dịch và thêm vào danh sách transactions để thưởng cho tất cả node xác nhận đã ký tên
	 * 1 input, nhiều output
	 * @param {Array} validatorPubKeyHashes: mảng pubKeyHash của các node xác nhận
	 */
	AddValidatorRewards(validatorPubKeyHashes) {

	}

	MerkleRoot() {
		return "";
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
		// Kiểm tra thời gian ký trễ nhất của preBlockHeader
		// và thời gian ký nhanh nhất của blockHeader cách nhau một khoảng thời gian t
		// Kiểm tra node thu thập (creator) đã tích lũy đủ điểm chưa
		// Kiểm tra node thu thập không nằm trong top đặt cọc (không phải node xác nhận)
		// Kiểm tra thời gian ký trễ nhất của blockHeader có sớm hơn thời gian hiện tại không
		// Kiểm tra tất cả những node ký tên của blockHeader nằm trong top 100 đặt cọc của hệ thống
		// Kiểm tra những node ký tên preBlockHeader có ký tên blockHeader không (ký 2 block liên tiếp)
	}

	/**
	 * Lấy dữ liệu của blockData theo blockHeaderHash từ levelDB
	 * @param {string} blockHeaderHash: blockHeaderHash của block cần lấy data
	 * @returns {BlockData}: blockData tương ứng với blockHeaderHash, nếu không có thì trả về null
	 */
	GetData(blockHeaderHash) {
		return null;
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
		// Thêm pubKeyHash vào lại mảng walletArray (làm tương tự như insertion sort, giá trị so sánh là tổng số tiền mà wallet đã đặt cọc (truy xuất thông qua walletDictionary))
	}

	/**
	 * Thêm 1 block vào chuỗi blockChain
	 * @param {BlockHeader} blockHeader: blockHeader của block cần thêm
	 * @param {BlockData} blockData: blockData của block cần thêm
	 */
	AddBlock(blockHeader, blockData) {
		// Thêm blockHeader vào mảng headers
		// Ghi blockHeader, blockData vào cơ sở dữ liệu
		// Cập nhật lại unSpentOutputs của các wallet
		// Nếu trong các giao dịch có thông điệp đặt cọc, thông điệp rút cọc hoặc thông điệp được thưởng của node thu thập thì cập nhật lại depositBlockIndex của wallet đó
		// Cập nhật lại index của các wallet trong mảng walletArray
	}

	/**
	 * Lấy ra mảng pubKeyHash của các wallet có đặt cọc nhiều nhất
	 * @returns {Array}: mảng pubKeyHash của các wallet có đặt cọc nhiều nhất
	 * */
	GetTopWallets() {
		return [];
	}

	/**
	 * Kiểm tra một node có nằm trong top của hệ thống không
	 * @param {string} pubKeyHash: pubKeyHash của node cần kiểm tra
	 * @returns {boolean}: kết quả kiểm tra
	 */
	IsOnTop(pubKeyHash) {
		return true;
	}

	/**
	 * Tính điểm cho một wallet
	 * @param {number} depositBlockIndex: index của block gần nhất mà wallet đã đặt cọc
	 * @param {number} totalDeposit: tổng số tiền đặt cọc
	 * @returns {number}: số điểm đã tích cóp được của wallet
	 */
	CalculatePoint(depositBlockIndex, totalDeposit) {
		// Lấy blockHeader của block gần nhất đã đặt cọc
		// Lấy thời gian hiện tại trừ cho thời gian của block mới lấy
		// Lấy kết quả nhân với số tiền đã đặt cọc
		return 0;
	}

	/**
	 * Tính thời gian phải chờ của 1 wallet
	 * @param {string} pubKeyHash
	 * @returns {number}: thời gian phải chờ thêm, nếu không có đặt cọc thì trả về -1
	 */
	GetTimeMustWait(pubKeyHash) {
		// Tính tổng số tiền mà wallet này đã đặt cọc
		// Lấy thời gian hiện tại trừ cho thời gian của block khi wallet này đặt cọc
		// Lấy kết quả nhân với số tiền đã đặt cọc
		// Lấy số điểm cần thiết trừ cho kết quả vừa tính, sau đó đem chia cho số tiền đã đặt cọc
		// Trả về kết quả vừa tính, nếu < 0  thì trả về 0
		return 0;
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