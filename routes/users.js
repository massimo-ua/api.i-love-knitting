var User = require('../models/user')
    ,express = require('express')
    ,router=express.Router()
    ,config = require('../config')
    ,isAuthenticated = require('../middleware/auth');

router.route('/')
.get(function(req, res, next) {
	var approved = ( req.query.type == undefined || req.query.type == 'new' ) ? false : true;
	User.find({approved: approved})
	.exec(function(err,users){
		if(err) {
        	next(err);
      	}
      	res.json(users);
	});
});

module.exports=router;