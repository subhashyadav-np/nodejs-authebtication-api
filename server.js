// load .env file
require('dotenv').config({ path: '.env' });

// node packages
const express = require('express');
const bodyParser = require("body-parser");

// db connection file
const connectDB = require('./server/database/connection');

// init express
const app = express();

// use express json
app.use(express.json());

// body-parser to parse request from html body
app.use(bodyParser.urlencoded({ extended: true }));


// load routers
app.use('/api', require('./server/routes/api'));


// getting port value from config.env file else port value is 3000
const PORT = process.env.PORT || 3000;
// getting hostname from .env file else hostname is localhost
const HOSTNAME = process.env.HOSTNAME || 'localhost';

// start listnening the appp
app.listen(PORT, HOSTNAME, () => {

    // show msg in console that server is runninr
    console.log(`Server is running on http://${HOSTNAME}:${PORT}`);

    // connect Database mongodb
    connectDB();

});