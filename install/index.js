var mongoose = require('mongoose')
   ,Item    = require('../models/item')
   ,Comment    = require('../models/comment');


module.exports.generateItem=function(){
      //Item.find({title: 'First item'},function(err,item){
      //  if(err) console.log(err);
      for (i = 1; i < 6; i++) {
           var item=new Item();
           item.title="Item #" + i;
           item.content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
           item.author = 1;
           item.images = [{title:'#'+i+' image title',url:'/public/images/'+i+'pic.jpg'}];
           item.save(function(err){
             if(err) console.log(err);
             var comment = new Comment();
             comment.content = 'first comment';
             comment.author = 'admin';
             comment.item = item._id;
             comment.save(function(err) {
               if(err) console.log(err);
               item.comments.push(comment);
               item.save(function(err){
                 if(err) console.log(err);
               });
             });
             console.log('Item Created Successfully!');
           });
      }
      // });
}
