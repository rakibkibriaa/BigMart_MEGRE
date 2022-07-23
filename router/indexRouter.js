// libraries
const express = require('express');
//const marked = require('marked');

const router = express.Router({mergeParams : true});
const DB_auth = require('../Database/DB-auth-api');
const DB_Buyer = require('../Database/DB-buyer-api')
const crypto = require('crypto');


let person_id;
let USER_NAME = null
let CART_ID = null

router.get('/',(req,res)=>{
    res.render('index.ejs')
})


router.get('/sign_up',(req,res)=>{
    res.render('sign_up.ejs')
})


router.post('/products',async (req,res)=>{

    let products = await DB_Buyer.getAllProducts(req.body.category);
    res.render('products.ejs',{value: products})

})


router.post('/item',async(req,res)=>
{
    let result1 = await DB_Buyer.getProductDetails(req.body.product_id)
    res.render('item.ejs',{
        value: result1[0]
    })
})



router.post('/item/cart',async(req,res)=>{
   
    

    let result = JSON.parse(req.body.product)


    let product_id = result.PRODUCT_ID;


    let isInCart = await DB_Buyer.isInCart(person_id,product_id)

    let quantity = req.body.quantity
    
    let buttonPressed = req.body.butt;

    if(buttonPressed == 1)
    {
        if(isInCart[0].COUNT === 0 && quantity > 0)
        {
            await DB_Buyer.addToCart(person_id,product_id,quantity)
        }
        else if(quantity == 0)
        {
            console.log('give valid quantity')
        }
        else
        {
            console.log('Already Added')
        }
    }
    else if(buttonPressed == 2)
    {
        console.log('butt2')
    }
    else if(buttonPressed == 3)
    {
        let category = req.body.category
        let products = await DB_Buyer.getAllProducts(category);

        return  res.redirect('/login');
    }

    return res.sendStatus(204);

})

router.post('/search',async(req,res)=>
{
    let tag = (req.body.tag)
    

    let products = await DB_Buyer.getAllProductsByTag(tag.toUpperCase())

    console.log(products)
   
    res.render('search.ejs',{value: products, tag: tag})

})

router.get('/logged_in',async(req,res)=>{

   
    if(USER_NAME === null)
    {
        console.log('not logged in')
        res.redirect('/')
    }
    else
    {
        
        let categories = await DB_Buyer.getAllCategories()
       
        res.render('logged_in.ejs',{value: categories})
    }
})

router.post('/logged_in',async (req,res)=>{

    if(USER_NAME !== null)
    {
        return res.redirect('/logged_in')
    }

   if(req.body.from === 'signup')
   {
        console.log("it reaches");
        const uuid = crypto.randomBytes(16).toString('hex');
        USER_NAME = req.body.username
        person_id = uuid
        
        let user = {
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            address: req.body.address,
            username: req.body.username,
            id: uuid,
            type: req.body.type
        }
        console.log(user.name);
        console.log(user.password);
        console.log(user.email);
        console.log(user.address);
        console.log(user.username);

        await DB_auth.createNewUser(user);

        let categories = await DB_Buyer.getAllCategories()
    
    
        res.render('logged_in.ejs',{value: categories})

   }
   
   else 
   {

        

        let username = req.body.username;
        let password = req.body.password;

        USER_NAME = username;
        //console.log(username)
        //console.log(password)

        let results; 
        results = await DB_auth.getLoginInfoByUsername(username);

        
        person_id = results[0].PERSON_ID;

        let pass_db = results[0].PASSWORD;
        

        

        if(password === pass_db)
        {
            
            let categories = await DB_Buyer.getAllCategories()
            
            
            res.render('logged_in.ejs',{value: categories})
        }
        else
        {
                return res.redirect('/');
        }

   }

   
    
})



module.exports = router;