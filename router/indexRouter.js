// libraries
const express = require("express");
//const marked = require('marked');

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const crypto = require("crypto");

//let person_id;
//let USER_NAME = null;

let CART_ID = null;

router.get("/", (req, res) => { 
  res.render("index.ejs");
});

router.get("/sign_up", (req, res) => {
  res.render("sign_up.ejs");
});

router.post("/products", async (req, res) => 
{
  let products = await DB_Buyer.getAllProducts(req.body.category);

  console.log(products)
  
  let user = JSON.parse(req.body.user_info);
 
  res.render("products.ejs", { value: products, user:user });
});

router.post("/item", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);

  res.render("item.ejs", {
    value: result1[0], user:user
  });

});

router.post("/item/cart", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let result = JSON.parse(req.body.product);

  let product_id = result.PRODUCT_ID;

  let isInCart = await DB_Buyer.isInCart(user.person_id,product_id);

  let quantity = req.body.quantity;

  let buttonPressed = req.body.butt;


  if (buttonPressed == 1) 
  {
    if (isInCart[0].COUNT === 0 && quantity > 0) 
    {
      await DB_Buyer.addToCart(user.person_id, product_id, quantity);
    } else if (quantity == 0) 
    {
      console.log("give valid quantity");
    } else 
    {
      console.log("Already Added");
    }

  } 
  else if (buttonPressed == 2) 
  {
    console.log("butt2"); ///wishlist
  } 
  else if (buttonPressed == 3) 
  {
    let category = req.body.category;
    let products = await DB_Buyer.getAllProducts(category);

    return res.redirect("/login");
  }

  return res.sendStatus(204);
});

router.post("/clicked_cart", async (req, res) => 
{
  let user = JSON.parse(req.body.user_info);

  let result = await DB_Buyer.getCartItems(user.person_id);
  
  let buttonPressed = req.body.butt;
 
  if(buttonPressed == 1)
  {
     let product_id = req.body.product_id;
     
     await DB_Buyer.deleteItemFromCart(user.person_id,product_id);
     

     result = await DB_Buyer.getCartItems(user.person_id);
  }

  res.render("cart_items.ejs", 
  {
    value: result, user:user
  });



});

router.post("/search", async (req, res) => 
{
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;
  
  let products = await DB_Buyer.getAllProductsByTag(tag.toUpperCase());

  

  res.render("search.ejs", { value: products, tag: tag, user:user});

});


router.post("/logged_in", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  

  if (user !== null) {

    let categories = await DB_Buyer.getAllCategories();
    return res.render("logged_in.ejs", { value: categories,
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
      person_id : uuid,
      user_name : req.body.username
    }
    
    console.log(user.name);
    console.log(user.password);
    console.log(user.email);
    console.log(user.address);
    console.log(user.username);

    await DB_auth.createNewUser(user);

    let categories = await DB_Buyer.getAllCategories();

    res.render("logged_in.ejs", { value: categories,user: user_temp });
  } 
  else 
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
    if (password === pass_db) 
    {
      let categories = await DB_Buyer.getAllCategories();
      
      res.render("logged_in.ejs", { value: categories,
        user: user
      });
    } 
    else 
    {
      return res.redirect("/");
    }
  }
});

router.post("/logout", async (req, res) => {
  res.redirect("/");
});

module.exports = router;
