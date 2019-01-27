var ws = new WebSocket("ws://bookshopping.herokuapp.com");
ws.onopen = function(evt) {
  console.log("Đã kết nối với bookshopping");
};
ws.onmessage = function(evt) {
  alert(evt.data);
};
ws.onerror = function(evt) {
  console.log(evt);
};
ws.onclose = function(evt) {
  console.log("Đã đóng kết nối với bookshopping");
};

var wsBlockChain = new WebSocket("ws://eblockchain5.herokuapp.com");
wsBlockChain.onopen = function(evt) {
  console.log("Đã kết nối với E-BlockChain");
};
wsBlockChain.onmessage = function(evt) {
  var utxos = JSON.parse(evt.data).utxos;
  ws.send(JSON.stringify({
    header: 'payment',
    data: {
      fullname: document.getElementsByName('fullname')[0].value,
      address: document.getElementsByName('address')[0].value,
      telephone: document.getElementsByName('telephone')[0].value,
      privKey: document.getElementsByName('privKey')[0].value,
      pubKeyHash: document.getElementsByName('addressWallet')[0].value,
      utxos: utxos
    }
  }))
};
wsBlockChain.onerror = function(evt) {
  console.log(evt);
};

wsBlockChain.onclose = function(evt) {
  console.log("Đã đóng kết nối với E-BlockChain");
};

function handlePayment() {
  wsBlockChain.send(JSON.stringify({
    header: 'get_utxos',
    pubKeyHash: document.getElementsByName('addressWallet')[0].value
  }))
  alert('Vui lòng đợi chúng tôi xác nhận giao dịch');
}