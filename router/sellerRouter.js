// libraries
const express = require("express");
//const marked = require('marked');

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_Seller = require("../Database/DB-seller-api");
const crypto = require("crypto");
const { count } = require("console");

//helu, port testing
router.post("/seller_products", async (req, res) => {


  let user = JSON.parse(req.body.user_info);

  let products = await DB_Seller.getAllProducts(req.body.category, user.user_name);
  console.log(products)
  console.log(req.body.category);
  console.log(user.user_name);

  res.render("seller_products.ejs", { value: products, user: user });
});

router.post("/seller_item", async (req, res) => {

  let result1 = await DB_Seller.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);

  res.render("seller_item.ejs", {
    value: result1[0], user: user
  });

});

router.post("/seller_search", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;

  let products = await DB_Seller.getAllProductsByTag(tag.toUpperCase(), user.user_name);




  res.render("seller_search.ejs", { value: products, tag: tag, user: user });

});

router.post("/seller_logged_in", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let categories = await DB_Seller.getAllCategories(user.user_name);

  res.render("seller_logged_in.ejs", {
    value: categories,
    user: user
  });
});
//dvsfff
module.exports = router;