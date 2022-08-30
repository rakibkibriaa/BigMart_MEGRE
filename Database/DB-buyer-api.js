const database = require('./database');

async function getAllCategories() {
    const sql = `
        SELECT  *
        FROM 
        (
            SELECT CATEGORY
            FROM PRODUCT 
            GROUP BY CATEGORY
        ) T JOIN 

        (

            SELECT CATEGORY,IMAGE_SRC
            FROM CATEGORY_IMAGE

        ) K 
        ON(T.CATEGORY = K.CATEGORY)
        `;
    const binds = {

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProducts(category) {
    const sql = `
        SELECT *
        FROM PRODUCT
        WHERE category = :category
        `;
    const binds = {
        category: category
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getRemaining(product_id) {
    const sql = `
        SELECT QUANTITY
        FROM PRODUCT
        WHERE PRODUCT_ID = :product_id
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProductsByTag(tag) {
    const sql = `
        SELECT *
        FROM PRODUCT
         WHERE ( UPPER(NAME) LIKE '%'||:tag||'%')
         OR
         ( UPPER(category) LIKE '%'||:tag||'%')
        `;
    const binds = {
        tag: tag
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function addComplain(person_id, product_id, msg) {
    const sql = `
        INSERT INTO COMPLAIN VALUES (:person_id,:product_id,:msg)
        `;
    const binds = {
        person_id: person_id,
        product_id: product_id,
        msg: msg
    }

    return (await database.execute(sql, binds, database.options));
}
async function getProductDetails(p_id) {
    const sql = `
        SELECT *
        FROM PRODUCT
        WHERE product_id = :p_id
        `;
    const binds = {
        p_id: p_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getSeller(p_id) {
    const sql = `
        SELECT *
        FROM STORAGE S JOIN SELLER SL
        ON S.SELLER_ID = SL.SELLER_ID
        JOIN PERSON P
        ON SL.SELLER_ID = P.PERSON_ID
        WHERE S.PRODUCT_ID = :p_id
        `;
    const binds = {
        p_id: p_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function isInCart(person_id, product_id) {
    const sql = `
        SELECT COUNT(*) as COUNT
        FROM Cart
        WHERE product_id = :product_id
        AND
        person_id = :person_id
        AND CART_ID IS NULL
        `;
    const binds = {
        person_id: person_id,
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function addToCart(person_id, product_id, quantity, cart_id) {
    const sql = `
        INSERT INTO Cart
        VALUES(:person_id,:product_id, :quantity, :cart_id)
        `;
    const binds = {
        person_id: person_id,
        product_id: product_id,
        quantity: quantity,
        cart_id: cart_id

    }

    return (await database.execute(sql, binds, database.options));
}
async function updateCart(person_id, product_id, quantity) {
    const sql = `
        UPDATE CART SET QUANTITY = QUANTITY + :quantity
        WHERE PERSON_ID = :person_id AND
        PRODUCT_ID = :product_id AND
        CART_ID IS NULL
        `;
    const binds = {
        person_id: person_id,
        product_id: product_id,
        quantity: quantity,

    }

    return (await database.execute(sql, binds, database.options));
}
async function editCart(person_id, product_id, quantity) {
    const sql = `
        UPDATE CART SET QUANTITY = :quantity
        WHERE PERSON_ID = :person_id AND
        PRODUCT_ID = :product_id AND
        CART_ID IS NULL
        `;
    const binds = {
        person_id: person_id,
        product_id: product_id,
        quantity: quantity,

    }

    return (await database.execute(sql, binds, database.options));
}

async function addToOrder(order_id, person_id, dateOfOrder, status) {

    const sql = `
        INSERT INTO ORDER_TABLE
        VALUES(:order_id,:person_id,:dateOfOrder,:status)
        `;
    const binds = {
        person_id: person_id,
        order_id: order_id,
        dateOfOrder: dateOfOrder,
        status: status
    }

    return (await database.execute(sql, binds, database.options));
}



async function addBuyerToSubscription(subscription_id, person_id) {

    const sql = `
        BEGIN
	        ADD_USER_TO_SUBSCRIPTION(:subscription_id, :person_id);
        END;
        `;
    const binds = {
        subscription_id: subscription_id,
        person_id: person_id,
    }

    return (await database.execute(sql, binds, database.options));
}


async function getCartItems(person_id) {
    const sql = `
        SELECT *
        FROM Cart C JOIN PRODUCT P
        ON (C.PRODUCT_ID = P.PRODUCT_ID)
        
        WHERE C.PERSON_ID = :person_id
        AND C.CART_ID IS NULL

        `;
    const binds = {
        person_id: person_id,

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function avgRating(product_id) {
    const sql = `
        SELECT AVG(R.RATING) as AVG
        FROM REVIEW R JOIN PRODUCT_REVIEW PR
        ON(R.REVIEW_ID = PR.REVIEW_ID)
        GROUP BY (PR.PRODUCT_ID)
        HAVING PR.PRODUCT_ID = :product_id
        `;
    const binds = {
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function addReview(msg, review_id, person_id, product_id, rating) {
    const sql = `
        BEGIN
            ADD_REVIEW(:msg,:review_id,:person_id,:product_id,:rating);
        END;
        `;
    const binds = {
        person_id: person_id,
        review_id: review_id,
        msg: msg,
        product_id: product_id,
        rating: rating
    }

    return (await database.execute(sql, binds, database.options));
}

async function IsInOrder(person_id) {
    const sql = `
        SELECT COUNT(*) AS COUNT
        FROM CART
        WHERE PERSON_ID = :person_id
        AND CART_ID IS NULL
        `;
    const binds = {
        person_id: person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getReviews(product_id) {
    const sql = `
        SELECT R.MSG,P.NAME,R.RATING,P.PERSON_ID,R.REVIEW_ID
        FROM PRODUCT_REVIEW PRO_R JOIN PERSON_REVIEW PER_R
        ON(PRO_R.REVIEW_ID = PER_R.REVIEW_ID) JOIN REVIEW R
        ON(PER_R.REVIEW_ID = R.REVIEW_ID) JOIN PERSON P
        ON(P.PERSON_ID = PER_R.PERSON_ID) 
        AND PRO_R.PRODUCT_ID = :product_id

        `;
    const binds = {
        product_id: product_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function canReview(product_id, person_id) {
    const sql = `
        
        SELECT COUNT(*) AS COUNT

        FROM ORDER_TABLE O JOIN CART C
        ON(O.ORDER_ID = C.CART_ID)

        WHERE O.ORDER_STATUS = 'Delivered' AND O.PERSON_ID = :person_id AND C.PRODUCT_ID = :product_id

        `;
    const binds = {
        product_id: product_id,
        person_id: person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getBundle(person_id) {

    const sql = `
        
        SELECT SB.BUNDLE_ID
        FROM SUBSCRIPTION S JOIN SUBSCRIPTION_HAS_BUNDLE SB
        ON(S.SUBSCRIPTION_ID = SB.SUBSCRIPTION_ID)
        WHERE S.BUYER_ID = :person_id

        `;
    const binds = {

        person_id: person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getDiscount(bundle_id) {

    const sql = `
        
        SELECT DISCOUNT
        FROM BUNDLE_DISCOUNT
        WHERE BUNDLE_ID = :bundle_id

        `;
    const binds = {

        bundle_id: bundle_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function totalReview(product_id, person_id) {
    const sql = `
        
        SELECT COUNT(*) AS COUNT
        FROM PERSON_REVIEW PR JOIN PRODUCT_REVIEW P
        ON(PR.REVIEW_ID = P.REVIEW_ID) 
        WHERE PR.PERSON_ID = :person_id
        AND
        P.PRODUCT_ID = :product_id  

        `;
    const binds = {
        product_id: product_id,
        person_id: person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function deleteItemFromCart(person_id, product_id) {
    const sql = `
        DELETE FROM CART
        WHERE product_id = :product_id
        AND person_id = :person_id
   `;
    const binds = {
        person_id: person_id,
        product_id: product_id
    };
    (await database.execute(sql, binds, database.options));
    return;
}

async function updateReview(review_id, msg, rating) {
    const sql = `
        UPDATE REVIEW SET MSG = :msg, RATING = :rating
        WHERE REVIEW_ID = :review_id
   `;
    const binds = {
        review_id: review_id,
        msg: msg,
        rating: rating
    };
    (await database.execute(sql, binds, database.options));
    return;
}

async function myReview(person_id) {
    const sql = `
        SELECT *
        FROM PERSON_REVIEW PR JOIN REVIEW R 
        ON (PR.REVIEW_ID = R.REVIEW_ID) JOIN PRODUCT_REVIEW P
        ON (R.REVIEW_ID = P.REVIEW_ID) JOIN PRODUCT T ON (P.PRODUCT_ID = T.PRODUCT_ID)
        WHERE PR.PERSON_ID = :person_id
   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function myWishList(person_id) {
    const sql = `
        SELECT *
        FROM WISHLIST W JOIN PRODUCT P
        ON(W.PRODUCT_ID = P.PRODUCT_ID)
        WHERE PERSON_ID = :person_id
        AND STATUS <> 'Approved'
   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function myWishListAdded(person_id) {
    const sql = `
        SELECT *
        FROM WISHLIST W JOIN PRODUCT P
        ON(W.PRODUCT_ID = P.PRODUCT_ID)
        WHERE PERSON_ID = :person_id
        AND STATUS = 'Approved'
   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function isInWishlist(product_id) {
    const sql = `
        SELECT *
        FROM WISHLIST W JOIN PRODUCT P
        ON(W.PRODUCT_ID = P.PRODUCT_ID)
        WHERE W.PRODUCT_ID = :product_id
        AND STATUS = 'Pending'
   `;
    const binds = {
        product_id: product_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function updateWishlist(product_id, quantity) {
    const sql = `
        UPDATE WISHLIST SET QUANTITY = QUANTITY+  :quantity
        WHERE PRODUCT_ID = :product_id
   `;
    const binds = {
        product_id: product_id,
        quantity:quantity
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function deleteReview(review_id) {
    const sql = `
        DELETE FROM PERSON_REVIEW WHERE REVIEW_ID = :review_id
   `;
    const binds =
    {
        review_id: review_id,
    };
    (await database.execute(sql, binds, database.options));
    return;
}
async function getUserDetails(person_id) {
    const sql = `
        SELECT *
        FROM PERSON
        WHERE person_id = :person_id
   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getPreviousOrder(person_id) {

    const sql = `

    SELECT P.NAME as PRODUCT_NAME,O.ORDER_ID as CART_ID, C.QUANTITY as QUANTITY ,O.ORDER_DATE as ORDER_DATE
    FROM CART C JOIN ORDER_TABLE O
    ON (C.CART_ID = O.ORDER_ID)
    JOIN PRODUCT P
    ON C.PRODUCT_ID = P.PRODUCT_ID
    WHERE O.person_id = :person_id

    ORDER BY ORDER_DATE DESC
    
   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getCartIdOfOrder(person_id) {

    const sql = `

    SELECT DISTINCT(C.CART_ID) as CART_ID, O.ORDER_DATE AS ORDER_DATE, O.ORDER_STATUS AS ORDER_STATUS
    FROM ORDER_TABLE O JOIN CART C
    ON (O.ORDER_ID = C.CART_ID)
    WHERE O.PERSON_ID = :person_id

   `;
    const binds = {
        person_id: person_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getProductsByCartId(cart_id) {

    const sql = `

    SELECT P.PRODUCT_ID AS PRODUCT_ID , P.NAME as PRODUCT_NAME, C.QUANTITY AS QUANTITY, P.PRICE AS PRICE
    FROM CART C JOIN PRODUCT P
    ON  (C.PRODUCT_ID = P.PRODUCT_ID)
    WHERE C.CART_ID = :cart_id

   `;
    const binds = {
        cart_id: cart_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getOrderStatus(cart_id) {

    const sql = `
    SELECT O.ORDER_STATUS AS ORDER_STATUS
    FROM ORDER_TABLE O
    WHERE O.ORDER_ID = :cart_id
   `;
    const binds = {
        cart_id: cart_id,
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function isInSubscription(subscription_id, person_id) {
    const sql = `
        SELECT COUNT(*) as COUNT
        FROM SUBSCRIPTION
        WHERE subscription_id = :subscription_id
        AND
        BUYER_ID = :person_id
        `;
    const binds = {
        subscription_id: subscription_id,
        person_id: person_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getProductsByBundle(bundle_id) {
    const sql = `
        SELECT PRODUCT_ID
        FROM BUNDLE
        WHERE BUNDLE_ID = :bundle_id
        `;
    const binds = {
        bundle_id: bundle_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getPrice(person_id) {
    const sql = `
        SELECT SUM(C.QUANTITY * P.PRICE) AS SUM
        FROM CART C JOIN PRODUCT P
        ON(C.PRODUCT_ID = P.PRODUCT_ID)
        WHERE C.CART_ID IS NULL AND
        C.PERSON_ID = :person_id
        `;
    const binds = {
        person_id: person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function deleteBuyerFromSubscription(subscription_id, person_id) {
    const sql = `
        UPDATE SUBSCRIPTION
        SET BUYER_ID = null
        WHERE SUBSCRIPTION_ID = :subscription_id
        AND BUYER_ID = :person_id
        `;
    const binds = {
        subscription_id: subscription_id,
        person_id: person_id,
    }

    return (await database.execute(sql, binds, database.options));
}
async function addToWishList(person_id, product_id, quantity, status) {
    const sql = `
        INSERT INTO WISHLIST VALUES(:person_id,:product_id,:quantity,:status)
        `;
    const binds = {
        product_id: product_id,
        person_id: person_id,
        quantity: quantity,
        status: status

    }

    return (await database.execute(sql, binds, database.options));
}
async function addRating(review_id, person_id, product_id, rating) {
    const sql = `
        BEGIN
            ADD_REVIEW_V2(:review_id,:person_id,:product_id,:rating);
        END;
        `;
    const binds = {
        review_id: review_id,
        rating: rating,
        person_id: person_id,
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options));
}
module.exports = {
    getAllCategories,
    getAllProducts,
    getProductDetails,
    addToCart,
    isInCart,
    getAllProductsByTag,
    getCartItems,
    deleteItemFromCart,
    IsInOrder,
    addToOrder,
    getUserDetails,
    getPreviousOrder,
    getCartIdOfOrder,
    getProductsByCartId,
    getOrderStatus,
    addBuyerToSubscription,
    isInSubscription,
    deleteBuyerFromSubscription,
    addReview,
    getReviews,
    addRating,
    canReview,
    avgRating,
    updateReview,
    deleteReview,
    myReview,
    totalReview,
    getBundle,
    getProductsByBundle,
    getDiscount,
    getPrice,
    addToWishList,
    myWishList,
    myWishListAdded,
    addComplain,
    getSeller,

    getRemaining,
    updateCart,
    editCart,
    isInWishlist,
    updateWishlist
}