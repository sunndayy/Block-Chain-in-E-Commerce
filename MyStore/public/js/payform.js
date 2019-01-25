var ws = new WebSocket("ws://localhost:3000");
ws.onopen = function(evt) {
  console.log("Da ket noi voi mystore");
};
ws.onmessage = function(evt) {
  alert(evt.data);
};
ws.onerror = function(evt) {
  console.log(evt);
};
ws.onclose = function(evt) {
  console.log("Da dong ket noi voi mystore");
};

var wsBlockChain = new WebSocket("ws://eblockchain5.herokuapp.com");
wsBlockChain.onopen = function(evt) {
  console.log("Da ket noi voi blockchain");
};
wsBlockChain.onmessage = function(evt) {
  var utxos = JSON.parse(evt.data).utxos;
  alert(JSON.stringify(utxos));
  ws.send(JSON.stringify({
    header: 'payment',
    data: {
      fullname: document.getElementsByName('fullname')[0].value,
      address: document.getElementsByName('address')[0].value,
      telephone: document.getElementsByName('telephone')[0].value,
      privKey: document.getElementsByName('privKey')[0].value,
      utxos: utxos
    }
  }))
};
wsBlockChain.onerror = function(evt) {
  console.log(evt);
};

wsBlockChain.onclose = function(evt) {
  console.log("Da dong ket noi voi blockchain");
};

function handlePayment() {
  wsBlockChain.send(JSON.stringify({
    header: 'get_utxos',
    pubKeyHash: document.getElementsByName('addressWallet')[0].value
  }))
  alert('Vui lòng đợi chúng tôi xác nhận giao dịch');
}