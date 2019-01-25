global.express = require('express');

global.session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var http = require("http");

global.sessionStore = new MySQLStore({
  host: 'remotemysql.com',
  user: 'fROIiKFSmc',
  password: 'QdTXNSaDEB',
  database: 'fROIiKFSmc',
  port: '3306',
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    }
  }
});
global.router = express.Router();

var sessionParser = session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
});
router.use(sessionParser);

global.Id = 0;

var parseurl = require('parseurl');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var upload = multer();

var homeController = require('./controllers/homeController');
var productController = require('./controllers/productController');
var userController = require('./controllers/userController');
var cartController = require('./controllers/cartController');
var adminController = require('./controllers/adminController');

// for web socket
var addressWalletStore = '1e095aff6eef007cb07577f0646e31b3756e6fe8d505462b477cdd273bc2243a';
var connectionBlockChain = null;

function ConnectCoreBlockChain() {
    var WebSocketClient = require('websocket').client;
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('My store connect to E-Coin');
        connectionBlockChain = connection;
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('Connection Closed');
            ConnectCoreBlockChain();
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var data = JSON.parse(message.utf8Data);
                if (data.header == 'tx_result') {
                    console.log(data);
                    if (data.result == 'Thanh cong') {
                        // Lay id cua don hang
                        var idCart = JSON.parse(data.message).idCart;
                        // Tim id cua user
                        var idUser = JSON.parse(data.message).idUser;
                        // Tim connection cua user
                        if (users[idUser]) {
                            users[idUser].sendUTF('Đơn hàng mã số ' + idCart.toString() + 'của bạn đã thanh toán thành công');
                        }
                        // Updatedb trang thai don hang da thanh toan
                        if (idCart) {
                            cartRepo.updatePayStatus(idCart, 'Đã thanh toán');
                        }
                    }
                }
            }
        });
        connection.sendUTF(JSON.stringify({
            header: 'follow',
            pubKeyHash: addressWalletStore
        }));
    });

    client.connect('ws://eblockchain5.herokuapp.com');
}

ConnectCoreBlockChain();

// for request client
var cartRepo = require('./repos/cartRepo');
var sha256 = require('sha256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

// for app
var app = express();

app.use(cookieParser());

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
// form-urlencoded

// for parsing multipart/form-data
app.use(upload.array());

app.set('view engine', 'pug');
app.set('views','./views');
app.set('views/products','./views/products');
app.set('views/users', './views/users');
app.set('views/cart', './views/cart');
app.set('views/admin', './views/admin');

app.use(express.static('public'));
app.use('/', homeController);
app.use('/products', productController);
app.use('/users', userController);
app.use('/cart', cartController);
app.use('/admin', adminController);

var httpServer =  http.createServer(app);
httpServer.listen(process.env.PORT || 3000);

var users = {}; // key la id, value la websocket tuong ung
var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({ 
    httpServer: httpServer, 
    autoAcceptConnections:false
});
wsServer.on("request", req => {
    sessionParser(req.httpRequest, {}, () => {
        if (req.httpRequest.session.user) {
            var connection = req.accept(null, req.origin);
            var id = req.httpRequest.session.user.id;
            if (!users[id]) {
                users[id] = [];
            }
            users[id].push(connection);
            connection.on("message", message => {
                var data = JSON.parse(message.utf8Data).data;
                var totalMoney = 0, totalInput = 0;
                var txIns = [];
                var cart = req.httpRequest.session.cart;
                for (var i = 0; i < cart.length; i++) {
                    totalMoney += cart[i].price;
                }
                for (var i = 0; i < data.utxos.length; i++) {
                    if (!data.utxos[i].isLocked) {
                        totalInput += data.utxos[i].money;
                        txIns.push({
                            preHashTx: data.utxos[i].preHashTx,
                            outputIndex: data.utxos[i].outputIndex
                        });
                    }
                    if (totalInput >= totalMoney * 1.01) {
                        break;
                    }
                }
                if (totalInput < totalMoney * 1.01) {
                    if (users[id]) {
                        connection.sendUTF('Số dư của bạn không đủ');
                    }
                }
                else {
                    if (users[id]) {
                        connection.sendUTF('Giao dịch của bạn đã được gửi lên hệ thống, vui lòng chờ');
                    }
                    var p1 = cartRepo.createOrder(id, data.fullname, data.address, data.telephone);
                    Promise.all([p1]).then(([p1Rows]) => {
                        var p2 = cartRepo.getLastOrderId(id);        
                        Promise.all([p2]).then(([p2Rows]) => {
                            for (i = 0; i < cart.length; i++) {
                                var p3 = cartRepo.insertOrderItem(p2Rows[0].id, cart[i].id, cart[i].quantity, cart[i].price * cart[i].quantity);
                                Promise.all([p3]).then(([p3Rows]) => {
                                    console.log("Inserted!");
                                });
                            }
                            var p4 = cartRepo.getBookId(p2Rows[0].id);
                            Promise.all([p4]).then(([p4Rows]) => {
                                for (i = 0; i < p4Rows.length; i++) {
                                    var p5 = cartRepo.updateQuantity(p4Rows[i].product_id, p4Rows[i].quantity);
                                    Promise.all([p5]).then(([p5Rows]) => {
                                    console.log("Updated!");
                                    });
                                }
                            });    
                            
                            
                            var key = ec.keyFromPrivate(data.privKey, 'hex');
                            var pubKey = key.getPublic('hex');
                            var pubKeyHash = sha256(pubKey);
                            var txOuts, tx;
                            var senderSign;

                            txOuts = [{
                                pubKeyHash: addressWalletStore,
                                money: totalMoney,
                            }, {
                                pubKeyHash: pubKeyHash,
                                money: totalInput - 1.01 * totalMoney
                            }];
                        
                            tx = {
                                txIns: txIns,
                                txOuts: txOuts,
                                message: JSON.stringify({
                                    idUser: id,
                                    idCart: p2Rows[0].id
                                })
                            }
                        
                            senderSign = {
                                message: JSON.stringify(tx),
                                pubKey: pubKey,
                                signature: key.sign(sha256(JSON.stringify(tx), { asBytes: true }))
                            };
                        
                            tx.senderSign = senderSign;

                            console.log(JSON.stringify(tx));

                            // connectionBlockChain.sendUTF(JSON.stringify({
                            //     header: 'tx',
                            //     tx: tx
                            // }));
                        });
                    });
                }
            });
            connection.on("close", (reasonCode, description) => {
                console.log('close');
                var index = users[id].indexOf(connection);
                users[id].splice(index, 1);
                if (users[id].length == 0) {
                    delete users[id];
                }
            });
        } else {
            req.reject();
        }
    });
});
