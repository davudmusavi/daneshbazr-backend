const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const passport = require('passport');
const cors = require('cors');
const fileUpload = require('express-fileupload');
var path = require('path');
const compression = require("compression");

module.exports = class Application {
    constructor() {
        this.setupExpress();
        this.setConfig();
        this.connectDB();
    }

    setupExpress() {
        const server = http.createServer(app);
        server.listen(3000, () => console.log('Listening on port 3000'));
        // server.listen(3030, () => console.log('Listening on port 3030'));
    }

    setConfig() {
        app.use(cors());
        dotenv.config();
        app.use(bodyParser.json()); 
        app.use(bodyParser.urlencoded({ extended : true }));
        app.use(passport.initialize());
        
        app.use(fileUpload({
            createParentPath: true
        }));

        app.use(compression()); // Compress all routes

        app.use(require('./routes'));
        app.use('/media', express.static(path.join(__dirname, "../myUpload/")));
    }

    connectDB() {
        const password = "xxWdu9GcEZ%23ukDwR4A3r";
        const mongodb = 'admin';
        const mongodb_user = 'admin';
        const service_address = 'db-mongo-awt-service';

        mongoose.Promise = global.Promise;
        // mongoose.connect('mongodb://127.0.0.1/daneshbazr');
         mongoose.connect(`mongodb://${mongodb_user}:${password}@${service_address}/${mongodb}`)
    }
}