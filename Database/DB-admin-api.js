const database = require('./database');

async function getOrderList() {
    const sql = `
        SELECT *
        FROM ORDER_TABLE
        WHERE ORDER_STATUS <> 'Delivered'
        ORDER BY ORDER_DATE DESC
        `;
    const binds = {

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function banItem(product_id) {
    const sql = `
        DELETE FROM PRODUCT WHERE PRODUCT_ID = :product_id
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAdminSellerList() {
    const sql = `
        SELECT * 
        FROM SELLER S JOIN PERSON P 
        ON(S.SELLER_ID = P.PERSON_ID)
        `;
    const binds = {

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getComplainCount(seller_id) {
    const sql = `
        SELECT COUNT(*) AS COUNT
        FROM STORAGE S JOIN COMPLAIN C 
        ON(S.PRODUCT_ID = C.PRODUCT_ID)
        AND S.SELLER_ID = :seller_id
        `;
    const binds = {
        seller_id: seller_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getTotalProducts(seller_id) {
    const sql = `
        SELECT COUNT(*) AS COUNT
        FROM STORAGE S
        WHERE SELLER_ID = :seller_id
        `;
    const binds = {
        seller_id: seller_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function banSeller(product_id) {
    const sql = `
        DELETE FROM SELLER WHERE SELLER_ID = 
        (
            SELECT SELLER_ID
            FROM PRODUCT P JOIN STORAGE S
            ON (P.PRODUCT_ID = S.PRODUCT_ID)
            AND P.PRODUCT_ID = :product_id
        )
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getBundleCount(s_id) {
    const sql = `
        SELECT COUNT(DISTINCT(bundle_id)) as COUNT
        FROM SUBSCRIPTION_HAS_BUNDLE
        WHERE BUNDLE_ID IS NOT NULL
        AND SUBSCRIPTION_ID = :s_id
        `;
    const binds = {
        s_id: s_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getProductCount(b_id) {
    const sql = `
        SELECT COUNT(DISTINCT(PRODUCT_ID)) as COUNT
        FROM BUNDLE
        WHERE PRODUCT_ID IS NOT NULL
        AND BUNDLE_ID = :b_id
        `;
    const binds = {
        b_id: b_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getSubscriberCount(s_id) {
    const sql = `
        SELECT COUNT(DISTINCT(BUYER_ID)) as COUNT
        FROM SUBSCRIPTION
        WHERE BUYER_ID IS NOT NULL
        AND SUBSCRIPTION_ID = :s_id
        `;
    const binds = {
        s_id: s_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function changeOrderStatus(order_id, status) {
    const sql = `
        UPDATE ORDER_TABLE SET ORDER_STATUS = :status
        WHERE ORDER_ID = :order_id
        `;
    const binds = {
        order_id: order_id,
        status: status

    }

    return (await database.execute(sql, binds, database.options));
}


async function addNewSubscriptionPlan(subscription_id, price, name) {
    const sql = `
        INSERT INTO SUBSCRIPTION_PLAN VALUES(:subscription_id,:price,:name)
        `;
    const binds = {
        subscription_id: subscription_id,
        price: price,
        name: name
    }

    return (await database.execute(sql, binds, database.options));
}
async function deleteSubscriptionPlan(subscription_id) {
    const sql = `
        DELETE FROM SUBSCRIPTION_PLAN WHERE SUBSCRIPTION_ID = :subscription_id
        `;
    const binds = {
        subscription_id: subscription_id,
    }

    return (await database.execute(sql, binds, database.options));
}

async function getSubscriptonPlans() {
    const sql = `
        SELECT * FROM SUBSCRIPTION_PLAN
        `;
    const binds = {
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function isInBundle(bundle_id, product_id) {
    const sql = `
        SELECT COUNT(*) as COUNT
        FROM BUNDLE
        WHERE product_id = :product_id
        AND
        bundle_id = :bundle_id
        `;
    const binds = {
        bundle_id: bundle_id,
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function isInSubscription(subscription_id, bundle_id) {
    const sql = `
        SELECT COUNT(*) as COUNT
        FROM SUBSCRIPTION_HAS_BUNDLE
        WHERE subscription_id = :subscription_id
        AND
        bundle_id = :bundle_id
        `;
    const binds = {
        bundle_id: bundle_id,
        subscription_id: subscription_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function addtoBundle(bundle_id, product_id) {
    const sql = `
        INSERT INTO BUNDLE
        VALUES(:bundle_id,:product_id)
        `;
    const binds = {
        bundle_id: bundle_id,
        product_id: product_id,
    }

    return (await database.execute(sql, binds, database.options));
}

async function addtoSubscription(subscription_id, bundle_id) {
    const sql = `
        BEGIN
	        ADD_BUNDLE_TO_SUBSCRIPTION(:subscription_id, :bundle_id);
        END;
        `;
    const binds = {
        subscription_id: subscription_id,
        bundle_id: bundle_id,
    }

    return (await database.execute(sql, binds, database.options));
}
async function deleteBundleFromSubscription(subscription_id, bundle_id) {
    const sql = `
        UPDATE SUBSCRIPTION_HAS_BUNDLE
        SET BUNDLE_ID = null
        WHERE SUBSCRIPTION_ID = :subscription_id
        AND BUNDLE_ID = :bundle_id
        `;
    const binds = {
        subscription_id: subscription_id,
        bundle_id: bundle_id,
    }

    return (await database.execute(sql, binds, database.options));
}
async function deleteBundleFromBUNDLE_DISCOUNT(bundle_id) {
    const sql = `
        DELETE FROM BUNDLE_DISCOUNT
        WHERE BUNDLE_ID = :bundle_id
        `;
    const binds = {
        bundle_id: bundle_id,
    }

    return (await database.execute(sql, binds, database.options));
}

async function getBundleItems(bundle_id) {
    const sql = `
        SELECT *
        FROM BUNDLE B JOIN PRODUCT P
        ON(B.PRODUCT_ID = P.PRODUCT_ID)

        WHERE B.BUNDLE_ID = :bundle_id
        
        `;
    const binds = {
        bundle_id: bundle_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getBundleDiscount(bundle_id) {
    const sql = `
        SELECT DISCOUNT
        FROM BUNDLE_DISCOUNT B
        WHERE BUNDLE_ID = :bundle_id
        `;
    const binds = {
        bundle_id: bundle_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}


async function getBundle(subscription_id) {
    const sql = `
        SELECT *
        FROM SUBSCRIPTION_HAS_BUNDLE
        WHERE SUBSCRIPTION_ID = :subscription_id
        
        `;
    const binds = {
        subscription_id: subscription_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getCategoryImage(category) {
    const sql = `
        SELECT *
        FROM CATEGORY_IMAGE
        WHERE CATEGORY = :category
        
        `;
    const binds = {
        category: category
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getComplain(product_id) {
    const sql = `
        SELECT *
        FROM COMPLAIN C JOIN PERSON P
        ON(C.PERSON_ID = P.PERSON_ID)
        WHERE PRODUCT_ID = :product_id
        
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllComplain() {
    const sql = `
        SELECT * 
        FROM COMPLAIN C JOIN PERSON P 
        ON(C.PERSON_ID = P.PERSON_ID) JOIN PRODUCT PR
        ON(C.PRODUCT_ID = PR.PRODUCT_ID)
        `;
    const binds = {

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function totalComplain(product_id) {
    const sql = `
        SELECT COUNT(*) AS COUNT
        FROM COMPLAIN
        WHERE PRODUCT_ID = :product_id
        
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getSellerRating(seller_id) {
    const sql = `
    SELECT AVG(R.RATING) as AVG
    FROM STORAGE S JOIN PRODUCT P
    ON(S.PRODUCT_ID = P.PRODUCT_ID) JOIN PRODUCT_REVIEW PR
    ON(P.PRODUCT_ID = PR.PRODUCT_ID) JOIN REVIEW R
    ON(R.REVIEW_ID = PR.REVIEW_ID)
    WHERE S.SELLER_ID = :seller_id
        `;
    const binds = {
        seller_id: seller_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function deleteItemFromBundle(bundle_id, product_id) {
    const sql = `
        DELETE FROM BUNDLE
        WHERE product_id = :product_id
        AND bundle_id = :bundle_id
   `;
    const binds = {
        bundle_id: bundle_id,
        product_id: product_id
    };
    (await database.execute(sql, binds, database.options));
    return;
}
async function updateBundleDiscount(bundle_id, discount) {
    const sql = `
        UPDATE BUNDLE_DISCOUNT SET DISCOUNT = :discount
        WHERE bundle_id = :bundle_id
   `;
    const binds = {
        bundle_id: bundle_id,
        discount: discount
    };
    (await database.execute(sql, binds, database.options));
    return;
}

async function updatePicture(category, img) {
    const sql = `
    BEGIN
	    UPDATE_PICTURE(:category,:img);
    END;
   `;
    const binds = {
        category: category,
        img: img
    };
    (await database.execute(sql, binds, database.options));
    return;
}
async function getSellerList() {
    const sql = `
        SELECT *
        FROM SELLER_APPROVAL
        
    `;
    const binds = {

    }
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getSellerById(SELLER_ID) {
    const sql = `
        SELECT *
        FROM PERSON
        WHERE PERSON_ID = :SELLER_ID
    `;
    const binds = {
        SELLER_ID: SELLER_ID
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    getOrderList,
    changeOrderStatus,
    getSubscriptonPlans,
    addNewSubscriptionPlan,
    deleteSubscriptionPlan,
    isInBundle,
    addtoBundle,
    getBundleItems,
    deleteItemFromBundle,
    getBundle,
    addtoSubscription,
    isInSubscription,
    deleteBundleFromSubscription,
    getBundleCount,
    getSubscriberCount,
    getProductCount,
    deleteBundleFromBUNDLE_DISCOUNT,
    getBundleDiscount,
    updateBundleDiscount,
    updatePicture,
    getCategoryImage,
    getComplain,
    totalComplain,
    getAllComplain,
    getOrderList,
    changeOrderStatus,
    getSellerList,
    getSellerById,
    banItem,
    banSeller,
    getAdminSellerList,
    getComplainCount,
    getTotalProducts,
    getSellerRating
}


