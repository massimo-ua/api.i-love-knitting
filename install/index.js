var mongoose = require('mongoose')
   ,Item    = require('../models/item');


module.exports.generateItem=function(){
           var item=new Item();
           item.title="First item";
           item.content="First item content";
           item.author = 1;
           item.save();
}
