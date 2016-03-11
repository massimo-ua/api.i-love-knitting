var Item = require('../models/item')
    ,Comment = require('../models/comment')
    ,express = require('express')
    ,router=express.Router();

router.route('/items')
  .get(function(req, res) {
    //res.send('/api/items');
    Item.find({})
    .populate('comments')
    .exec(function(err, items) {
      if(err) {
        res.send(err);
      }
      res.json(items);
    });
  });
router.route('/items/:id')
.get(function(req, res){
  Item.findOne({_id: req.params.id})
  .populate({
    path: 'comments',
    match: {isDisabled: false},
    options: { sort: '-datePublished' }
   })
  .exec(function(err, item){
    if(err) res.send(err);
    res.json(item);
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
module.exports=router;
