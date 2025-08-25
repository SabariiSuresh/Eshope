
const moongoose = require('mongoose');
require('dotenv').config();

async function connectDb() {
    
    try{

        await moongoose.connect( process.env.MONGO_URL , {
            dbName : 'eShop-db'
        });

        console.log("Mongoose connected");
        
    } catch (err){

        console.error("Error to connect DB" + err.message);

    }

}


module.exports = {connectDb};