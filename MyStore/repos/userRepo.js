var db = require('../fn/db');
var config = require('../config/config');

exports.insertNewUser = (firstname, lastname, email, password, birthday, gender) => {
	var sql = `INSERT INTO users (firstname, lastname, email, password, birthday, gender, permission) VALUES ('${firstname}', '${lastname}', '${email}', '${password}', STR_TO_DATE('${birthday}', '%m/%d/%Y'), '${gender}', 0)`;
	return db.save(sql);
}

exports.editUser = (id, firstname, lastname, email, birthday, gender) => {
	var sql = `UPDATE users SET firstname = '${firstname}', lastname = '${lastname}', email = '${email}', birthday = STR_TO_DATE('${birthday}', '%m/%d/%Y'), gender = '${gender}' WHERE id = '${id}'`;
	return db.save(sql);
}

exports.getInfo = (id) => {
	var sql = `SELECT * FROM users WHERE id = '${id}'`;
	return db.load(sql);
}

exports.checkAccount = (email, password) => {
	var sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
	return db.load(sql);
}
