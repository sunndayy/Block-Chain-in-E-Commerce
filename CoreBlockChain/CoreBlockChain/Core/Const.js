﻿﻿const N = 2;
const n = 1;
const nTx = 1;
const k = 0.01;
const consensusDuration = 2000;
const blockDuration = 3000;
const needPoint = 60000;
const reward = 1;
const systemPort = 1204;
const dnsServer = "eblockchaindns.herokuapp.com/";
const nextBlockFile = "./Data/nextBlockFile.json";
const privKeyFile = "./Data/privKey.txt";
const urlFile = "./Data/url.txt";
const db = "./Data/DB";
module.exports = { N, n, nTx, k, consensusDuration, blockDuration, needPoint, reward, systemPort, dnsServer, nextBlockFile, privKeyFile, urlFile, db };
