var productRepo = require('../repos/productRepo');
var cartRepo = require('../repos/cartRepo');
var config = require('../config/config');
var sha256 = require('sha256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

router.get('/myCart/:id', (req, res) => {
  Id = req.params.id;
  var p = cartRepo.addToCart(Id);
  Promise.all([p]).then(([pRows]) => {
    var temp = 0;
    if (req.session.cart.length == 0) {
      req.session.cart.push(pRows[0]);
      req.session.cart[0].quantity = 1;
      temp = 1;
    }
    else {
      for (i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id == Id) {
          req.session.cart[i].quantity += 1;
          temp = 1;
          break;
        }
      }
    }
    if (temp == 0) {
      req.session.cart.push(pRows[0]);
      req.session.cart[req.session.cart.length - 1].quantity = 1;
    }
    res.redirect('/cart/myCart');
    Id = 0;
  });
});

router.get('/myCart', (req, res) => {
  var myCartPage = req.query.myCartPage;
  if (!myCartPage) {
    myCartPage = 1;
  }
  if (Id != 0 && req.query.addItemId) {
    var p = cartRepo.addToCart(Id);
    Promise.all([p]).then(([pRows]) => {
      var temp = 0;
      if (req.session.cart.length == 0) {
        req.session.cart.push(pRows[0]);
        req.session.cart[0].quantity = 1;
        temp = 1;
      }
      else {
        for (i = 0; i < req.session.cart.length; i++) {
          if (req.session.cart[i].id == Id) {
            req.session.cart[i].quantity += 1;
            temp = 1;
            break;
          }
        }
      }
      if (temp == 0) {
        req.session.cart.push(pRows[0]);
        req.session.cart[req.session.cart.length - 1].quantity = 1;
      }
      res.redirect('/cart/myCart');
      Id = 0;
    });
  }
  else if (req.query.rmItemId) {
    for (i = 0; i < req.session.cart.length; i++) {
      if (req.session.cart[i].id == req.query.rmItemId) {
        var index = req.session.cart.indexOf(req.session.cart[i]);
        req.session.cart.splice(index, 1);
        break;
      }
    }
    res.redirect('/cart/myCart');
  }
  else if (req.query.addItemId) {
    for (i = 0; i < req.session.cart.length; i++) {
      if (req.session.cart[i].id == req.query.addItemId) {
        req.session.cart[i].quantity += 1;
        break;
      }
    }
    res.redirect('/cart/myCart');
  }
  else if (req.query.subItemId) {
    for (i = 0; i < req.session.cart.length; i++) {
      if (req.session.cart[i].id == req.query.subItemId) {
        if (req.session.cart[i].quantity > 1) {
          req.session.cart[i].quantity -= 1;
          break;
        }
      }
    }
    res.redirect('/cart/myCart');
  }
  else {
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p1, p2]).then(([p1Rows, p2Rows]) => {
      var total = req.session.cart.length;
      var nPages = total / config.PRODUCTS_PER_CART_PAGE;
      if (total % config.PRODUCTS_PER_CART_PAGE > 0) {
        nPages++;
      }
      var numbers = [];
      for (i = 1; i <= nPages; i++) {
        numbers.push({
          value: i,
          isCurPage: i === parseInt(myCartPage)
        });
      }
      var Sum = 0;
      for (i = 0; i < req.session.cart.length; i++) {
        Sum = Sum + (req.session.cart[i].price * req.session.cart[i].quantity);
      }
      var Items = {
        items: req.session.cart.slice((config.PRODUCTS_PER_CART_PAGE * parseInt(myCartPage)) - config.PRODUCTS_PER_CART_PAGE, (config.PRODUCTS_PER_CART_PAGE * parseInt(myCartPage))),
        page_numbers: numbers,
        isLogged: req.session.isLogged,
        price: Sum,
        types: p1Rows,
        companys: p2Rows,
        user: req.session.user
      };
      res.render('cart/myCart', Items);
    });
  }
});

router.get('/myCartPage', (req, res) => {
  var myCartPage = req.query.myCartPage;
  if (!myCartPage) {
    myCartPage = 1;
  }
  var p1 = productRepo.loadAllTypes();
  var p2 = productRepo.loadAllCompanys();
  Promise.all([p1, p2]).then(([p1Rows, p2Rows]) => {
    var total = req.session.cart.length;
    var nPages = 0;
    if (total % config.PRODUCTS_PER_CART_PAGE > 0) {
      nPages = parseInt(total / config.PRODUCTS_PER_CART_PAGE) + 1;
    }
    var numbers = [];
    for (i = 1; i <= nPages; i++) {
      numbers.push({
        value: i,
        isCurPage: i === parseInt(myCartPage)
      });
    }
    var Items = {
      items: req.session.cart.slice((config.PRODUCTS_PER_CART_PAGE * parseInt(myCartPage)) - config.PRODUCTS_PER_CART_PAGE, (config.PRODUCTS_PER_CART_PAGE * parseInt(myCartPage))),
      page_numbers: numbers,
      types: p1Rows,
      companys: p2Rows
    };
    res.render('cart/myCart_products', Items);
  });
});

router.get('/payForm', (req, res) => {
  res.render('cart/payForm');
});

router.post('/cart', function(req, res) {
  var p1 = cartRepo.createOrder(req.session.user.id);
  Promise.all([p1]).then(([p1Rows]) => {
    var p2 = cartRepo.getLastOrderId(req.session.user.id);

    var privKey = req.body.privKey;
    var key = ec.keyFromPrivate(privKey, 'hex');
    var pubKey = key.getPublic('hex');
    var pubKeyHash = sha256(pubKey);
    var utxos;
    var totalMoney = 0;
    var totalInput = 0;
    var txIns = [], txOuts;
    var senderSign;

    connection.sendUTF(JSON.stringify({
      header: 'get_utxos',
      pubKeyHash: pubKeyHash
    }));

    var triggerMessage;

    triggerMessage = setInterval(function () {
      if (message != null && message.type === 'utf8') {
        utxos = JSON.parse(message.utf8Data)['utxos'];
        message = null;
        clearInterval(triggerMessage);
      }
    }, 100);


    Promise.all([p2]).then(([p2Rows]) => {
      for (i = 0; i < req.session.cart.length; i++) {
        totalMoney += req.session.cart[i].price * req.session.cart[i].quantity;
        var p3 = cartRepo.insertOrderItem(p2Rows[0].id, req.session.cart[i].id, req.session.cart[i].quantity, req.session.cart[i].price * req.session.cart[i].quantity);
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

      for (var k = 0; k < utxos.length; k++) {
        if (!utxos[k].isLocked) {
          totalInput += utxos[k].money;
          txIns.push({
            preHashTx: utxos[k].preHashTx,
            outputIndex: utxos[k].outputIndex
          });
          if (totalInput > totalMoney * rate * 1.01) {
            break;
          }
        }
      }

      txOuts = [{
        pubKeyHash: addressWallet,
        money: totalMoney * rate * 1.01,
        isLocked: false
      }];

      senderSign = {
        message: {
          txIns: txIns,
          txOuts: txOuts,
          message: p2Rows[0].id
        },
        pubKey: pubKey,
        signature: key.sign(sha256(JSON.stringify({
          txIns: txIns,
          txOuts: txOuts,
          message: p2Rows[0].id
        }), { asBytes: true }))
      };

      console.log(JSON.stringify({
        header: 'tx',
        tx: {
          txIns: txIns,
          txOuts: txOuts,
          message: p2Rows[0].id,
          senderSign: senderSign,
        }
      }));

      connection.sendUTF(JSON.stringify({
        header: 'tx',
        tx: {
          txIns: txIns,
          txOuts: txOuts,
          message: p2Rows[0].id,
          senderSign: senderSign,
        }
      }));


      req.session.cart = [];
      res.redirect('/');
    });
  });
});

router.get('/viewHistory', (req, res) => {
  var historyPage = 1;
  var offset = (historyPage - 1) * config.ORDERS_PER_PAGE;
  var p = cartRepo.getOrders(req.session.user.id, offset);
  var countP = cartRepo.countOrders(req.session.user.id);
  var p1 = productRepo.loadAllTypes();
  var p2 = productRepo.loadAllCompanys();
  Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
    if (countPRows.length == 0) {
      var total = 0;
    }
    else {
      var total = countPRows[0].total;
    }
    var nPages = total / config.ORDERS_PER_PAGE;
    if (total % config.ORDERS_PER_PAGE > 0) {
      nPages++;
    }
    var numbers = [];
    for (i = 1; i <= nPages; i++) {
      numbers.push({
        value: i,
        isCurPage: i === parseInt(historyPage)
      });
    }
    var Items = {
      isLogged: req.session.isLogged,
      user: req.session.user,
      page_numbers: numbers,
      types: p1Rows,
      companys: p2Rows,
      items: pRows
    };
    res.render('cart/history', Items);
  });
});

router.get('/viewHistory/page', (req, res) => {
  var historyPage = req.query.historyPage;
  if (!historyPage) {
    historyPage = 1;
  }
  var offset = (historyPage - 1) * config.ORDERS_PER_PAGE;
  var p = cartRepo.getOrders(req.session.user.id, offset);
  var countP = cartRepo.countOrders(req.session.user.id);
  var p1 = productRepo.loadAllTypes();
  var p2 = productRepo.loadAllCompanys();
  Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
    var total = countPRows[0].total;
    var nPages = total / config.ORDERS_PER_PAGE;
    if (total % config.ORDERS_PER_PAGE > 0) {
      nPages++;
    }
    var numbers = [];
    for (i = 1; i <= nPages; i++) {
      numbers.push({
        value: i,
        isCurPage: i === parseInt(historyPage)
      });
    }
    var Items = {
      isLogged: req.session.isLogged,
      user: req.session.user,
      page_numbers: numbers,
      types: p1Rows,
      companys: p2Rows,
      items: pRows
    };
    res.render('cart/orders', Items);
  });
});

router.get('/viewDetailHistory/:id', (req, res) => {
  var p = cartRepo.loadDetails(req.params.id);
  var p1 = productRepo.loadAllTypes();
  var p2 = productRepo.loadAllCompanys();
  Promise.all([p, p1, p2]).then(([pRows, p1Rows, p2Rows]) => {
    var Items = {
      isLogged: req.session.isLogged,
      user: req.session.user,
      types: p1Rows,
      companys: p2Rows,
      items: pRows
    };
    res.render('cart/detailHistory', Items);
  });
});

module.exports = router;
