const database = require('./database');




// const sql = `
// SELECT DISTINCT P.Category
// FROM STORAGE S JOIN PRODUCT P 
// ON(S.PRODUCT_ID = P.PRODUCT_ID )
// JOIN SELLER SL
// ON(SL.SELLER_ID = S.SELLER_ID)
// WHERE 
//     SL.SELLER_NAME = :name
// `;

// async function getOrderList(ID) {
//     const sql = `
//         SELECT T3.ORDER_ID, T3.ORDER_DATE, T3.ORDER_STATUS,T2.PRODUCT_ID
//         FROM CART T1
//         JOIN STORAGE T2
//         ON T1.PRODUCT_ID = T2.PRODUCT_ID
//         JOIN ORDER_TABLE T3
//         ON T3.ORDER_ID = T1.CART_ID
//         WHERE T3.ORDER_STATUS <> 'Delivered'
//         AND T2.SELLER_ID = ID
//         ORDER BY T3.ORDER_DATE DESC
//         `;
//     const binds = {
//         ID:ID
//     }

//     return (await database.execute(sql, binds, database.options)).rows;
// }

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

async function getAllCategories(seller_id) {

    const sql = `
        SELECT DISTINCT P.Category
        FROM STORAGE S
        JOIN PRODUCT P
        ON S.PRODUCT_ID = P.PRODUCT_ID
        JOIN PERSON PS
        ON S.SELLER_ID = PS.PERSON_ID
        WHERE S.SELLER_ID = :seller_id
        `;
    const binds = {
        seller_id: seller_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
// async function getAllProducts(category, name) {
//     const sql = `
//         SELECT *
//         FROM (STORAGE S JOIN PRODUCT P 
//         ON(S.PRODUCT_ID = P.PRODUCT_ID))
//         JOIN PERSON PS
//         ON(S.SELLER_ID = PS.PERSON_ID)
//         WHERE P.CATEGORY = :category
//         AND PS.NAME = :name

//         `;
//     const binds = {
//         category: category,
//         name: name
//     }

//     return (await database.execute(sql, binds, database.options)).rows;
// }
async function getAllProducts(category, id) {
    const sql = `
        SELECT *
        FROM (STORAGE S JOIN PRODUCT P 
        ON(S.PRODUCT_ID = P.PRODUCT_ID))
        JOIN PERSON PS
        ON(S.SELLER_ID = PS.PERSON_ID)
        WHERE P.CATEGORY = :category
        AND S.SELLER_ID = :id
        
        `;
    const binds = {
        category: category,
        id: id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function addProduct(product, user) {
    const sql = `
        INSERT INTO
            PRODUCT(PRODUCT_ID, NAME, PRICE, CATEGORY, QUANTITY, TOTAL_SALES)
        VALUES
            (:product_id, :name, :price, :category, :quantity, :total_sales)
    `;
    const binds = {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        total_sales: product.total_sales,

    }
    const storage_sql = `
        INSERT INTO
            STORAGE(PRODUCT_ID, SELLER_ID)
        VALUES
            (:product_id, :seller_id)
    `;
    const storage_binds = {
        product_id: product.product_id,
        seller_id: user.seller_id,
    }
    await database.execute(storage_sql, storage_binds, {});

    return await database.execute(sql, binds, {});
}


async function editProduct(name, price, quantity, product_id) {
    const sql = `
        
        UPDATE PRODUCT SET 
        NAME = :name,
        PRICE = :price,
        QUANTITY = :quantity

        WHERE PRODUCT_ID = :product_id
    `;
    const binds = {
        product_id: product_id,
        name: name,
        price: price,
        quantity: quantity,
    }


    return await database.execute(sql, binds, {});
}

async function getAllProductsByTag(tag, id) {
    const sql = `
        SELECT *
        FROM (STORAGE S JOIN PRODUCT P
        ON (S.PRODUCT_ID = P.PRODUCT_ID))
        JOIN PERSON PS
        ON(S.SELLER_ID = PS.PERSON_ID)
         WHERE ((( UPPER(P.NAME) LIKE '%'||:tag||'%')
         OR
         ( UPPER(P.category) LIKE '%'||:tag||'%')))
         AND 
         (S.SELLER_ID = :id)
        `;
    const binds = {
        tag: tag,
        id: id
    }

    return (await database.execute(sql, binds, database.options)).rows;
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
async function getProductId(p_name) {
    const sql = `
        SELECT PRODUCT_ID
        FROM PRODUCT
        WHERE NAME = :p_name
        `;
    const binds = {
        p_name: p_name
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

async function addToStock(product_id, quantity) {
    const sql = `
        UPDATE PRODUCT SET QUANTITY = QUANTITY + :quantity
        WHERE PRODUCT_ID = :product_id
        `;
    const binds = {
        product_id: product_id,
        quantity: quantity

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

//hahahahahahahahaha vdx
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

async function getOrder(user_id) {

    const sql = `

    SELECT *
    FROM ORDER_TABLE O JOIN CART C
    ON(O.ORDER_ID = C.CART_ID) JOIN PRODUCT P
    ON(C.PRODUCT_ID = P.PRODUCT_ID)
    JOIN STORAGE S
    ON(S.PRODUCT_ID = P.PRODUCT_ID)
    WHERE S.SELLER_ID = :user_id
    AND O.ORDER_STATUS <> 'Delivered'

   `;
    const binds = {
        user_id: user_id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getWishlist(user_id) {

    const sql = `

    SELECT *
    FROM WISHLIST W JOIN PRODUCT P
    ON(W.PRODUCT_ID = P.PRODUCT_ID)
    JOIN STORAGE S
    ON(S.PRODUCT_ID = P.PRODUCT_ID)
    WHERE S.SELLER_ID = :user_id
    AND W.STATUS <> 'Approved'

   `;
    const binds = {
        user_id: user_id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getDeliveredOrder(user_id) {

    const sql = `

    SELECT *
    FROM ORDER_TABLE O JOIN CART C
    ON(O.ORDER_ID = C.CART_ID) JOIN PRODUCT P
    ON(C.PRODUCT_ID = P.PRODUCT_ID)
    JOIN STORAGE S
    ON(S.PRODUCT_ID = P.PRODUCT_ID)
    WHERE S.SELLER_ID = :user_id
    AND O.ORDER_STATUS = 'Delivered'

   `;
    const binds = {
        user_id: user_id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAcceptedOrder(user_id) {

    const sql = `

    SELECT *
    FROM WISHLIST W JOIN PRODUCT P
    ON(W.PRODUCT_ID = P.PRODUCT_ID)
    JOIN STORAGE S
    ON(S.PRODUCT_ID = P.PRODUCT_ID)
    WHERE S.SELLER_ID = :user_id
    AND W.STATUS = 'Approved'

   `;
    const binds = {
        user_id: user_id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}



async function changeWishlistStatus(product_id, status) {
    const sql = `
        UPDATE WISHLIST SET STATUS = :status
        WHERE PRODUCT_ID = :product_id
        `;
    const binds = {
        product_id: product_id,
        status: status

    }

    return (await database.execute(sql, binds, database.options));
}

async function getComplainlist(user_id) {

    const sql = `

    SELECT *
    FROM COMPLAIN C JOIN PRODUCT P
    ON(C.PRODUCT_ID = P.PRODUCT_ID)
    JOIN STORAGE S
    ON(S.PRODUCT_ID = P.PRODUCT_ID)
    WHERE S.SELLER_ID = :user_id
   

   `;
    const binds = {
        user_id: user_id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}
async function updatePicture(category, img, p_id) {
    const sql = `
    BEGIN
	    UPDATE_PICTURE_SELLER(:category,:img,:p_id);
    END;
   `;
    const binds = {
        category: category,
        img: img,
        p_id: p_id
    };
    (await database.execute(sql, binds, database.options));
    return;
}
module.exports = {
    getAllCategories,
    getAllProducts,
    getProductDetails,
    addToStock,
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
    addProduct,
    getOrderList,
    getProductsByCartId,
    getOrder,
    getDeliveredOrder,
    updatePicture,
    editProduct,
    getAcceptedOrder,
    getWishlist,
    changeWishlistStatus,
    getComplainlist,
    getProductId
}