var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var config = require('./config');
var routes = require('./routes');
var items = require('./routes/items');
//var mongoose = require('mongoose');
//var install = require('./install');
//mongoose.connect(config.DB_URI+config.DB_NAME);
//install.generateItem();

var app = express();

app.use(favicon(__dirname + config.DS + config.STATIC_DIR + config.DS + 'favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, config.STATIC_DIR)));

app.use(cors({origin:'http://localhost:8000',credentials:true}));
app.use(session({secret: config.SESSION_SECRET, httpOnly: true, saveUninitialized: true, resave: true,cookie: { maxAge: 1800000 }}));



app.use('/', routes);
app.use('/api', items);

module.exports = app;
