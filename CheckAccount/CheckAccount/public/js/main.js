
(function ($) {
    "use strict";

    $('.validate-form').on('submit',function(){
        lookUp();
        return false;
    });
    
    /*==================================================================
    [ WebSocket ]*/

    var ws = new WebSocket("ws://eblockchain1.herokuapp.com");

    ws.onerror = function(evt) {
        alert("Connection Error");
    };

    ws.onclose = function(evt) {
        console.log("Connection Was Closed");
    };

    ws.onmessage = function(evt) {
        try {
            var message = JSON.parse(evt.data);
            switch (message.header) {
                case "balance":
                    document.getElementsByName("balance")[0].value = message.balance;
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
                    document.getElementsByName("deposit")[0].value = deposit;
                    document.getElementsByName("utxos")[0].value = utxo - deposit;
                    break;
            }
        } catch (err) {
            console.log(err.toString());
        };
    };

    function lookUp() {
        var pubKeyHash = document.getElementsByName("pubKeyHash")[0].value;
        ws.send(JSON.stringify({
            header: "get_balance",
            pubKeyHash: pubKeyHash
        }));
        ws.send(JSON.stringify({
            header: "get_utxos",
            pubKeyHash: pubKeyHash
        }));
    }
})(jQuery);

function getKey() {
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