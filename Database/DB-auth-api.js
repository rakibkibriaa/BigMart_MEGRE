const database = require('./database');



// function to get id from email
async function getUserIDByEmail(email) {
    const sql = `
        SELECT 
            ID
        FROM 
            Person
        WHERE 
            EMAIL = :email
        `;
    const binds = {
        email: email
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function dupUsername(username) {
    const sql = `
        SELECT 
            *
        FROM 
            Person
        WHERE 
            USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getUserIDByUserName(username) {
    const sql = `
        SELECT 
            Person_id
        FROM 
            Person
        WHERE 
            USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
// function to creat new user
// user should have handle, email, pass, dob
// {id} will be returned
async function createNewUser(user) {
    const sql = `
        INSERT INTO
            Person(PERSON_ID, NAME,USERNAME, EMAIL, PASSWORD,ADDRESS)
        VALUES
            (:person_id ,:name,:username, :email,:password,:address)
    `;
    const binds = {
        name: user.name,
        email: user.email,
        password: user.password,
        address: user.address,
        username: user.username,
        person_id: user.id,

    }
    console.log(user.type)
    if (user.type.localeCompare('buyer') === 0) {
        const sql_buyer = `
            INSERT INTO
                Buyer(buyer_id)
            VALUES
                (:buyer_id)
        `;
        const binds_buyer = {
            buyer_id: user.id
        }
        await database.execute(sql_buyer, binds_buyer, {});
    }
    
    else if (user.type.localeCompare('seller') === 0) {
        const sql_seller = `
            INSERT INTO
                SELLER_APPROVAL(seller_id)
            VALUES
                (:seller_id)
        `;
        const binds_seller = {
            seller_id: user.id
        }
        await database.execute(sql_seller, binds_seller, {});
    }
    console.log("it reaches before sql");
    return await database.execute(sql, binds, {});
}



async function getLoginInfoByEmail(email) {
    const sql = `
        SELECT 
            ID,
            NAME,
            PASSWORD
        FROM
            Person
        WHERE
            EMAIL = :email
    `;
    const binds = {
        email: email
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function getLoginInfoByUsername(username) {
    const sql = `
        SELECT 
            *
        FROM 
            Person
        WHERE 
            USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function getIDByUsername(username) {
    const sql = `
        SELECT 
            PERSON_ID
        FROM 
            Person
        WHERE 
            USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}



async function isInAdmin(username) {
    const sql = `
        SELECT 
            *
        FROM 
            Person P JOIN ADMIN A
        ON (P.PERSON_ID = A.ADMIN_ID)
        WHERE 
            P.USERNAME = :username
        `;
    const binds = {
        username: username
    } 

    return (await database.execute(sql, binds, database.options)).rows;
}

async function isInBuyer(username) {
    const sql = `
        SELECT 
            *
        FROM 
            Person P JOIN BUYER B
            ON(P.PERSON_ID = B.BUYER_ID)
        WHERE 
            P.USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

async function isInSeller(username) {
    const sql = `
        SELECT 
            *
        FROM 
            Person P JOIN SELLER S
            ON(P.PERSON_ID = S.SELLER_ID)
        WHERE 
            P.USERNAME = :username
        `;
    const binds = {
        username: username
    }

    return (await database.execute(sql, binds, database.options)).rows;
}
async function waiting(username){
    const sql = `
    SELECT 
        *
    FROM 
        Person P JOIN SELLER_APPROVAL S
        ON(P.PERSON_ID = S.SELLER_ID)
    WHERE 
        P.USERNAME = :username
    `;
const binds = {
    username: username
}

return (await database.execute(sql, binds, database.options)).rows;   
}

async function addSeller(seller_id){
    const sql = `
        INSERT INTO 
            SELLER(SELLER_ID)
        VALUES(:seller_id)
    `;
    const binds = {
        seller_id : seller_id
    }
    return (await database.execute(sql, binds, {}));
}
async function deleteSeller(seller_id){
    const sql = `
        DELETE FROM
            PERSON
        WHERE PERSON_ID = :seller_id
    `;
    const binds = {
        seller_id : seller_id
    }
    return (await database.execute(sql,binds, {}));
}
async function deleteApproval(seller_id){
    const sql = `
        DELETE FROM
            SELLER_APPROVAL
        WHERE SELLER_ID = :seller_id
    `;
    const binds = {
        seller_id : seller_id
    }
    return (await database.execute(sql,binds, {}));
}

async function getLoginInfoByID(id) {
    const sql = `
        SELECT 
            *
        FROM
            Person
        WHERE
            PERSON_ID = :id
    `;
    const binds = {
        id: id
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    getUserIDByEmail,
    createNewUser,
    getLoginInfoByEmail,
    getLoginInfoByID,
    getUserIDByUserName,
    getLoginInfoByUsername,
    isInAdmin,
    isInBuyer,
    isInSeller,
    waiting,
    addSeller,
    deleteSeller,
    deleteApproval,
    getIDByUsername,
    dupUsername
}