var Item = require('../models/item')
    ,Comment = require('../models/comment')
    ,Rate = require('../models/rate')
    ,express = require('express')
    ,async = require('async')
    ,router=express.Router();
function isLoggedIn(req, res, next) {
  //todo update code when auth will be set up
  next();
}
router.route('/items')
  .get(function(req, res, next) {
    //res.send('/api/items');
    Item.find({})
    .populate('comments')
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
        res.json({status: "OK", data: items});
      });
    });
  })
  .post(function(req, res, next) {
    var item = new Item(req.body);

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
  .exec(function(err, item){
    if(err) res.send(err);
    GetItemRating(item._id,function(err,rate){
      if(err) res.send(err);
      item.rates = rate;
      res.json({status: "OK", data: item});
    });
  });

})
.put(function(req, res) {
  Item.findOne({_id: req.params.id},function(err, item){
    if(err) res.send(err);
      for(property in req.body) {
        console.log(req.body);
        item[property] = req.body[property];
      }
      item.save(function(err) {
        if(err) res.send(err);
        res.json({status: "OK"});
      });
  });
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
