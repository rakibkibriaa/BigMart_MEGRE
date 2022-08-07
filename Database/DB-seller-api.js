const database = require('./database');

async function getAllCategories(name) {

    const sql = `
        SELECT DISTINCT Category
        FROM STORAGE S JOIN PRODUCT P
        ON(S.PRODUCT_NAME = P.NAME)
        WHERE 
            S.SELLER_NAME = :name

        `;
    const binds = {
        name: name
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProducts(category, name) {
    const sql = `
        SELECT *
        FROM STORAGE S JOIN PRODUCT P
        ON(S.PRODUCT_NAME = P.NAME)
        WHERE P.CATEGORY = :category
        AND S.SELLER_NAME = :name
        
        `;
    const binds = {
        category: category,
        name: name
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProductsByTag(tag) {
    const sql = `
        SELECT *
        FROM STORAGE
         WHERE ( UPPER(NAME) LIKE '%'||:tag||'%')
         OR
         ( UPPER(category) LIKE '%'||:tag||'%')
        `;
    const binds = {
        tag: tag
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

async function addToOrder(order_id, person_id, dateOfOrder,status) {

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
}