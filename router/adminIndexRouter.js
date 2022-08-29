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



router.post("/update_approval_status", async (req, res) => {
    let status = req.body.approval_status;
    let SELLER_ID = req.body.SELLER_ID;

    console.log(status);

    //await DB_admin.changeOrderStatus(order_id, status)
    await DB_auth.deleteApproval(SELLER_ID);

    if(!status.localeCompare('Accept')){
        await DB_auth.addSeller(SELLER_ID);
    }
    else{
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



module.exports = router;