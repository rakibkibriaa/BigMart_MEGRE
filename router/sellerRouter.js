// libraries
const express = require("express");
//const marked = require('marked');

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_Seller = require("../Database/DB-seller-api");
const DB_admin = require("../Database/DB-admin-api");
const crypto = require("crypto");
const { count } = require("console");
const { dbObjectAsPojo } = require("oracledb");

//helu, port testing
router.post("/seller_products", async (req, res) => {


  let user = JSON.parse(req.body.user_info);

  let products = await DB_Seller.getAllProducts(req.body.category, user.person_id);
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



router.post("/seller_item/stock", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  //let result = JSON.parse(req.body.product);

  let product_id = req.body.product_id

  //let isInCart = await DB_Buyer.isInCart(user.person_id, product_id);

  let quantity = req.body.quantity;

  let buttonPressed = req.body.butt;


  if (buttonPressed == 1) {
    // if (isInCart[0].COUNT === 0 && quantity > 0) {
    //   await DB_Buyer.addToCart(user.person_id, product_id, quantity, null);

    // } else if (quantity == 0) {
    //   console.log("give valid quantity");
    // } else {
    //   console.log("Already Added");
    // }





    let product_id = req.body.product_id;
    let product = await DB_Seller.getProductDetails(product_id);

    console.log(product);

    res.render("seller_product_edit.ejs", {

      user: user,
      product_id: product_id,
      product:product[0]
    });

  }
  else if (buttonPressed == 2) {
    console.log("butt2"); ///add stock

    let quantity = req.body.quantity;
    let product_id = req.body.product_id;

    await DB_Seller.addToStock(product_id, 0 + quantity);


    let result1 = await DB_Seller.getProductDetails(req.body.product_id);

    res.render("seller_item.ejs", {
      value: result1[0],
      user: user
    });


  }
  else if (buttonPressed == 3) {
    let category = req.body.category;
    let products = await DB_Buyer.getAllProducts(category);

    return res.redirect("/login");
  }



});

router.post("/seller_wishlist", async (req, res) => {
  let user = JSON.parse(req.body.user_info);


  let resu = await DB_Seller.getWishlist(user.person_id);

  let delivered = await DB_Seller.getAcceptedOrder(user.person_id);

  res.render('seller_wishlist_order.ejs', {
    user: user,
    order_brief: resu,
    delivered: delivered
  });

});

router.post("/update_wishlist_status", async (req, res) => {
  let status = req.body.status;
  let product_id = req.body.product_id;

  console.log(status);
  console.log(product_id);

  if (!status.localeCompare("Approved")) {
    await DB_Seller.changeWishlistStatus(product_id, status)
  }



  let user = JSON.parse(req.body.user_info);


  let user_id = await DB_auth.getIDByUsername(user.user_name);

  let result = await DB_Seller.getWishlist();

  let order_brief = []

  /*for (let i = 0; i < result.length; i++) {
 
 
      console.log(result[i].ORDER_ID);
      console.log(user_id[0].PERSON_ID);
      let products = await DB_Seller.getProductsByCartId(result[i].ORDER_ID,user_id[0].PERSON_ID)
 
      console.log(products);
 
 
      const obj = {
 
          ORDER_DATE: result[i].ORDER_DATE,
          CART_ID: result[i].ORDER_ID,
          ORDER_STATUS: result[i].ORDER_STATUS,
          value: products
 
      }
 
 
      order_brief.push(obj);
 
  }*/


  let resu = await DB_Seller.getWishlist(user.person_id)

  let quantity = req.body.QUANTITY;



  await DB_Seller.addToStock(product_id, quantity);

  console.log(resu)
  let delivered = await DB_Seller.getAcceptedOrder(user.person_id)

  res.render('seller_wishlist_order.ejs', {
    user: user,
    order_brief: resu,
    delivered: delivered,

  });
});

router.post("/seller_complainlist", async (req, res) => {
  let user = JSON.parse(req.body.user_info);


  let resu = await DB_Seller.getComplainlist(user.person_id);

  //let delivered = await DB_Seller.getAcceptedOrder(user.person_id);

  res.render('seller_complainlist.ejs', {
    user: user,
    order_brief: resu
  });

});

router.post("/seller_profile_edit", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  console.log("profile editing");
  console.log(user);



  let buttonPressed = req.body.butt;


  if (buttonPressed == 1) {
   


    res.render("seller_profile_edit.ejs", {

      user: user,

    });

  }
  
});

router.post('/seller_profile', async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let results = await DB_Buyer.getUserDetails(user.person_id);

  
  res.render('seller_profile.ejs', {
    user: user,
    value: results[0],
  });

});
router.post("/seller_edited_profile", async (req, res) => {


  let user  = JSON.parse(req.body.user_info);
  // let user = {
  //   user_id : user_info.person_id,
  //   name:req.body.name,

  //   email:req.body.email,
  //   address: req.body.address,
  //   password: req.body.password
  // }
  user.name = req.body.name;
  user.email= req.body.email;
  user.address = req.body.address;
  user.password = req.body.password;

  console.log(user);

  await DB_Buyer.updateProfile(user.person_id,req.body.name,req.body.email,req.body.address, req.body.password);

  let results = await DB_Buyer.getUserDetails(user.person_id);

  

    res.render("seller_profile.ejs", {

    user: user,
    value: results[0],


    });

  });

router.post("/seller_search", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;

  let products = await DB_Seller.getAllProductsByTag(tag.toUpperCase(), user.person_id);




  res.render("seller_search.ejs", { value: products, tag: tag, user: user });

});



router.post("/seller_logged_in", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let categories = await DB_Seller.getAllCategories(user.person_id);

  console.log(user);

  res.render("seller_logged_in.ejs", {
    value: categories,
    user: user
  });

});


router.post("/add_product", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  res.render("add_product.ejs", {
    user: user
  });
});
router.post("/save_image", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let img = req.body.img;

  let product_id = req.body.product_id;

  if (img != '') {
    await DB_Seller.addImage(product_id, img);

    return res.render("seller_add_image.ejs", {
      user: user,
      product_id: product_id
    });
  }
  else {
    let message = "No image selected"
    return res.render("alert.ejs", {
      message: message
    });
  }



});

router.post("/added_seller_logged_in", async (req, res) => {
  let user = JSON.parse(req.body.user_info);
  //let categories = await DB_Seller.getAllCategories(user.user_name);

  const uuid = crypto.randomBytes(16).toString("hex");


  let product = {
    product_id: uuid,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    quantity: req.body.quantity,
    description: req.body.description,
    total_sales: 0,
  };


  let user_id = await DB_auth.getIDByUsername(user.user_name);
  let user_temp = {
    seller_id: user_id[0].PERSON_ID,
  }
  await DB_Seller.addProduct(product, user_temp);

  let categories = await DB_Seller.getAllCategories(user.person_id);

  //let user = JSON.parse(req.body.user_info);

  let category = req.body.category;

  let img = req.body.img;

  await DB_Seller.updatePicture(category, img, uuid);

  console.log(img)

  res.render("seller_logged_in.ejs", {
    value: categories,
    user: user
  });
});


router.post("/added_seller_edit", async (req, res) => {
  let user = JSON.parse(req.body.user_info);
  //let categories = await DB_Seller.getAllCategories(user.user_name);

  //const uuid = crypto.randomBytes(16).toString("hex");




  // let product = {
  //   //product_id : uuid,
  //   product_id: req.body.product_id,
  //   name : req.body.name,
  //   price : req.body.price,
  //   category: req.body.category,
  //   quantity: req.body.quantity
  //   //total_sales: 0,
  // };


  let user_id = await DB_auth.getIDByUsername(user.user_name);
  let user_temp = {
    seller_id: user_id[0].PERSON_ID,
  }
  //await DB_Seller.addProduct(product,user_temp);
  console.log(req.body.name);
  await DB_Seller.editProduct(req.body.name, req.body.price, req.body.quantity, req.body.product_id,req.body.description);
  console.log("reaches after edit product");
  let product = await DB_Seller.getProductDetails(req.body.product_id);
  let categories = await DB_Seller.getAllCategories(user.person_id);

  //let user = JSON.parse(req.body.user_info);

  let category = req.body.category;

  let img = req.body.img;

  await DB_Seller.updatePicture(category, img, req.body.product_id);

  console.log(img);

  res.render("seller_item.ejs", {
    value: product[0],
    user: user
  });
});

router.post("/seller_list_order", async (req, res) => {

  let user = JSON.parse(req.body.user_info);


  let user_id = await DB_auth.getIDByUsername(user.user_name);

  let result = await DB_Seller.getOrderList();

  let order_brief = []



  let resu = await DB_Seller.getOrder(user.person_id)

  let delivered = await DB_Seller.getDeliveredOrder(user.person_id)

  resu.sort((a, b) => (a.ORDER_DATE > b.ORDER_DATE) ? 1 : ((b.ORDER_DATE > a.ORDER_DATE) ? -1 : 0))

  res.render('seller_list_order.ejs', {
    user: user,
    order_brief: resu,
    delivered: delivered
  });
});

router.post("/add_image", async (req, res) => {

  let user = JSON.parse(req.body.user_info);


  res.render('seller_add_image.ejs', {
    user: user,
    product_id: req.body.product_id
  });

});


// router.post("/update_order_status", async (req, res) => {
//   let status = req.body.order_status;
//   let order_id = req.body.CART_ID;

//   await DB_admin.changeOrderStatus(order_id, status)



//   let user = JSON.parse(req.body.user_info);

//   let result = await DB_admin.getOrderList();

//   let order_brief = []

//   for (let i = 0; i < result.length; i++) {

//       let products = await DB_Buyer.getProductsByCartId(result[i].ORDER_ID)


//       const obj = {

//           ORDER_DATE: result[i].ORDER_DATE,
//           CART_ID: result[i].ORDER_ID,
//           ORDER_STATUS: result[i].ORDER_STATUS,
//           value: products

//       }


//       order_brief.push(obj);

//   }



//   res.render('list_order.ejs', {
//       user: user,
//       order_brief: order_brief
//   });


// });

router.post("/update_order_status", async (req, res) => {
  let status = req.body.order_status;
  let order_id = req.body.CART_ID;

  await DB_admin.changeOrderStatus(order_id, status)



  let user = JSON.parse(req.body.user_info);


  let user_id = await DB_auth.getIDByUsername(user.user_name);

  let result = await DB_Seller.getOrderList();

  let order_brief = []

  /*for (let i = 0; i < result.length; i++) {
 
 
      console.log(result[i].ORDER_ID);
      console.log(user_id[0].PERSON_ID);
      let products = await DB_Seller.getProductsByCartId(result[i].ORDER_ID,user_id[0].PERSON_ID)
 
      console.log(products);
 
 
      const obj = {
 
          ORDER_DATE: result[i].ORDER_DATE,
          CART_ID: result[i].ORDER_ID,
          ORDER_STATUS: result[i].ORDER_STATUS,
          value: products
 
      }
 
 
      order_brief.push(obj);
 
  }*/


  let resu = await DB_Seller.getOrder(user.person_id)


  resu.sort((a, b) => (a.ORDER_DATE > b.ORDER_DATE) ? 1 : ((b.ORDER_DATE > a.ORDER_DATE) ? -1 : 0))

  let delivered = await DB_Seller.getDeliveredOrder(user.person_id)

  res.render('seller_list_order.ejs', {
    user: user,
    order_brief: resu,
    delivered: delivered
  })
});


module.exports = router;