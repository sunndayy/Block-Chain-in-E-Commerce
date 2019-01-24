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
global.addressWalletStore = '1e095aff6eef007cb07577f0646e31b3756e6fe8d505462b477cdd273bc2243a';
global.message = null;
global.connectionBlockChain = null;

function ConnectCoreBlockChain() {
    var WebSocketClient = require('websocket').client;
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        global.connectionBlockChain = connection;
        console.log('Connect to E-Coin');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('Connection Closed');
            ConnectCoreBlockChain();
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                global.message = message;
                var data = JSON.parse(message.utf8Data);
                if (data.header == 'tx_result') {
                    console.log(data);
                    if (data.result == 'Thanh cong') {
                        // Lay id cua don hang
                        // Tim id cua user
                        // Tim connection cua user
                        // Gui thong bao
                        // Updatedb trang thai don hang da thanh toan
                    }
                    else {
                        if (data.result == 'Dang xu ly') {
                            //Update db
                        }
                        else {
                            // Send utf không thành công
                        }
                    }
                }
            }
        });
        connection.sendUTF(JSON.stringify({
            header: 'follow',
            pubKeyHash: global.addressWalletStore
        }));
    });

    client.connect('ws://eblockchain5.herokuapp.com');
}

ConnectCoreBlockChain();

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
    
            });
            connection.on("close", (reasonCode, description) => {
                var index = users[id].indexOf(connection);
                users[id].splice(index, 1);
                if (users[id].length == 0) {
                    delete users[id];
                }
            });
            // connection.sendUTF(id);
        } else {
            req.reject();
        }
    });
});
