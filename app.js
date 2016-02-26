var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');

var routes = require('./routes');


var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({origin:'http://localhost:8000',credentials:true}));
app.use(session({secret: '7949b861-b29a-4d98-9ebc-4ef00a854a93',httpOnly: true,saveUninitialized: true, resave: true,cookie: { maxAge: 1800000 }}));



app.use('/', routes);

module.exports = app;
