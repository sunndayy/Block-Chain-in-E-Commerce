var productRepo = require('../repos/productRepo');
var config = require('../config/config');

// Details Page
router.get('/details/:id', (req, res) => {
    Id = req.params.id;
    var p1 = productRepo.loadDetails(Id);
    var p2 = productRepo.loadSameTypes(Id);
    var p3 = productRepo.loadSameCompanys(Id);
    var p4 = productRepo.loadAllTypes();
    var p5 = productRepo.loadAllCompanys();
    Promise.all([p1, p2, p3, p4, p5]).then(([p1Rows, p2Rows, p3Rows, p4Rows, p5Rows]) => {
        var Items = {
            items: p1Rows,
            sameTypes: p2Rows,
            sameCompanys: p3Rows,
            types: p4Rows,
            companys: p5Rows,
            isLogged: req.session.isLogged,
            user: req.session.user
        };
        res.render('products/details', Items);
    });
});

// Type Page
var Type;
router.get('/types/:type', (req, res) => {
    Type = req.params.type;
    var typePage = 1;
    var offset = (typePage - 1) * config.PRODUCTS_PER_PAGE;
    var p = productRepo.loadByTypes(Type, offset);
    var countP = productRepo.countTypes(Type);
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
        var total = countPRows[0].total;
        var nPages = total / config.PRODUCTS_PER_PAGE;
        if (total % config.PRODUCTS_PER_PAGE > 0) {
            nPages++;
        }
        var numbers = [];
        for (i = 1; i <= nPages; i++) {
            numbers.push({
                value: i,
                isCurPage: i === parseInt(typePage)
            });
        }
        var Items = {
            typeBook: Type,
            items: pRows,
            types: p1Rows,
            companys: p2Rows,
            page_numbers: numbers,
            isLogged: req.session.isLogged,
            user: req.session.user
        };
        res.render('products/types/type_page', Items);
    });
});

router.get('/types', (req, res) => {
    var typePage = req.query.typePage;
    if (!typePage) {
        typePage = 1;
    }
    var offset = (typePage - 1) * config.PRODUCTS_PER_PAGE;
    var p = productRepo.loadByTypes(Type, offset);
    var countP = productRepo.countTypes(Type);
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
        var total = countPRows[0].total;
        var nPages = total / config.PRODUCTS_PER_PAGE;
        if (total % config.PRODUCTS_PER_PAGE > 0) {
            nPages++;
        }
        var numbers = [];
        for (i = 1; i <= nPages; i++) {
            numbers.push({
                value: i,
                isCurPage: i === parseInt(typePage)
            });
        }
        var Items = {
            typeBook: Type,
            items: pRows,
            types: p1Rows,
            companys: p2Rows,
            isLogged: req.session.isLogged,
            user: req.session.user,
            page_numbers: numbers
        };
        res.render('products/types/type_products', Items);
    });
});

// Publishing Company Page
var Company;
router.get('/publishing_companys/:publishing_company', (req, res) => {
    Company = req.params.publishing_company;
    var companyPage = 1;
    var offset = (companyPage - 1) * config.PRODUCTS_PER_PAGE;
    var p = productRepo.loadByCompanys(Company, offset);
    var countP = productRepo.countCompanys(Company);
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
        var total = countPRows[0].total;
        var nPages = total / config.PRODUCTS_PER_PAGE;
        if (total % config.PRODUCTS_PER_PAGE > 0) {
            nPages++;
        }
        var numbers = [];
        for (i = 1; i <= nPages; i++) {
            numbers.push({
                value: i,
                isCurPage: i === parseInt(companyPage)
            });
        }
        var Items = {
            companyBook: Company,
            items: pRows,
            types: p1Rows,
            companys: p2Rows,
            page_numbers: numbers,
            isLogged: req.session.isLogged,
            user: req.session.user
        };
        res.render('products/publishing_companys/publishing_company_page', Items);
    });
});

router.get('/publishing_companys', (req, res) => {
    var companyPage = req.query.companyPage;
    if (!companyPage) {
        companyPage = 1;
    }
    var offset = (companyPage - 1) * config.PRODUCTS_PER_PAGE;
    var p = productRepo.loadByCompanys(Company, offset);
    var countP = productRepo.countCompanys(Company);
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
        var total = countPRows[0].total;
        var nPages = total / config.PRODUCTS_PER_PAGE;
        if (total % config.PRODUCTS_PER_PAGE > 0) {
            nPages++;
        }
        var numbers = [];
        for (i = 1; i <= nPages; i++) {
            numbers.push({
                value: i,
                isCurPage: i === parseInt(companyPage)
            });
        }
        var Items = {
            companyBook: Company,
            items: pRows,
            types: p1Rows,
            companys: p2Rows,
            isLogged: req.session.isLogged,
            user: req.session.user,
            page_numbers: numbers
        };
        res.render('products/publishing_companys/publishing_company_products', Items);
    });
});

// Search Page
var searchKey;
var searchType;
router.post('/searchs/search_page', (req, res) => {
    searchKey = req.body.keyword;
    searchType = req.body.typeSearch;
    res.redirect('/products/searchs/search_page');
});

router.get('/searchs/search_page', (req, res) => {
    var page = 1;
    var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
    if (searchType == 1){
        var p = productRepo.searchProductByName(searchKey, offset);
        var countP = productRepo.countSearchProductsByName(searchKey);
    }

    if (searchType == 2){
        var p = productRepo.searchProductByType(searchKey, offset);
        var countP = productRepo.countSearchProductsByType(searchKey);
    }

    if (searchType == 3){
        var p = productRepo.searchProductByCompany(searchKey, offset);
        var countP = productRepo.countSearchProductsByCompany(searchKey);
    }
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
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
            types: p1Rows,
            companys: p2Rows,
            page_numbers: numbers,
            isLogged: req.session.isLogged,
            user: req.session.user
        };
        res.render('products/searchs/search_page', Items);
    });
});

router.get('/searchs/searchPage', (req, res) => {
    var page = req.query.page;
    if (!page) {
        page = 1;
    }
    var offset = (page - 1) * config.PRODUCTS_PER_PAGE;
    if (searchType == 1){
        var p = productRepo.searchProductByName(searchKey, offset);
        var countP = productRepo.countSearchProductsByName(searchKey);
    }

    if (searchType == 2){
        var p = productRepo.searchProductByType(searchKey, offset);
        var countP = productRepo.countSearchProductsByType(searchKey);
    }

    if (searchType == 3){
        var p = productRepo.searchProductByCompany(searchKey, offset);
        var countP = productRepo.countSearchProductsByCompany(searchKey);
    }
    var p1 = productRepo.loadAllTypes();
    var p2 = productRepo.loadAllCompanys();
    Promise.all([p, countP, p1, p2]).then(([pRows, countPRows, p1Rows, p2Rows]) => {
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
            types: p1Rows,
            companys: p2Rows,
            isLogged: req.session.isLogged,
            user: req.session.user,
            page_numbers: numbers
        };
        res.render('products/searchs/search_products', Items);
    });
});

module.exports = router;
