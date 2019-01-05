/**
 * Hash chuỗi đầu vào bằng thuật toán Sha256
 * @param {string} s: chuỗi đầu vào
 * @returns {string}: chuỗi mới sau khi hash
 */
function Sha256(s) {
	return "";
}

/**
 * Ký tên bằng thuật toán ECDSA
 * @param {string} privKey: private key của người ký
 * @param {string} message: thông điệp cần ký
 * @returns {JSON}: đối tượng json chứa các thông tin bao gồm thông điệp gốc (message), public key của người ký (pubKey), chữ ký (signature)
 */
function Sign(privKey, message) {
	return null;
}

/**
 * Kiểm tra chữ ký có hợp lệ không
 * @param {JSON} signature: chữ ký tạo ra bằng hàm Sign ở trên
 * @returns {boolean}: kết quả kiểm tra (đúng/sai)
 */
function Verify(signature) {
	return true;
}

/**
 * Tạo private key mới
 * @returns {string}: private key mới
 * */
function GetKey() {
	return "";
}

module.exports = { Sha256, Sign, Verify };