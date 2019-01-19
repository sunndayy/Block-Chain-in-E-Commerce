var db = require('../fn/db');
var config = require('../config/config');

// Cart Page
exports.addToCart = (Id) => {
  var sql = `SELECT b1.id, b1.name, b1.price, b1.views, b1.sells, b1.description, b1.origin, t1.nameType, p1.nameCompany, b1.image FROM books AS b1, types AS t1, publishing_company as p1 WHERE b1.type = t1.id AND b1.publishing_company = p1.id AND b1.id = ${Id}`;
  return db.load(sql);
}

// Payment
exports.getBookId = (Order_Id) => {
	var sql = `SELECT product_id, quantity FROM order_items WHERE order_id = ${Order_Id}`;
	return db.load(sql);
}

exports.updateQuantity = (Book_Id, quantity) => {
	var sql = `UPDATE books SET amount = amount - ${quantity}, sells = sells + ${quantity} WHERE id = ${Book_Id}`;
	return db.save(sql);
}

exports.createOrder = (User_Id) => {
	var sql = `INSERT INTO orders (user_id, status, payStatus) VALUES (${User_Id}, 'Chưa giao', 'Chưa thanh toán')`;
	return db.save(sql);
}

exports.getLastOrderId = (User_Id) => {
	var sql = `SELECT id FROM orders WHERE user_id = ${User_Id} ORDER BY date DESC LIMIT 1`;
	return db.load(sql);
}

exports.getOrders = (User_Id, offset) => {
	var sql = `SELECT orders.id, orders.date, orders.status, orders.payStatus, SUM(order_items.sum_price) as price, SUM(order_items.quantity) as amount FROM orders INNER JOIN order_items ON orders.id = order_items.order_id WHERE orders.user_id = ${User_Id} GROUP BY orders.id ORDER BY date DESC limit ${config.ORDERS_PER_PAGE} offset ${offset}`;
	return db.load(sql);
}

exports.countOrders = (User_Id) => {
	var sql = `SELECT count(*) as total FROM orders GROUP BY user_id HAVING user_id = ${User_Id}`;
	return db.load(sql);
}

exports.insertOrderItem = (Order_Id, Product_Id, Quantity, Sum_Price) => {
	var sql = `INSERT INTO order_items (order_id, product_id, quantity, sum_price) VALUES (${Order_Id}, ${Product_Id}, ${Quantity}, ${Sum_Price})`;
	return db.save(sql);
}

exports.loadDetails = (Order_Id) => {
	var sql = `SELECT books.id, books.image, books.name, books.price, order_items.quantity, orders.status, orders.payStatus, orders.date FROM books INNER JOIN order_items ON books.id = order_items.product_id INNER JOIN orders ON orders.id = order_items.order_id WHERE order_id = ${Order_Id}`;
	return db.load(sql);
}

exports.updatePayStatus = (Order_Id) => {
	var sql = `UPDATE orders SET payStatus = 'Đã thanh toán' WHERE id = ${Order_Id}`;
	return db.save(sql);
}
