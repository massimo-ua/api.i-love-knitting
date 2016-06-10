var Item = require('../models/item')
    ,Comment = require('../models/comment')
    ,Rate = require('../models/rate')
    ,File = require('../models/file')
    ,User = require('../models/user')
    ,express = require('express')
    ,async = require('async')
    ,router=express.Router()
    ,config = require('../config')
    ,isAuthenticated = require('../middleware/auth');

router.route('/items')
  .get(function(req, res, next) {
    //res.send('/api/items');
    Item.find({})
    .populate('comments')
    .populate('images')
    .populate('author')
    .lean()
    .exec(function(err, items) {
      if(err) {
        res.send(err);
      }
      async.forEachOf(items, function(item, index, callback) {
        GetItemRating(item._id, function(err, rate) {
          if (err) return callback(err);
          try {
            items[index].rates = rate;
          } catch(e) {
            return callback(e);
          }
          callback();
        });
      }, function(err) {
        if(err) return next(err);
        res.json(items);
      });
    });
  })
  .post(isAuthenticated, function(req, res, next) {
    var item = new Item();
    item.title = req.body.title;
    item.content = req.body.content;
    item.price = req.body.price;
    item.author = req.body.author;
    item.images = req.body.images;
    item.save(function(err){
      if(err) {
        res.send({status: 'ERR', data: err});
      }
      res.send({status: 'OK', data: item });
    });

  });
router.route('/items/:id')
.get(function(req, res){
  Item.findOne({_id: req.params.id})
  .lean()
  .populate({
    path: 'comments',
    match: {isDisabled: false},
    options: { sort: '-datePublished' }
   })
  .populate('images')
  .populate('author')
  .exec(function(err, item){
    if(err) res.send(err);
    GetItemRating(item._id,function(err,rate){
      if(err) res.send(err);
      item.rates = rate;
      res.json(item);
    });
  });
})
.put(isAuthenticated, function(req, res) {
  Item.findOne({_id: req.params.id, author: req.user},function(err, item){
    if(err) res.send(err);
      for(property in req.body) {
        //console.log(req.body[property]);
        item[property] = req.body[property];
      }
      item.save(function(err) {
        if(err) {
          console.log(err);
          res.send(err);
        }
        else {
          res.json({status: "OK", message: "Item updated successfully!"});
        }
      });
  });
})
.delete(isAuthenticated, function(req, res) {
  Item.remove({ _id: req.params.id, author: req.user }, function(err, item){
    if(err) res.send(err);
    res.send({status: "OK", message: "Item successfully deleted"});
  });
})
.options(function(req, res) {
  res.status(200).send();
});
router.route('/items/:id/comments')
.post(function(req, res) {
  Item.findOne({_id: req.params.id},function(err, item){
    if(err) res.send(err);
    var comment = new Comment();
    comment.content = req.body['content'];
    comment.author = req.body['author'];
    comment.item = req.params.id;
    comment.save(function(err) {
      //console.log(item);
      if(err) res.send(err);
        item.comments.push(comment);
        item.save(function(err) {
          if(err) console.log(err);
          res.json({status: "OK"});
        });
      });
  });
  });
  router.route('/items/:id/ratings')
  .post(function(req, res) {
    //console.log(req);
    Item.findOne({_id: req.params.id},function(err, item){
      if(err) res.send(err);
      var rate = new Rate();
      rate.value = parseInt(req.body['value']);
      rate.ipaddress = req.connection.remoteAddress;
      rate.item = req.params.id;
      rate.save(function(err) {
        if(err) res.send(err);
          item.rates.push(rate);
          item.save(function(err, item) {
            if(err) console.log(err);
            GetItemRating(item._id,function(err,rate){
              if(err) res.send(err);
              res.json({status: "OK", data: rate});
            });
          });
        });
    });
});
router.route('/profile/items')
.get(isAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if(!user) res.status(404).send('Profile items not found');
      Item.find({author: req.user})
      .populate('comments')
      .populate('images')
      .populate('author')
      .lean()
      .exec(function(err, items) {
        if(err) {
          res.send(err);
        }
        async.forEachOf(items, function(item, index, callback) {
          GetItemRating(item._id, function(err, rate) {
            if (err) return callback(err);
            try {
              items[index].rates = rate;
            } catch(e) {
              return callback(e);
            }
            callback();
          });
        }, function(err) {
        if(err) return next(err);
          res.json(items);
        });
      });
  });
});

function GetItemRating(id, callback) {
try {
  Rate.aggregate([
    {$match: {item: id}},
    {$group:
      {_id: "$item", avgRating: { $avg: "$value" } }
    }],
    function (err, result) {
      if (err) throw (err);
      if (result.length == 0) {
        callback(null, [{"_id": id,"avgRating":0}]);
      }
      else {
        callback(null,result);
      }
  });
}
catch (err) {
  callback(null, [{"_id": id,"avgRating":0}]);
}
}
module.exports=router;
