const sha256 = require("sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
var privKey = ec.keyFromPrivate("phamhuyhoang", "hex");
var pubKey = ec.keyFromPublic(privKey.getPublic("hex"), "hex");
var messageHash = sha256("blabla", { asBytes:true });
var signature = privKey.sign(messageHash);
console.log(pubKey.verify(messageHash, signature));