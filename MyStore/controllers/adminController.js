var adminRepo = require('../repos/adminRepo');
var config = require('../config/config');

// View list books
router.get('/books', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = 1;
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListBook(offset);
        var countP = adminRepo.countListBook();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                page_numbers: numbers,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminBookPage', Items);
        });
    }
});

router.get('/adminBookPage', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = req.query.page;
        if (!page) {
            page = 1;
        }
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListBook(offset);
        var countP = adminRepo.countListBook();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user,
                page_numbers: numbers
            };
            res.render('admin/books', Items);
        });
    }
});

// View list type
router.get('/admin/types', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = 1;
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListType(offset);
        var countP = adminRepo.countListType();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                page_numbers: numbers,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminTypePage', Items);
        });
    }
});

router.get('/admin/adminTypePage', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = req.query.page;
        if (!page) {
            page = 1;
        }
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListType(offset);
        var countP = adminRepo.countListType();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user,
                page_numbers: numbers
            };
            res.render('admin/types', Items);
        });
    }
});

// View list company
router.get('/admin/companys', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = 1;
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListCompany(offset);
        var countP = adminRepo.countListCompany();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                page_numbers: numbers,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminCompanyPage', Items);
        });
    }
});

router.get('/admin/adminCompanyPage', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = req.query.page;
        if (!page) {
            page = 1;
        }
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListCompany(offset);
        var countP = adminRepo.countListCompany();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user,
                page_numbers: numbers
            };
            res.render('admin/companys', Items);
        });
    }
});

// View list users
router.get('/users', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = 1;
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListUser(offset);
        var countP = adminRepo.countListUser();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                page_numbers: numbers,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminUserPage', Items);
        });
    }
});

router.get('/adminUserPage', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = req.query.page;
        if (!page) {
            page = 1;
        }
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListUser(offset);
        var countP = adminRepo.countListUser();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user,
                page_numbers: numbers
            };
            res.render('admin/users', Items);
        });
    }
});

// View list orders
router.get('/orders', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = 1;
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListOrders(offset);
        var countP = adminRepo.countListOrders();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                page_numbers: numbers,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminOrderPage', Items);
        });
    }
});

router.get('/adminOrderPage', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var page = req.query.page;
        if (!page) {
            page = 1;
        }
        var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
        var p = adminRepo.getListOrders(offset);
        var countP = adminRepo.countListOrders();
        Promise.all([p, countP]).then(([pRows, countPRows]) => {
            var total = countPRows[0].total;
            var nPages = total / config.PRODUCTS_PER_PAGE;
            if (total % config.PRODUCTS_PER_PAGE > 0) {
                nPages++;
            }
            var numbers = [];
            for (i = 1; i <= nPages; i++) {
                numbers.push({
                    value: i,
                    isCurPage: i === parseInt(page)
                });
            }
            var Items = {
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user,
                page_numbers: numbers
            };
            res.render('admin/orders', Items);
        });
    }
});

// Update books
var bookID;
router.get('/updateBook/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        bookID = req.params.id;
        var p = adminRepo.getInfoBook(bookID);
        var p1 = adminRepo.getAllTypes();
        var p2 = adminRepo.getAllCompanys();
        Promise.all([p, p1, p2]).then(([pRows, p1Rows, p2Rows]) => {
            var Items = {
                items: pRows,
                types: p1Rows,
                companys: p2Rows
            };
            res.render('admin/update_book_form', Items);
        });
    }
});

router.post('/updateBook', function(req, res) {
  var name = req.body.namebook;
  var price = req.body.price;
  var description = req.body.description;
  var origin = req.body.origin;
  var type = req.body.typebook;
  var publishing_company = req.body.publishing_company;
  var amount = req.body.amount;
  var image = req.body.image;
  var p = adminRepo.editInfoBook(bookID, name, price, description, origin, type, publishing_company, amount, image);
  Promise.all([p]).then(([pRows]) => {
    res.redirect('/admin/books');
  });
});

// Delete books
router.get('/delBook/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var p = adminRepo.deleteBook(req.params.id);
        Promise.all([p]).then(([pRows]) => {
            res.redirect('/admin/books');
        });
    }
});

// Add books
router.get('/addBook', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var p1 = adminRepo.getAllTypes();
        var p2 = adminRepo.getAllCompanys();
        Promise.all([p1, p2]).then(([p1Rows, p2Rows]) => {
            var Items = {
                types: p1Rows,
                companys: p2Rows
            };
            res.render('admin/new_book_form', Items);
        });
    }
});

router.post('/addBook', function(req, res) {
    var name = req.body.namebook;
    var price = req.body.price;
    var description = req.body.description;
    var origin = req.body.origin;
    var type = req.body.typebook;
    var publishing_company = req.body.publishing_company;
    var amount = req.body.amount;
    var image = req.body.image;
    var p = adminRepo.addBook(name, price, description, origin, type, publishing_company, amount, image);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/books');
    });
});

// Add types
router.get('/addType', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        res.render('admin/new_type_form');
    }
});

router.post('/addType', function(req, res) {
    var name = req.body.nametype;
    var p = adminRepo.addType(name);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/types');
    });
});

// Add companys
router.get('/addCompany', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        res.render('admin/new_company_form');
    }
});

router.post('/addCompany', function(req, res) {
    var name = req.body.namecompany;
    var p = adminRepo.addCompany(name);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/companys');
    });
});

// Delete users
router.get('/delUser/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        var p = adminRepo.deleteUser(req.params.id);
        Promise.all([p]).then(([pRows]) => {
            res.redirect('/admin/users');
        });
    }
});

// Update status orders
var OrderID;
router.get('/updateOrder/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        OrderID = req.params.id;
        var p = adminRepo.getOrder(OrderID);
        Promise.all([p]).then(([pRows]) => {
            var Items = {
                updateOrderID: OrderID,
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminOrderPage', Items);
        });
    }
});

router.post('/updateStatus', function(req, res) {
    var status = req.body.status;
    var p = adminRepo.updateStatusOrder(OrderID, status);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/orders');
    });
});

// Update types
var TypeID;
router.get('/updateType/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        TypeID = req.params.id;
        var p = adminRepo.getType(TypeID);
        Promise.all([p]).then(([pRows]) => {
            var Items = {
                updateTypeID: TypeID,
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminTypePage', Items);
        });
    }
});

router.post('/updateType', function(req, res) {
    var nameType = req.body.nameType;
    var p = adminRepo.updateType(TypeID, nameType);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/types');
    });
});

// Update companys
var CompanyID;
router.get('/updateCompany/:id', (req, res) => {
    if (req.session.user.permission == 0) {
        res.redirect('/');
    }
    else {
        CompanyID = req.params.id;
        var p = adminRepo.getCompany(CompanyID);
        Promise.all([p]).then(([pRows]) => {
            var Items = {
                updateCompanyID: CompanyID,
                items: pRows,
                isLogged: req.session.isLogged,
                user: req.session.user
            };
            res.render('admin/adminCompanyPage', Items);
        });
    }
});

router.post('/updateCompany', function(req, res) {
    var nameCompany = req.body.nameCompany;
    var p = adminRepo.updateCompany(CompanyID, nameCompany);
    Promise.all([p]).then(([pRows]) => {
        res.redirect('/admin/companys');
    });
});

module.exports = router;
