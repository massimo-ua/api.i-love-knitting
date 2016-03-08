var Item = require('../models/item');
var express = require('express');
var router=express.Router();

router.route('/items')
  .get(function(req, res) {
    //res.send('/api/items');
    Item.find(function(err, items) {
      if(err) {
        res.send(err);
      }
      res.json(items);
    });
  });
router.route('/items/:id')
.get(function(req, res){
  Item.findOne({_id: req.params.id},function(err, item){
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
module.exports=router;
