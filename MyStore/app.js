global.express = require('express');

global.session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

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

router.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

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
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    connection.sendUTF(JSON.stringify({
      header: 'get_balance',
      pubKeyHash: '98f6c0a37f90e594536eb6b2dc5b45c609f35493c40a749ffc2c1a024903e76b'
    }));
});

client.connect('ws://eblockchain5.herokuapp.com');




var app = express();

app.use(cookieParser());

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

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

app.listen(process.env.PORT || 3000);
