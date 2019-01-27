var ws = null;

function Reset() {
	document.getElementById("pubKeyHash").value = "";
	document.getElementById("balance").innerText = 0;
	document.getElementById("utxo").innerText = 0;
	document.getElementById("deposit").innerText = 0;
	document.getElementById("host").value = "ws://eblockchain1.herokuapp.com";
	try {
		ws.close();
	} catch (err) {
		console.log(err.toString());
	}
}

function Check() {
	try {
		ws.close();
	} catch (err) {
		console.log(err.toString());
	}
	ws = new WebSocket(document.getElementById("host").value);
	ws.onopen = function (evt) {
		var pubKeyHash = document.getElementById("pubKeyHash").value;
		ws.send(JSON.stringify({
			header: "get_balance",
			pubKeyHash: pubKeyHash
		}));
		ws.send(JSON.stringify({
			header: "get_utxos",
			pubKeyHash: pubKeyHash
		}));
	}
	ws.onerror = function (evt) {
		alert("Lỗi kết nối");
	}
	ws.onclose = function (evt) {
		console.log("Đã đóng kết nối");
	}
	ws.onmessage = function (evt) {
		try {
			var message = JSON.parse(evt.data);
			switch (message.header) {
				case "balance":
					document.getElementById("balance").innerText = message.balance;
					break;
				case "utxos":
					var deposit = 0;
					var utxo = 0;
					for (var i = 0; i < message.utxos.length; i++) {
						utxo += message.utxos[i].money;
						if (message.utxos[i].isLocked) {
							deposit += message.utxos[i].money;
						}
					}
					document.getElementById("deposit").innerText = deposit;
					document.getElementById("utxo").innerText = utxo - deposit;
					break;
			}
		} catch (err) {
			console.log(err.toString());
		}
	}
}

function GetKey() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			try {
				var message = JSON.parse(this.responseText);
				var key = {
					privKey: message.privKey,
					pubKeyHash: message.pubKeyHash
				};
				var element = document.createElement('a');
				element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(key)));
				element.setAttribute('download', "key.txt");
				element.style.display = 'none';
				document.body.appendChild(element);
				element.click();
				document.body.removeChild(element);
			} catch (err) {
				console.log(err.toString());
			}
		}
	};
	xhttp.open("POST", "./newWallet", true);
	xhttp.send();
}