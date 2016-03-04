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

});
module.exports=router;
