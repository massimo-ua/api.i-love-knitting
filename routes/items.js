var Item = require('../models/item')
    ,Comment = require('../models/comment')
    ,Rate = require('../models/rate')
    ,express = require('express')
    ,async = require('async')
    ,router=express.Router();

router.route('/items')
  .get(function(req, res) {
    //res.send('/api/items');
    Item.find({})
    .populate('comments')
    .lean()
    .exec(function(err, items) {
      if(err) {
        res.send(err);
      }
      async.forEachOf(items, function(item, index, cb){
        GetItemRating(item._id,function(err,rate){
          if(err) console.log(err);
          items[index].rates = rate;
          cb(err);
        });
      }, function(err) {
        res.json(items);
      });
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
      if (result.length == 0) callback(null, [{"_id": id,"avgRating":0}]);
      callback(null,result);
  });
}
catch (err) {
  callback(null, [{"_id": id,"avgRating":0}]);
}
}
module.exports=router;
