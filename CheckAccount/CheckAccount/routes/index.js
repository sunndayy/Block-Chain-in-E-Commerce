'use strict';
const sha256 = require('sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var express = require('express');
var router = express.Router();

function GetKey() {
    return ec.genKeyPair().getPrivate('hex');
}

function GetPubKeyHash(privKey) {
	return sha256(ec.keyFromPrivate(privKey).getPublic('hex'));
}

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Kiểm tra thông tin ví' });
});

router.post("/newWallet", function (req, res) {
	var privKey = GetKey();
	var pubKeyHash = GetPubKeyHash(privKey);
	var message = {
		header: "new_wallet",
		privKey: privKey,
		pubKeyHash: pubKeyHash
	};
	res.end(JSON.stringify(message));
});

module.exports = router;
