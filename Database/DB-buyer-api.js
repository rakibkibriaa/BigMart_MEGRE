const database = require('./database');

async function getAllCategories()
{
    const sql = `
        SELECT DISTINCT Category
        FROM PRODUCT
        `;
    const binds = {

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProducts(category)
{
    const sql = `
        SELECT *
        FROM PRODUCT
        WHERE category = :category
        `;
    const binds = {
        category : category
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getAllProductsByTag(tag)
{
    const sql = `
        SELECT *
        FROM PRODUCT
         WHERE ( UPPER(NAME) LIKE '%'||:tag||'%')
         OR
         ( UPPER(category) LIKE '%'||:tag||'%')
        `;
    const binds = {
        tag : tag
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getProductDetails(p_id)
{
    const sql = `
        SELECT *
        FROM PRODUCT
        WHERE product_id = :p_id
        `;
    const binds = {
        p_id : p_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function isInCart(person_id,product_id)
{
    const sql = `
        SELECT COUNT(*) as COUNT
        FROM Cart
        WHERE product_id = :product_id
        AND
        person_id = :person_id
        AND CART_ID IS NULL
        `;
    const binds = {
        person_id : person_id,
        product_id: product_id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function addToCart(person_id,product_id,quantity,cart_id)
{
    const sql = `
        INSERT INTO Cart
        VALUES(:person_id,:product_id, :quantity, :cart_id)
        `;
    const binds = {
        person_id : person_id,
        product_id : product_id,
        quantity : quantity,
        cart_id : cart_id
    }

    return (await database.execute(sql, binds, database.options));
}

async function addToOrder(order_id,person_id)
{
    const sql = `
        INSERT INTO ORDER_TABLE
        VALUES(:order_id,:person_id)
        `;
    const binds = {
        person_id : person_id,
        order_id : order_id
    }

    return (await database.execute(sql, binds, database.options));
}


async function getCartItems(person_id)
{
    const sql = `
        SELECT *
        FROM Cart C JOIN PRODUCT P
        ON (C.PRODUCT_ID = P.PRODUCT_ID)
        
        WHERE C.PERSON_ID = :person_id
        AND C.CART_ID IS NULL

        `;
    const binds = {
        person_id : person_id,

    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function IsInOrder(person_id)
{
    const sql = `
        SELECT COUNT(*) AS COUNT
        FROM CART
        WHERE PERSON_ID = :person_id
        AND CART_ID IS NULL
        `;
    const binds = {
        person_id : person_id

    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function deleteItemFromCart(person_id,product_id){
    const sql = `
        DELETE FROM CART
        WHERE product_id = :product_id
        AND person_id = :person_id
   `;
    const binds = {
        person_id:person_id,
        product_id:product_id
    };
    (await database.execute(sql, binds, database.options));
    return;
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
}