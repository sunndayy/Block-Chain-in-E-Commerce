var productRepo = require('../repos/productRepo');
var cartRepo = require('../repos/cartRepo');
var config = require('../config/config');

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
  req.session.cart = [];
  res.redirect('/');
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
