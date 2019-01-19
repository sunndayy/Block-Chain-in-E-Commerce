var userRepo = require('../repos/userRepo');
var md5 = require('md5');

router.get('/signUp', (req, res) => {
	res.render('users/signUp');
});

router.get('/logIn', (req, res) => {
	res.render('users/logIn');
});

router.get('/editInfo', (req, res) => {
  var id = req.session.user.id;
  var p = userRepo.getInfo(id);
  Promise.all([p]).then(([pRows]) => {
    var Items = {
      user: pRows
    };
    res.render('users/editInfo', Items);
  });
});

router.post('/signUp', function(req, res) {
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var pwd = md5(req.body.password);
	var birthday = req.body.month + '/' + req.body.day + '/' + req.body.year;
	var gender = req.body.gender;
  var p = userRepo.insertNewUser(firstname, lastname, email, pwd, birthday, gender);
  Promise.all([p]).then(([pRows]) => {
  	res.render('users/logIn', {message: "Sign Up Successfully!"});
  });
});

router.post('/editInfo', function(req, res) {
  var id = req.session.user.id;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var birthday = req.body.month + '/' + req.body.day + '/' + req.body.year;
  var gender = req.body.gender;
  var p = userRepo.editUser(id, firstname, lastname, email, birthday, gender);
  Promise.all([p]).then(([pRows]) => {
    res.render('users/logIn', {message: "Edit Info Successfully!"});
  });
});

router.post('/logIn', function(req, res) {
  if(!req.body.email || !req.body.password) {
    res.render('users/logIn', {message: "Please enter both id and password!"});
  } else {
    var p = userRepo.checkAccount(req.body.email, md5(req.body.password));
    Promise.all([p]).then(([pRows]) => {
      if (pRows.length > 0) {
        req.session.isLogged = true;
        req.session.user = pRows[0];
        req.session.cart = [];
        if (pRows[0].permission == 1) {
          res.redirect('/admin/books');
        }
        else {
          res.redirect('/');
        }
      }
      else {
        res.render('users/logIn', {message: "Login Failed!"});
      }
    });
  }
});

router.get('/logOut', (req, res) => {
  req.session.destroy(function() {
    console.log("Logged Out!");
  });
  res.redirect('/');
});

module.exports = router;
