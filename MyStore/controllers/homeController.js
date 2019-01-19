var productRepo = require('../repos/productRepo');

router.get('/', (req, res) => {
    var p1 = productRepo.loadAllNews();
    var p2 = productRepo.loadAllSells();
    var p3 = productRepo.loadAllViews();
    var p4 = productRepo.loadAllTypes();
    var p5 = productRepo.loadAllCompanys();
    Promise.all([p1, p2, p3, p4, p5]).then(([p1Rows, p2Rows, p3Rows, p4Rows, p5Rows]) => {
        var Items = {
            newItems: p1Rows,
            sellItems: p2Rows,
            viewItems: p3Rows,
            types: p4Rows,
            companys: p5Rows,
            isLogged: req.session.isLogged,
            user: req.session.user
        };
        res.render('homepage', Items);
    });
});

module.exports = router;
