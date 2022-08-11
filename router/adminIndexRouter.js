const express = require("express");

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_admin = require("../Database/DB-admin-api");
const crypto = require("crypto");
const { count } = require("console");

router.post("/admin_logged_in", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    res.render("admin_logged_in.ejs", {
        user: user
    });
});

router.post("/update_order_status", async (req, res) => {
    let status = req.body.order_status;
    let order_id = req.body.CART_ID;

    await DB_admin.changeOrderStatus(order_id, status)



    let user = JSON.parse(req.body.user_info);

    let result = await DB_admin.getOrderList();

    let order_brief = []

    for (let i = 0; i < result.length; i++) {

        let products = await DB_Buyer.getProductsByCartId(result[i].ORDER_ID)


        const obj = {

            ORDER_DATE: result[i].ORDER_DATE,
            CART_ID: result[i].ORDER_ID,
            ORDER_STATUS: result[i].ORDER_STATUS,
            value: products

        }


        order_brief.push(obj);

    }



    res.render('list_order.ejs', {
        user: user,
        order_brief: order_brief
    });


});

router.post("/list_order", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let result = await DB_admin.getOrderList();

    let order_brief = []

    for (let i = 0; i < result.length; i++) {

        let products = await DB_Buyer.getProductsByCartId(result[i].ORDER_ID)


        const obj = {

            ORDER_DATE: result[i].ORDER_DATE,
            CART_ID: result[i].ORDER_ID,
            ORDER_STATUS: result[i].ORDER_STATUS,
            value: products

        }


        order_brief.push(obj);

    }



    res.render('list_order.ejs', {
        user: user,
        order_brief: order_brief
    });
});

router.post('/admin_subscription', async (req, res) => {

    let existing_plans = await DB_admin.getSubscriptonPlans();
    let user = JSON.parse(req.body.user_info);

    console.log(existing_plans)

    res.render('admin_subscription.ejs', {
        value: existing_plans,
        user: user
    });

})


router.post('/add_new_plan', async (req, res) => {

    let user = JSON.parse(req.body.user_info);


    res.render('add_plan.ejs', {
        user: user
    });

})

router.post('/added_subscription_plan', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    const uuid = crypto.randomBytes(16).toString("hex");

    let plan_name = req.body.plan_name;
    let price = req.body.price;



    await DB_admin.addNewSubscriptionPlan(uuid, price, plan_name, 0, 0);

    let bundles = await DB_admin.getBundle(uuid);

    res.render('view_plan.ejs', {
        value: bundles,
        user: user,
        subscription_id: uuid
    });


})

router.post('/delete_plan', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let subscription_id = req.body.subscription_id;

    await DB_admin.deleteSubscriptionPlan(subscription_id);

    let existing_plans = await DB_admin.getSubscriptonPlans();

    console.log(existing_plans)

    res.render('admin_subscription.ejs', {
        value: existing_plans,
        user: user
    });

})




router.post('/add_new_bundle', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let subscription_id = req.body.subscription_id;

    const uuid = crypto.randomBytes(16).toString("hex");


    let categories = await DB_Buyer.getAllCategories();



    res.render('select_bundle_category.ejs', {
        value: categories,
        user: user,
        subscription_id: subscription_id,
        bundle_id: uuid
    })

});

router.post('/clicked_plan', async (req, res) => {

    let user = JSON.parse(req.body.user_info);
    let subscription_id = req.body.subscription_id;

    let bundles = await DB_admin.getBundle(subscription_id)

    console.log(bundles)

    res.render('view_plan.ejs', {
        value: bundles,
        user: user,
        subscription_id: subscription_id
    });


})


router.post('/select_bundle_product', async (req, res) => {


    let products = await DB_Buyer.getAllProducts(req.body.category);

    let user = JSON.parse(req.body.user_info);


    let subscription_id = req.body.subscription_id;

    let bundle_id = req.body.bundle_id;

    res.render("select_bundle_product.ejs", { value: products, user: user, subscription_id: subscription_id, bundle_id: bundle_id });
    //const uuid = crypto.randomBytes(16).toString("hex");




})

router.post('/select_bundle_item', async (req, res) => {


    let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

    let user = JSON.parse(req.body.user_info);

    let bundle_id = req.body.bundle_id;
    let subscription_id = req.body.subscription_id;

    console.log(result1)


    res.render("select_bundle_item.ejs", {
        value: result1[0],
        user: user,
        subscription_id: subscription_id,
        bundle_id: bundle_id
    });
    //const uuid = crypto.randomBytes(16).toString("hex");




})

router.post("/added_to_bundle", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let result = JSON.parse(req.body.product);

    let product_id = result.PRODUCT_ID;

    let bundle_id = req.body.bundle_id;

    let subscription_id = req.body.subscription_id;


    console.log(product_id)

    let isInBundle = await DB_admin.isInBundle(bundle_id, product_id);


    let buttonPressed = req.body.butt;


    if (buttonPressed == 1) {

        if (isInBundle[0].COUNT === 0) {

            await DB_admin.addtoBundle(bundle_id, product_id);

            console.log('added to bundle')

        }
        else {
            console.log("Already Added");
        }

    }

    let isInSubscription = await DB_admin.isInSubscription(subscription_id, bundle_id);

    if (isInSubscription[0].COUNT === 0) {

        await DB_admin.addtoSubscription(subscription_id, bundle_id);

        console.log('added to subscription')

    }
    //


    let result1 = await DB_admin.getBundleItems(bundle_id);


    return res.render("bundle_items.ejs",
        {
            value: result1, user: user,
            subscription_id: subscription_id,
            bundle_id: bundle_id
        });

});


router.post("/view_bundle_item", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let bundle_id = req.body.bundle_id;

    let result = await DB_admin.getBundleItems(bundle_id);

    console.log(result)
    let buttonPressed = req.body.butt;

    console.log(buttonPressed)



    let subscription_id = req.body.subscription_id;


    if (buttonPressed == 1) {
        let product_id = req.body.product_id;

        await DB_admin.deleteItemFromBundle(bundle_id, product_id);


        result = await DB_admin.getBundleItems(bundle_id);

        if (result.length === 0) {
            await DB_admin.deleteBundleFromSubscription(subscription_id, bundle_id);
        }
    }

    return res.render("bundle_items.ejs",
        {
            value: result, user: user,
            subscription_id: subscription_id,
            bundle_id: bundle_id
        });

});

router.post('/add_new_item', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let subscription_id = req.body.subscription_id;

    let bundle_id = req.body.bundle_id;


    let categories = await DB_Buyer.getAllCategories();

    res.render('select_bundle_category.ejs', {
        value: categories,
        user: user,
        subscription_id: subscription_id,
        bundle_id: bundle_id
    })

})



module.exports = router;