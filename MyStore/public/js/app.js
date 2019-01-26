$(document).ready(function() {
  var ws = new WebSocket("ws://bookshopping.herokuapp.com");
  ws.onopen = function(evt) {
    console.log("Đã kết nối đến bookshopping");
  };
  ws.onmessage = function(evt) {
    alert(evt.data);
  };
  ws.onerror = function(evt) {
    console.log(evt);
  };
  ws.onclose = function(evt) {
    console.log("Đã đóng kết nối đến bookshopping");
  };

  $('.view_more').click(function(event) {
    event.preventDefault();
    $(this).addClass('hide');
    var id = $(this).attr('href');
    $(id).removeClass('hide');
  });

  $('.type_page_number').click(".type_book", function(event) {
    event.preventDefault();
    $('.type_active_page').removeClass('type_active_page');
    var id = $(this).attr('href');
    $('.type_book').load(id);
    $(this).addClass('type_active_page');
  });

  $('.company_page_number').click(".company_book", function(event) {
    event.preventDefault();
    $('.company_active_page').removeClass('company_active_page');
    var id = $(this).attr('href');
    $('.company_book').load(id);
    $(this).addClass('company_active_page');
  });

  $('.search_page_number').click(".search_book", function(event) {
    event.preventDefault();
    $('.search_active_page').removeClass('search_active_page');
    var id = $(this).attr('href');
    $('.search_book').load(id);
    $(this).addClass('search_active_page');
  });

  $('.admin_page_number').click(".admin_list_book", function(event) {
    event.preventDefault();
    $('.admin_active_page').removeClass('admin_active_page');
    var id = $(this).attr('href');
    $('.admin_list_book').load(id);
    $(this).addClass('admin_active_page');
  });

  $('.admin_user_page_number').click(".admin_list_user", function(event) {
    event.preventDefault();
    $('.admin_active_user_page').removeClass('admin_active_user_page');
    var id = $(this).attr('href');
    $('.admin_list_user').load(id);
    $(this).addClass('admin_active_user_page');
  });

  $('.admin_type_page_number').click(".admin_list_type", function(event) {
    event.preventDefault();
    $('.admin_active_type_page').removeClass('admin_active_type_page');
    var id = $(this).attr('href');
    $('.admin_list_type').load(id);
    $(this).addClass('admin_active_type_page');
  });

  $('.admin_company_page_number').click(".admin_list_company", function(event) {
    event.preventDefault();
    $('.admin_active_company_page').removeClass('admin_active_company_page');
    var id = $(this).attr('href');
    $('.admin_list_company').load(id);
    $(this).addClass('admin_active_company_page');
  });

  $('.admin_order_page_number').click(".admin_list_order", function(event) {
    event.preventDefault();
    $('.admin_active_order_page').removeClass('admin_active_order_page');
    var id = $(this).attr('href');
    $('.admin_list_order').load(id);
    $(this).addClass('admin_active_order_page');
  });

  $('.cart_page_number').click(".cart_book", function(event) {
    event.preventDefault();
    $('.cart_active_page').removeClass('cart_active_page');
    var id = $(this).attr('href');
    $('.cart_book').load(id);
    $(this).addClass('cart_active_page');
  });

  $('.history_page_number').click(".history-page", function(event) {
    event.preventDefault();
    $('.history_active_page').removeClass('history_active_page');
    var id = $(this).attr('href');
    $('.history-page').load(id);
    $(this).addClass('history_active_page');
  });
});
