var db = require('../fn/db');
var config = require('../config/config');

// Admin book page
exports.getListBook = (offset) => {
	var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.amount, b1.image FROM books AS b1, types AS t1, publishing_company AS p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countListBook = () => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT Id FROM books)`;
  return db.load(sql);
}

exports.getInfoBook = (id) => {
	var sql = `SELECT b1.id, b1.name, b1.price, b1.description, b1.origin, b1.type, b1.publishing_company, t1.nameType, p1.nameCompany, b1.amount, b1.image FROM books AS b1, types AS t1, publishing_company AS p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.id = '${id}'`;
	// var sql = `SELECT * FROM books WHERE id = '${id}'`;
	return db.load(sql);
}

exports.addBook = (namebook, price, description, origin, typebook, publishing_company, amount, image) => {
	var sql = `INSERT INTO books(name, price, views, sells, description, origin, type, publishing_company, amount, image) VALUES ('${namebook}', '${price}', '0', '0', '${description}', '${origin}', '${typebook}', '${publishing_company}', '${amount}', '${image}')`;
	return db.save(sql);
}

exports.editInfoBook = (id, name, price, description, origin, type, publishing_company, amount, image) => {
  var sql = `UPDATE books SET name = '${name}', price = '${price}', description = '${description}', origin = '${origin}', type = '${type}', publishing_company = '${publishing_company}', amount = '${amount}', image = '${image}' WHERE id = ${id}`;
  return db.save(sql);
}

exports.deleteBook = (id) => {
	var sql = `DELETE FROM books WHERE id = '${id}'`;
	return db.save(sql);
}

// Admin type page
exports.getAllTypes = () => {
	var sql = `SELECT * FROM types`;
	return db.load(sql);
}

exports.getTypesExceptOne = (id) => {
	var sql = `SELECT * FROM types WHERE id != ${id}`;
	return db.load(sql);
}

exports.getAllCompanys = () => {
	var sql = `SELECT * FROM publishing_company`;
	return db.load(sql);
}

exports.getCompanysExceptOne = (id) => {
	var sql = `SELECT * FROM publishing_company WHERE id != ${id}`;
	return db.load(sql);
}

exports.getListType = (offset) => {
	var sql = `SELECT * FROM types limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countListType = () => {
  var sql = `SELECT count(*) as total FROM types WHERE Id IN (SELECT Id FROM types)`;
  return db.load(sql);
}

exports.getType = (id) => {
	var sql = `SELECT * FROM types WHERE id = ${id}`;
	return db.load(sql);
}

exports.updateType = (id, nameType) => {
  var sql = `UPDATE types SET nameType = '${nameType}' WHERE id = ${id}`;
  return db.save(sql);
}

exports.addType = (Type) => {
	var sql = `INSERT INTO types(nameType) VALUES ('${Type}')`;
	return db.save(sql);
}

// Admin company page
exports.getListCompany = (offset) => {
	var sql = `SELECT * FROM publishing_company limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countListCompany = () => {
  var sql = `SELECT count(*) as total FROM publishing_company WHERE Id IN (SELECT Id FROM publishing_company)`;
  return db.load(sql);
}

exports.getCompany = (id) => {
	var sql = `SELECT * FROM publishing_company WHERE id = ${id}`;
	return db.load(sql);
}

exports.updateCompany = (id, nameCompany) => {
  var sql = `UPDATE publishing_company SET nameCompany = '${nameCompany}' WHERE id = ${id}`;
  return db.save(sql);
}

exports.addCompany = (Company) => {
	var sql = `INSERT INTO publishing_company(nameCompany) VALUES ('${Company}')`;
	return db.save(sql);
}

// Admin user page
exports.getListUser = (offset) => {
	var sql = `SELECT * FROM users WHERE permission != 1 limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countListUser = () => {
	var sql = `SELECT count(*) as total FROM users WHERE Id IN (SELECT Id FROM users WHERE permission != 1)`;
	return db.load(sql);
}

exports.deleteUser = (id) => {
	var sql = `DELETE FROM users WHERE id = '${id}'`;
	return db.save(sql);
}

// Admin order page
exports.getListOrders = (offset) => {
	var sql = `SELECT * FROM orders ORDER BY date DESC limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countListOrders = () => {
	var sql = `SELECT count(*) as total FROM orders WHERE Id IN (SELECT Id FROM orders)`;
	return db.load(sql);
}

exports.getOrder = (id) => {
	var sql = `SELECT * FROM orders WHERE id = ${id}`;
	return db.load(sql);
}

exports.updateStatusOrder = (id, status) => {
  var sql = `UPDATE orders SET status = '${status}' WHERE id = ${id}`;
  return db.save(sql);
}
