﻿module.exports = {
	N: 3,
	n: 1,
	nTx: 1,
	k: 0.01,
	consensusDuration: 2000,
	blockDuration: 3000,
	needPoint: 60000,
	reward: 1000,
	systemPort: process.env.PORT || 1337,
	dnsServer: "eblockchaindns.herokuapp.com/",
	trustedPeers: ["eblockchain1.herokuapp.com",
		"eblockchain2.herokuapp.com",
		"eblockchain3.herokuapp.com",
		"eblockchain4.herokuapp.com",
		"eblockchain5.herokuapp.com"],
	nextBlockFile: "./Data/nextBlockFile.json",
	privKeyFile: "./Data/privKey.txt",
	urlFile: "./Data/url.txt",
	db: "./Data/DB",
};