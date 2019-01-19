var db = require('../fn/db');
var config = require('../config/config');

// Home Page
exports.loadAllTypes = () => {
  var sql = `SELECT nameType FROM types`;
  return db.load(sql);
}

exports.loadAllCompanys = () => {
  var sql = `SELECT nameCompany FROM publishing_company`;
  return db.load(sql);
}

exports.loadAllNews = () => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id ORDER BY b1.date DESC limit ${config.PRODUCTS_PER_PAGE}`;
  return db.load(sql);
}

exports.loadAllSells = () => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id ORDER BY b1.sells DESC limit ${config.PRODUCTS_PER_PAGE}`;
  return db.load(sql);
}

exports.loadAllViews = () => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id ORDER BY b1.views DESC limit ${config.PRODUCTS_PER_PAGE}`;
  return db.load(sql);
}

// Details Page
exports.loadDetails = (Id) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.id = ${Id}`;
  return db.load(sql);
}

exports.loadSameTypes = (Id) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.id != ${Id} AND b1.type = (SELECT type FROM books WHERE id = ${Id}) limit ${config.PRODUCTS_PER_DETAILS_PAGE}`;
  return db.load(sql);
}

exports.loadSameCompanys = (Id) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.id != ${Id} AND b1.publishing_company = (SELECT publishing_company FROM books WHERE id = ${Id}) limit ${config.PRODUCTS_PER_DETAILS_PAGE}`;
  return db.load(sql);
}

// Search Page
exports.searchProductByName = (searchKey, offset) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.name LIKE '%${searchKey}%' limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
  return db.load(sql);
}

exports.countSearchProductsByName = (searchKey) => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT Id FROM books WHERE name LIKE '%${searchKey}%')`;
  return db.load(sql);
}

exports.searchProductByType = (searchKey, offset) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND t1.nameType LIKE '%${searchKey}%' limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
  return db.load(sql);
}

exports.countSearchProductsByType = (searchKey) => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT b1.Id FROM books as b1, types as t1 WHERE b1.type = t1.id AND t1.nameType LIKE '%${searchKey}%')`;
  return db.load(sql);
}

exports.searchProductByCompany = (searchKey, offset) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND p1.nameCompany LIKE '%${searchKey}%' limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
  return db.load(sql);
}

exports.countSearchProductsByCompany = (searchKey) => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT b1.Id FROM books as b1, publishing_company as p1 WHERE b1.publishing_company = p1.id AND p1.nameCompany LIKE '%${searchKey}%')`;
  return db.load(sql);
}

// Type Page --------------------------------------------
exports.loadByTypes = (Type, offset) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND t1.nameType = '${Type}' limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
  return db.load(sql);
}

exports.countTypes = (Type) => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT b1.id FROM books AS b1, types AS t1 WHERE b1.type = t1.id AND t1.nameType = '${Type}')`;
  return db.load(sql);
}

// Publishing Company Page -----------------------------------
exports.loadByCompanys = (Company, offset) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND p1.nameCompany = '${Company}' limit ${config.PRODUCTS_PER_PAGE} offset ${offset}`;
  return db.load(sql);
}

exports.countCompanys = (Company) => {
  var sql = `SELECT count(*) as total FROM books WHERE Id IN (SELECT b1.Id FROM books AS b1, publishing_company AS p1 WHERE b1.publishing_company = p1.id AND p1.nameCompany = '${Company}')`;
  return db.load(sql);
}
