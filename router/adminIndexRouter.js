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



module.exports = router;