var jwt = require('jwt-simple')
    ,config = require('../config')
    ,moment = require('moment')
    ,User = require('../models/user');

var isAuthenticated = function(req, res, next) {
  if (!req.header('Authorization')) {
    return next({ status: 401, message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];
  var payload = null;
  try {
    payload = jwt.decode(token, config.SESSION_SECRET);
  }
  catch (err) {
    return next({ status: 401, message: err.message });
  }
  if (payload.exp <= moment().unix()) {
    next({status: 401, message: "Token has expired"});
  }
  req.user = payload.sub;
  next();
}
var isStaff  = function(req, res, next) {
  User.findOne({_id: req.user},function(err, user){
    if(err) {
      next({status: 403, message: "Forbidden"});
    }
    if(!user.isStaff) {
      next({status: 403, message: "Forbidden"});
    }
    next();
  });
}
module.exports.isAuthenticated = isAuthenticated;
module.exports.isStaff = isStaff;