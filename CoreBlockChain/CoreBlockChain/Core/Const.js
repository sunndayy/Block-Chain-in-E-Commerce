const N = 100;
const n = 40;
﻿const N = 100; // so luong node ky ten hop le
const n = 40; // so luong chu ky can thiet
const nTx = 15; // so luong giao dich trong 1 block
const consensusDuration = 2000; // thoi gian dong thuan
const blockDuration = 3000; // 3000 milisecond, thoi gian giua 2 block lien tiep
const needPoint = 3; // so diem can tich luy
const reward = 1;
const systemPort = 2109;
const trustedPeers = [];
const dnsServer = "http://localhost:1337";
const peersFile = "./peers.txt";
const nextBlockFile = "./nextBlockFile.txt";
const privKeyFile = "./privKey.txt";
const urlFile = "./url.txt";
module.exports = { N, n, nTx, consensusDuration, blockDuration, needPoint, systemPort, trustedPeers, dnsServer, peersFile, nextBlockFile, privKeyFile, urlFile };module.exports = { N, n, nTx, consensusDuration, blockDuration, needPoint, systemPort, trustedPeers, dnsServer, peersFile, nextBlockFile, privKeyFile, urlFile };
