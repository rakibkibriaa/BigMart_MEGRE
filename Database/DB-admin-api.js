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

module.exports = {
    getOrderList,
    changeOrderStatus,
}