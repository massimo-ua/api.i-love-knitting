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
router.route('/:id')
.put(function(req, res) {
  User.findOne({_id: req.params.id},function(err, user){
    if(err) res.send(err);
      for(property in req.body) {
        //console.log(req.body[property]);
        user[property] = req.body[property];
      }
      user.save(function(err) {
        if(err) {
          console.log(err);
          res.send(err);
        }
        else {
          res.json({status: "OK", message: "User updated successfully!"});
        }
      });
  });
})
module.exports=router;