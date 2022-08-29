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

async function getSellerList(){
    const sql = `
        SELECT *
        FROM SELLER_APPROVAL
        
    `;
    const binds = {
        
    }
    return (await database.execute(sql, binds, database.options)).rows;
}
async function getSellerById(SELLER_ID){
    const sql = `
        SELECT *
        FROM PERSON
        WHERE PERSON_ID = :SELLER_ID
    `;
    const binds = {
        SELLER_ID : SELLER_ID
    }
    return (await database.execute(sql, binds, database.options)).rows;
}
module.exports = {
    getOrderList,
    changeOrderStatus,
    getSellerList,
    getSellerById
}