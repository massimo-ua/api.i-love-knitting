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
var files = require('./routes/files');
var auth = require('./routes/auth');
var mongoose = require('mongoose');
var install = require('./install');
mongoose.connect(config.DB_URI+config.DB_NAME);
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
app.use('/files', files);
app.use('/auth', auth);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
