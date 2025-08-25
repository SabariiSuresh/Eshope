
const express = require('express');
const cors = require('cors');
const {connectDb} = require('./dataBase/mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

const indexRoutes = require('./routes/indexRoutes');

app.use('/' , indexRoutes);

connectDb().then(()=>{
    app.listen(PORT , ()=> console.log("Server is running" + PORT));
}).catch((error)=> console.error("Failed to connect server" + error.message));