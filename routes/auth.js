var express = require('express')
	,router=express.Router()
	,jwt = require('jwt-simple')
	,config = require('../config')
	,moment = require('moment')
	,User = require('../models/user')
	,auth = require('../middleware/auth');

router.route('/login')
.post(function(req, res){
	User.findOne({ email: req.body.email }, '+password approved displayName isStaff', function(err, user) {
		if (!user) {
			return res.status(401).send({ message: 'Invalid email and/or password' });
		}
		user.comparePassword(req.body.password, function(err, isMatch) {
			if (!isMatch) {
				return res.status(401).send({ message: 'Invalid email and/or password' });
			}
			if (user.approved === false ) {
				return res.status(403).send({ message: 'Administrator did not confirm your account' });
			}
			res.send({ token: createJWT(user) });
		});
	});
});
router.route('/signup')
.post(function(req, res) {
	User.findOne({ email: req.body.email }, function(err, existingUser) {
		if (existingUser) {
			return res.status(409).send({ message: 'Email is already taken' });
		}
		var user = new User({
			displayName: req.body.displayName,
			email: req.body.email,
			password: req.body.password
		});
		user.save(function(err, result) {
			if (err) {
				res.status(500).send({ message: err.message });
			}
			res.send({ token: createJWT(result) });
		});
	});
});

router.route('/profile')
.get(auth.isAuthenticated, function(req, res) {
	User.findById(req.user, function(err, user) {
		res.json(user);
	});

})
.put(auth.isAuthenticated, function(req, res) {
	User.findById(req.user, function(err, user) {
		if(!user) {
			return res.status(400).send({ message: 'User not found' });
		}
      	for(property in req.body) {
        	item[property] = req.body[property];
      	}
		user.save(function(err, user) {
			if(err) next();
			res.send(user);
		});
	});
});

/*
Function that generates JWT from User object
*/
function createJWT(user) {
	var payload = {
		sub: user._id,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix(),
		displayName: user.displayName,
		isStaff: user.isStaff
	};
	return jwt.encode(payload, config.SESSION_SECRET);
}



module.exports = router;
