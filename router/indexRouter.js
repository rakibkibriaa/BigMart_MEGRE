// libraries
const express = require("express");
//const marked = require('marked');

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_Seller = require("../Database/DB-seller-api");
const crypto = require("crypto");
const { count } = require("console");
const DB_admin = require("../Database/DB-admin-api");


//let person_id;
//let USER_NAME = null;

let CART_ID = null;

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/sign_up", (req, res) => {
  res.render("sign_up.ejs");
});



router.post("/products", async (req, res) => {

  let products = await DB_Buyer.getAllProducts(req.body.category);



  let user = JSON.parse(req.body.user_info);

  res.render("products.ejs", { value: products, user: user });
});

router.post("/item", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);

  let reviews = await DB_Buyer.getReviews(req.body.product_id);

  console.log(user);

  let canreview = await DB_Buyer.canReview(req.body.product_id, user.person_id);

  let avgRating = await DB_Buyer.avgRating(req.body.product_id);

  let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);

  let seller = await DB_Buyer.getSeller(req.body.product_id);
  console.log(seller);

  console.log(totalReview[0])
  res.render("item.ejs", {
    value: result1[0], user: user, reviews: reviews,
    canReview: canreview[0].COUNT, avgRating: avgRating[0], totalReview: totalReview[0], seller: seller[0]
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

    }
    else if (quantity == 0) {
      console.log("give valid quantity");
    }
    else {
      console.log("Already Added");
    }

  }
  else if (buttonPressed == 2) {
    console.log("butt2"); ///wishlist

    let quantity = req.body.quantity;
    let product_id = result.PRODUCT_ID;

    await DB_Buyer.addToWishList(user.person_id, product_id, quantity, 'Pending')

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

  const mySet = new Set()

  let bundles = await DB_Buyer.getBundle(user.person_id)

  for (let i = 0; i < bundles.length; i++) {
    let prod = await DB_Buyer.getProductsByBundle(bundles[i].BUNDLE_ID);

    let cnt = 0;

    for (let j = 0; j < prod.length; j++) {
      for (let l = 0; l < result.length; l++) {
        if (prod[j].PRODUCT_ID == result[l].PRODUCT_ID) {
          cnt++;
        }
      }

    }

    if (cnt == prod.length) {
      mySet.add(bundles[i].BUNDLE_ID)
    }

  }
  let maxi = 0;
  for (const item of mySet) {
    let val = await DB_Buyer.getDiscount(item);
    maxi = Math.max(maxi, val[0].DISCOUNT)
  }

  let cartPrice = await DB_Buyer.getPrice(user.person_id);

  let discPrice = cartPrice[0].SUM - (cartPrice[0].SUM * maxi) / 100;

  console.log(maxi + '%')
  let buttonPressed = req.body.butt;

  console.log(buttonPressed)

  if (buttonPressed == 1) {
    let product_id = req.body.product_id;

    await DB_Buyer.deleteItemFromCart(user.person_id, product_id);


    result = await DB_Buyer.getCartItems(user.person_id);

    cartPrice = await DB_Buyer.getPrice(user.person_id);
    discPrice = cartPrice[0].SUM - (cartPrice[0].SUM * maxi) / 100;
  }

  else if (buttonPressed == 2) {



    const uuid = crypto.randomBytes(16).toString("hex");

    let today = new Date();


    let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear(); //+ ' at ' + time;

    await DB_Buyer.addToOrder(uuid, user.person_id, date, 'Pending');

    result = await DB_Buyer.getCartItems(user.person_id);

    cartPrice = await DB_Buyer.getPrice(user.person_id);
    discPrice = cartPrice[0].SUM - (cartPrice[0].SUM * maxi) / 100;

    result = await DB_Buyer.getCartItems(uuid, user.person_id);

    console.log(result);
  }


  return res.render("cart_items.ejs",
    {
      value: result, user: user,
      cartPrice: cartPrice[0].SUM + 0,
      discPrice: discPrice

    });


});

router.post("/seller_category_buyer", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let seller = req.body.seller_name;
  let categories = await DB_Seller.getAllCategories(seller);

  res.render("seller_category_buyer.ejs", {
    value: categories,
    user: user,
    seller: seller
  });

});

router.post("/seller_products_buyer", async (req, res) => {


  let user = JSON.parse(req.body.user_info);
  let seller = req.body.seller;

  let products = await DB_Seller.getAllProducts(req.body.category, seller);
  console.log(products)
  console.log(req.body.category);
  console.log(user.user_name);

  res.render("seller_products_buyer.ejs", { value: products, user: user, seller: seller });
});
router.post("/search", async (req, res) => {
  let user = JSON.parse(req.body.user_info);

  let tag = req.body.tag;

  let products = await DB_Buyer.getAllProductsByTag(tag.toUpperCase());



  res.render("search.ejs", { value: products, tag: tag, user: user });

});

router.post("/review", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let msg = req.body.review_msg;

  let rating = +(req.body.rating);

  let product_id = req.body.product_id;

  const uuid = crypto.randomBytes(16).toString("hex");



  await DB_Buyer.addReview(msg, uuid, user.person_id, product_id, rating);


  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);



  let reviews = await DB_Buyer.getReviews(req.body.product_id);

  let canreview = await DB_Buyer.canReview(req.body.product_id, user.person_id);

  let avgRating = await DB_Buyer.avgRating(req.body.product_id);



  console.log(avgRating);

  console.log(reviews)

  let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);

  let seller = await DB_Buyer.getSeller(req.body.product_id);

  console.log(totalReview)
  res.render("item.ejs", {
    value: result1[0], user: user, reviews: reviews,
    canReview: canreview[0].COUNT, avgRating: avgRating[0], totalReview: totalReview[0], seller: seller[0]
  });


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

    if (!user.type.localeCompare('seller')) {
      let categories = await DB_Seller.getAllCategories(user.user_name);


      res.render("seller_waiting_approval.ejs", {

        value: categories,
        user: user_temp
      }); // sending values
    }
    else {
      let categories = await DB_Buyer.getAllCategories();

      res.render("logged_in.ejs", {
        value: categories,
        user: user_temp
      }); // sending values
    }
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

      let categories = await DB_Buyer.getAllCategories();

      let waiting = await DB_auth.waiting(username)

      console.log(waiting);

      console.log(isBuyer);
      console.log(isSeller);
      console.log(isAdmin);


      if (isAdmin.length > 0) {
        res.render('admin_logged_in.ejs', {
          user: user,
          value: categories
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
      else if (waiting.length > 0) {
        res.render("seller_waiting_approval.ejs", {
        });
      }
    }
    else {
      return res.redirect("/");
    }
  }
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


  res.render('prevOrder.ejs', {
    user: user,
    value: result,
    status: status[0]
  });

})

router.post("/subscribe", async (req, res) => {


  let user = JSON.parse(req.body.user_info);

  let existing_plans = await DB_admin.getSubscriptonPlans();
  for (let i = 0; i < existing_plans.length; i++) {

    let bundle_cnt = await DB_admin.getBundleCount(existing_plans[i].SUBSCRIPTION_ID);
    let subscriber_count = await DB_admin.getSubscriberCount(existing_plans[i].SUBSCRIPTION_ID);


    let isInSubs = await DB_Buyer.isInSubscription(existing_plans[i].SUBSCRIPTION_ID, user.person_id);



    existing_plans[i].IS_SUBSCRIBED = isInSubs[0].COUNT;

    existing_plans[i].BUNDLE_COUNT = bundle_cnt[0].COUNT;
    existing_plans[i].SUBSCRIBER_COUNT = subscriber_count[0].COUNT;


  }



  res.render('buyer_subscription_view.ejs', {
    value: existing_plans,
    user: user
  });


});

router.post("/subscribed", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let subscription_id = req.body.subscription_id;


  await DB_Buyer.addBuyerToSubscription(subscription_id, user.person_id)


  let existing_plans = await DB_admin.getSubscriptonPlans();
  for (let i = 0; i < existing_plans.length; i++) {

    let bundle_cnt = await DB_admin.getBundleCount(existing_plans[i].SUBSCRIPTION_ID);
    let subscriber_count = await DB_admin.getSubscriberCount(existing_plans[i].SUBSCRIPTION_ID);


    let isInSubs = await DB_Buyer.isInSubscription(existing_plans[i].SUBSCRIPTION_ID, user.person_id);



    existing_plans[i].IS_SUBSCRIBED = isInSubs[0].COUNT;

    existing_plans[i].BUNDLE_COUNT = bundle_cnt[0].COUNT;
    existing_plans[i].SUBSCRIBER_COUNT = subscriber_count[0].COUNT;


  }



  res.render('buyer_subscription_view.ejs', {
    value: existing_plans,
    user: user
  });



});

router.post("/unsubscribed", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let subscription_id = req.body.subscription_id;

  await DB_Buyer.deleteBuyerFromSubscription(subscription_id, user.person_id)


  let existing_plans = await DB_admin.getSubscriptonPlans();
  for (let i = 0; i < existing_plans.length; i++) {

    let bundle_cnt = await DB_admin.getBundleCount(existing_plans[i].SUBSCRIPTION_ID);
    let subscriber_count = await DB_admin.getSubscriberCount(existing_plans[i].SUBSCRIPTION_ID);


    let isInSubs = await DB_Buyer.isInSubscription(existing_plans[i].SUBSCRIPTION_ID, user.person_id);



    existing_plans[i].IS_SUBSCRIBED = isInSubs[0].COUNT;

    existing_plans[i].BUNDLE_COUNT = bundle_cnt[0].COUNT;
    existing_plans[i].SUBSCRIBER_COUNT = subscriber_count[0].COUNT;


  }



  res.render('buyer_subscription_view.ejs', {
    value: existing_plans,
    user: user
  });


});

router.post("/buyer_clicked_plan", async (req, res) => {

  let user = JSON.parse(req.body.user_info);
  let subscription_id = req.body.subscription_id;

  let bundles = await DB_admin.getBundle(subscription_id)



  for (let i = 0; i < bundles.length; i++) {
    let product_count = await DB_admin.getProductCount(bundles[i].BUNDLE_ID);

    bundles[i].PRODUCT_COUNT = product_count[0].COUNT
  }



  res.render('buyer_view_plan.ejs', {
    value: bundles,
    user: user,
    subscription_id: subscription_id
  });


});


router.post("/buyer_view_bundle_item", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let bundle_id = req.body.bundle_id;

  let result = await DB_admin.getBundleItems(bundle_id);







  let subscription_id = req.body.subscription_id;


  return res.render("buyer_view_bundle_items.ejs",
    {
      value: result, user: user,
      subscription_id: subscription_id,
      bundle_id: bundle_id
    });

});


router.post("/edit_review", async (req, res) => {


  let buttonPressed = req.body.butt;

  if (buttonPressed == 1) {


    let result1 = await DB_Buyer.getProductDetails(req.body.product_id);


    let user = JSON.parse(req.body.user_info);


    let avgRating = await DB_Buyer.avgRating(req.body.product_id);


    console.log(avgRating[0]);

    let review_id = req.body.review_id;

    console.log(req.body.product_id)

    res.render("edit_review.ejs", {
      value: result1[0], user: user,
      avgRating: avgRating[0], review_id: review_id
    });

  }
  else {
    let review_id = req.body.review_id;

    await DB_Buyer.deleteReview(review_id);

    let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

    let user = JSON.parse(req.body.user_info);

    let reviews = await DB_Buyer.getReviews(req.body.product_id);

    console.log(user);

    let canreview = await DB_Buyer.canReview(req.body.product_id, user.person_id);

    let avgRating = await DB_Buyer.avgRating(req.body.product_id);

    let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);

    console.log(avgRating[0]);

    let seller = await DB_Buyer.getSeller(req.body.product_id);

    res.render("item.ejs", {
      value: result1[0], user: user, reviews: reviews,
      canReview: canreview[0].COUNT, avgRating: avgRating[0], totalReview: totalReview[0], seller: seller[0]
    });


  }



});

router.post("/save_review", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);


  let review_id = req.body.review_id;

  let msg = req.body.review_msg;

  let rating = +(req.body.rating);

  await DB_Buyer.updateReview(review_id, msg, rating);



  console.log(user);

  let canreview = await DB_Buyer.canReview(req.body.product_id, user.person_id);

  let avgRating = await DB_Buyer.avgRating(req.body.product_id);



  let reviews = await DB_Buyer.getReviews(req.body.product_id);
  let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);
  let seller = await DB_Buyer.getSeller(req.body.product_id);

  res.render("item.ejs", {
    value: result1[0], user: user, reviews: reviews,
    canReview: canreview[0].COUNT, avgRating: avgRating[0], totalReview: totalReview[0], seller: seller[0]
  });

});

router.post("/my_review", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let myReview = await DB_Buyer.myReview(user.person_id);

  res.render("my_review.ejs", {
    value: myReview, user: user
  });

});


router.post("/wishlist", async (req, res) => {

  let user = JSON.parse(req.body.user_info);

  let myWishList = await DB_Buyer.myWishList(user.person_id);

  let added = await DB_Buyer.myWishListAdded(user.person_id);
  res.render("wishlist.ejs", {
    value: myWishList, user: user, added: added
  });

});

router.post("/complain", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);


  let user = JSON.parse(req.body.user_info);

  let seller = req.body.seller_name;

  console.log(seller)

  res.render("complain.ejs", {
    value: result1[0], user: user, seller: seller
  });


});

router.post("/send_complain", async (req, res) => {

  let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

  let user = JSON.parse(req.body.user_info);



  let msg = req.body.complain_msg;

  await DB_Buyer.addComplain(user.person_id, req.body.product_id, msg)
  // await DB_Buyer.updateReview(review_id, msg, rating);



  console.log(user);

  let canreview = await DB_Buyer.canReview(req.body.product_id, user.person_id);

  let avgRating = await DB_Buyer.avgRating(req.body.product_id);



  let reviews = await DB_Buyer.getReviews(req.body.product_id);
  let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);
  let seller = await DB_Buyer.getSeller(req.body.product_id);

  res.render("item.ejs", {
    value: result1[0], user: user, reviews: reviews,
    canReview: canreview[0].COUNT, avgRating: avgRating[0], totalReview: totalReview[0], seller: seller[0]
  });


});



module.exports = router;
