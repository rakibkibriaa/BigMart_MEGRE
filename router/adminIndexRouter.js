const express = require("express");

const router = express.Router({ mergeParams: true });
const DB_auth = require("../Database/DB-auth-api");
const DB_Buyer = require("../Database/DB-buyer-api");
const DB_admin = require("../Database/DB-admin-api");
const crypto = require("crypto");
const { count } = require("console");

router.post("/admin_logged_in", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let categories = await DB_Buyer.getAllCategories();

    console.log(categories);

    res.render("admin_logged_in.ejs", {
        value: categories,
        user: user
    });
});



router.post("/update_approval_status", async (req, res) => {
    let status = req.body.approval_status;
    let SELLER_ID = req.body.SELLER_ID;

    console.log(status);

    //await DB_admin.changeOrderStatus(order_id, status)
    await DB_auth.deleteApproval(SELLER_ID);

    if (!status.localeCompare('Accept')) {
        await DB_auth.addSeller(SELLER_ID);

    }
    else {
        await DB_auth.deleteSeller(SELLER_ID);
    }


    let user = JSON.parse(req.body.user_info);

    let result = await DB_admin.getSellerList();

    let seller_brief = []

    console.log(result.length);


    for (let i = 0; i < result.length; i++) {

        console.log(result[i].SELLER_ID);

        let seller = await DB_admin.getSellerById(result[i].SELLER_ID)

        //console.log(seller[0].NAME);
        console.log(seller[0]);


        const obj = {

            SELLER_ID: result[i].SELLER_ID,
            value: seller

        }


        seller_brief.push(obj);

    }



    res.render('approval_order.ejs', {
        user: user,
        seller_brief: seller_brief
    });


});

/*router.post("/list_order", async (req, res) => {

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
}); */

router.post('/admin_subscription', async (req, res) => {

    let existing_plans = await DB_admin.getSubscriptonPlans();
    let user = JSON.parse(req.body.user_info);

    for (let i = 0; i < existing_plans.length; i++) {

        let bundle_cnt = await DB_admin.getBundleCount(existing_plans[i].SUBSCRIPTION_ID);
        let subscriber_count = await DB_admin.getSubscriberCount(existing_plans[i].SUBSCRIPTION_ID);

        existing_plans[i].BUNDLE_COUNT = bundle_cnt[0].COUNT;
        existing_plans[i].SUBSCRIBER_COUNT = subscriber_count[0].COUNT;
    }


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
    let discount = req.body.discount;


    await DB_admin.addNewSubscriptionPlan(uuid, price, plan_name, discount);

    let bundles = await DB_admin.getBundle(uuid);

    res.render('view_plan.ejs', {
        value: bundles,
        user: user,
        subscription_id: uuid,

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



    for (let i = 0; i < bundles.length; i++) {
        let product_count = await DB_admin.getProductCount(bundles[i].BUNDLE_ID);
        let discount = await DB_admin.getBundleDiscount(bundles[i].BUNDLE_ID);

        console.log(discount)
        bundles[i].PRODUCT_COUNT = product_count[0].COUNT
        bundles[i].DISCOUNT = discount[0].DISCOUNT
    }

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

    let discount = await DB_admin.getBundleDiscount(bundle_id);


    return res.render("bundle_items.ejs",
        {
            value: result1, user: user,
            subscription_id: subscription_id,
            bundle_id: bundle_id,
            discount: discount[0].DISCOUNT
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
            await DB_admin.deleteBundleFromBUNDLE_DISCOUNT(bundle_id);
        }
    }
    if (buttonPressed == 3) {
        await DB_admin.updateBundleDiscount(bundle_id, req.body.disc);
    }

    if (result.length === 0) {

        let bundles = await DB_admin.getBundle(subscription_id)



        for (let i = 0; i < bundles.length; i++) {
            let product_count = await DB_admin.getProductCount(bundles[i].BUNDLE_ID);

            bundles[i].PRODUCT_COUNT = product_count[0].COUNT
        }

        return res.render('view_plan.ejs', {
            value: bundles,
            user: user,
            subscription_id: subscription_id,

        });
    }
    else {


        let discount = await DB_admin.getBundleDiscount(bundle_id);



        return res.render("bundle_items.ejs",
            {
                value: result, user: user,
                subscription_id: subscription_id,
                bundle_id: bundle_id,
                discount: discount[0].DISCOUNT
            });
    }


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

});

router.post('/edit_category_picture', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let categoryName = req.body.category;

    res.render('admin_select_picture.ejs', {
        value: categoryName,
        user: user

    })

})

router.post('/admin_picture_updated', async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let category = req.body.category;

    let img = req.body.img;

    await DB_admin.updatePicture(category, img);

    console.log(img)



})

router.post('/admin_products', async (req, res) => {


    let products = await DB_Buyer.getAllProducts(req.body.category);



    let user = JSON.parse(req.body.user_info);

    res.render("admin_products.ejs", { value: products, user: user });


})

router.post('/admin_item', async (req, res) => {
    let result1 = await DB_Buyer.getProductDetails(req.body.product_id);

    let user = JSON.parse(req.body.user_info);

    let reviews = await DB_Buyer.getReviews(req.body.product_id);

    console.log(user);


    let avgRating = await DB_Buyer.avgRating(req.body.product_id);

    let totalReview = await DB_Buyer.totalReview(req.body.product_id, user.person_id);

    let complain = await DB_admin.getComplain(req.body.product_id);

    let totalComplain = await DB_admin.totalComplain(req.body.product_id);


    console.log(totalComplain[0].COUNT)

    res.render("admin_item.ejs", {
        value: result1[0], user: user, reviews: reviews,
        avgRating: avgRating[0], totalReview: totalReview[0],
        complain: complain, totalComplain: totalComplain[0].COUNT
    });
})

router.post('/admin_complain', async (req, res) => {

    let user = JSON.parse(req.body.user_info);
    let complain = await DB_admin.getAllComplain();

    console.log(complain)
    res.render("admin_complain.ejs", {
        value: complain, user: user,

    });
})
router.post('/ban', async (req, res) => {

    let buttonPressed = req.body.butt;



    if (buttonPressed == 1) {

        await DB_admin.banItem(req.body.product_id);

        let products = await DB_Buyer.getAllProducts(req.body.tag);



        let user = JSON.parse(req.body.user_info);

        res.render("admin_products.ejs", { value: products, user: user });

    }
    else {


        await DB_admin.banSeller(req.body.product_id);

        let products = await DB_Buyer.getAllProducts(req.body.tag);



        let user = JSON.parse(req.body.user_info);

        res.render("admin_products.ejs", { value: products, user: user });
    }

})



router.post("/approval_order", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let result = await DB_admin.getSellerList();

    let seller_brief = []

    console.log(result.length);


    for (let i = 0; i < result.length; i++) {

        console.log(result[i].SELLER_ID);

        let seller = await DB_admin.getSellerById(result[i].SELLER_ID)

        //console.log(seller[0].NAME);
        console.log(seller[0]);


        const obj = {

            SELLER_ID: result[i].SELLER_ID,
            value: seller

        }


        seller_brief.push(obj);

    }



    res.render('approval_order.ejs', {
        user: user,
        seller_brief: seller_brief
    });
});
router.post("/admin_seller_view", async (req, res) => {

    let user = JSON.parse(req.body.user_info);

    let sellerList = await DB_admin.getAdminSellerList();


    for (let i = 0; i < sellerList.length; i++) {
        let cnt = await DB_admin.getComplainCount(sellerList[i].SELLER_ID);
        let totalProducts = await DB_admin.getTotalProducts(sellerList[i].SELLER_ID);
        sellerList[i].COMPLAIN_COUNT = cnt[0].COUNT;
        sellerList[i].totalProducts = totalProducts[0].COUNT;
        let avg = await DB_admin.getSellerRating(sellerList[i].SELLER_ID)
        sellerList[i].RATING = avg[0].AVG + 0;

    }



    res.render('admin_seller_view.ejs', {
        user: user,
        sellerList: sellerList
    });


});


module.exports = router;