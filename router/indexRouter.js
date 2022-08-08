// libraries
const express = require("express");
//const marked = require('marked');

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_Seller = require("../Database/DB-seller-api");
const crypto = require("crypto");
const { count } = require("console");


//let person_id;
//let USER_NAME = null;

let CART_ID = null;

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/sign_up", (req, res) => {
  res.render("sign_up.ejs");
});

router.post("/seller_products", async (req, res) => {

  
  let user = JSON.parse(req.body.user_info);

  let products = await DB_Seller.getAllProducts(req.body.category , user.user_name);
  console.log(products)
  console.log(req.body.category);
  console.log(user.user_name);

  res.render("seller_products.ejs", { value: products, user: user });
});

router.post("/products", async (req, res) => {
  let products = await DB_Buyer.getAllProducts(req.body.category);

  console.log(products)

  let user = JSON.parse(req.body.user_info);

  res.render("products.ejs", { value: products, user: user });
});

router.post("/item", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);

  res.render("item.ejs", {
    value: result1[0], user: user
  });

});
router.post("/seller_item", async (req, res) => {

  let result1 = await DB_Seller.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);

  res.render("seller_item.ejs", {
    value: result1[0], user: user
  });

});

router.post("/item/cart", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let result = JSON.parse(req.body.product);

  let product_id = result.PRODUCT_ID;

  let isInCart = await DB_Buyer.isInCart(user.person_id, product_id);

  let quantity = req.body.quantity;

  let buttonPressed = req.body.butt;


  if (buttonPressed == 1) {
    if (isInCart[0].COUNT === 0 && quantity > 0) {
      await DB_Buyer.addToCart(user.person_id, product_id, quantity, null);

    } else if (quantity == 0) {
      console.log("give valid quantity");
    } else {
      console.log("Already Added");
    }

  }
  else if (buttonPressed == 2) {
    console.log("butt2"); ///wishlist
  }
  else if (buttonPressed == 3) {
    let category = req.body.category;
    let products = await DB_Buyer.getAllProducts(category);

    return res.redirect("/login");
  }

  return res.sendStatus(204);
});

router.post("/clicked_cart", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let result = await DB_Buyer.getCartItems(user.person_id);

  let cnt = await DB_Buyer.IsInOrder(user.person_id);


  let buttonPressed = req.body.butt;

  console.log(buttonPressed)

  if (buttonPressed == 1) {
    let product_id = req.body.product_id;

    await DB_Buyer.deleteItemFromCart(user.person_id, product_id);


    result = await DB_Buyer.getCartItems(user.person_id);
  }

  else if (buttonPressed == 2) {

    const uuid = crypto.randomBytes(16).toString("hex");

    let today = new Date();

    //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear(); //+ ' at ' + time;

    await DB_Buyer.addToOrder(uuid, user.person_id, date, 'Pending');

    result = await DB_Buyer.getCartItems(uuid, user.person_id);

    console.log(result);
  }

  return res.render("cart_items.ejs",
    {
      value: result, user: user
    });


});

router.post("/search", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;

  let products = await DB_Buyer.getAllProductsByTag(tag.toUpperCase());



  res.render("search.ejs", { value: products, tag: tag, user: user });

});

router.post("/seller_search", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;

  let products = await DB_Seller.getAllProductsByTag(tag.toUpperCase(),user.user_name);



  res.render("seller_search.ejs", { value: products, tag: tag, user: user });

});


router.post("/logged_in", async (req, res) => {

  let user = JSON.parse(req.body.user_info);



  if (user !== null) {

    let categories = await DB_Buyer.getAllCategories();
    return res.render("logged_in.ejs", {
      value: categories,
      user: user
    });

  }

  if (req.body.from.localeCompare("signup") === 0) {


    console.log("it reaches");


    const uuid = crypto.randomBytes(16).toString("hex");

    //USER_NAME = req.body.username;

    //person_id = uuid;

    let user = {
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      address: req.body.address,
      username: req.body.username,
      id: uuid,
      type: req.body.type,
    };

    let user_temp = {
      person_id: uuid,
      user_name: req.body.username
    }


    await DB_auth.createNewUser(user);

    let categories = await DB_Buyer.getAllCategories();

    res.render("logged_in.ejs", { 
      value: categories,
       user: user_temp
     }); // sending values
  }
  else //login
  {

    let username = req.body.username;
    let password = req.body.password;


    let results;

    results = await DB_auth.getLoginInfoByUsername(username);

    let pass_db = results[0].PASSWORD;

    let user = {
      user_name: req.body.username,
      person_id: results[0].PERSON_ID
    }
    if (password === pass_db) {

      

      let isBuyer = await DB_auth.isInBuyer(username)
      let isAdmin = await DB_auth.isInAdmin(username)
      let isSeller = await DB_auth.isInSeller(username)

      console.log(isBuyer);
      console.log(isSeller);
      console.log(isAdmin);

      if (isAdmin.length > 0) {
        res.render('admin_logged_in.ejs', {
          user: user
        })
      }

      else if (isBuyer.length > 0) {
        console.log("it is buyer");
        let categories = await DB_Buyer.getAllCategories();

        res.render("logged_in.ejs", {
          value: categories,
          user: user
        });
      }

      else if (isSeller.length > 0) {
        console.log("it is seller");

        let categories = await DB_Seller.getAllCategories(user.user_name);

        res.render("seller_logged_in.ejs", {
          value: categories,
          user: user
        });
      }




    }
    else {
      return res.redirect("/");
    }
  }
});

router.post("/seller_logged_in", async(req,res) => {
  
  let user = JSON.parse(req.body.user_info);
  let categories = await DB_Seller.getAllCategories(user.user_name);
  
  res.render("seller_logged_in.ejs", {
    value: categories,
    user: user
  });
});

router.post("/logout", async (req, res) => {
  res.redirect("/");
});

router.post('/profile', async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let results = await DB_Buyer.getUserDetails(user.person_id);

  //let order_brief = await DB_Buyer.getPreviousOrder(user.person_id);

  let result = await DB_Buyer.getCartIdOfOrder(user.person_id);

  let order_brief = []

  for (let i = 0; i < result.length; i++) {

    let products = await DB_Buyer.getProductsByCartId(result[i].CART_ID)


    const obj = {

      ORDER_DATE: result[i].ORDER_DATE,
      CART_ID: result[i].CART_ID,
      ORDER_STATUS: result[i].ORDER_STATUS,
      value: products

    }


    order_brief.push(obj);

  }



  res.render('profile.ejs', {
    user: user,
    value: results[0],
    order_brief: order_brief
  });

});

router.post('/show_order_details', async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let cart_id = req.body.CART_ID;

  let result = await DB_Buyer.getProductsByCartId(cart_id);

  let status = await DB_Buyer.getOrderStatus(cart_id);

  console.log(status[0])
  res.render('prevOrder.ejs', {
    user: user,
    value: result,
    status: status[0]
  });

})

module.exports = router;
